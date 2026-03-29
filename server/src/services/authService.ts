import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import * as userRepository from '../repositories/userRepository';
import * as pendingRepo from '../repositories/pendingVerificationRepository';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/mailer';
import { generateVerificationCode } from '../utils/verificationCode';

const BCRYPT_ROUNDS = 12;
const CODE_EXPIRES_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;
const MAX_LOGIN_ATTEMPTS = 20;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5분
const RESEND_COOLDOWN_MS = 60 * 1000;   // 1분

// 회원가입 1단계.
// email만 받아 중복 확인 후 인증 코드를 발송한다.
// 비밀번호는 이 단계에서 서버로 오지 않는다.
export async function register(email: string) {
  const normalized = email.toLowerCase();

  // 이미 가입된 이메일이면 여기서 멈춘다.
  const existing = await userRepository.findByEmail(normalized);
  if (existing) {
    throw new AppError('EMAIL_ALREADY_EXISTS', 409, '이미 사용 중인 이메일입니다');
  }

  await issueAndSendCode(normalized);
}

// 인증 코드 재발송.
// pendingVerifications에 없는 이메일은 200 반환한다 — 이메일 존재 여부를 노출하지 않는다.
// 1분 이내 재발송 요청은 429로 차단한다.
export async function sendVerification(email: string) {
  const normalized = email.toLowerCase();

  const pending = await pendingRepo.findByEmail(normalized);
  if (!pending) return; // 스팸 방지: 조용히 성공 처리

  // createdAt 기준으로 1분이 지나지 않았으면 차단한다.
  const elapsed = Date.now() - pending.createdAt.getTime();
  if (elapsed < RESEND_COOLDOWN_MS) {
    throw new AppError('TOO_MANY_REQUESTS', 429, '1분 후 다시 시도해주세요');
  }

  await issueAndSendCode(normalized);
}

// 코드 생성 → 해싱 → upsert → 이메일 발송을 묶은 내부 함수.
// register와 sendVerification이 같은 흐름을 공유한다.
async function issueAndSendCode(email: string) {
  const code = generateVerificationCode();
  const hashedCode = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000);

  await pendingRepo.upsert({ email, hashedCode, expiresAt });
  await sendVerificationEmail(email, code);
}

// 이메일 인증 완료 (회원가입 2단계).
// code 검증 → password 해싱 → users 삽입 → 토큰 발급 순서로 진행한다.
export async function verifyEmail(email: string, password: string, code: string) {
  const normalized = email.toLowerCase();

  const pending = await pendingRepo.findByEmail(normalized);

  // document가 없거나 만료됐거나 시도 횟수를 초과한 경우 모두 410으로 처리한다.
  if (!pending || pending.expiresAt < new Date() || pending.attempts >= MAX_CODE_ATTEMPTS) {
    throw new AppError('CODE_EXPIRED', 410, '인증 코드가 만료됐습니다. 재발송해주세요');
  }

  const isMatch = await bcrypt.compare(code, pending.hashedCode);
  if (!isMatch) {
    await pendingRepo.incrementAttempts(normalized);
    throw new AppError(
      'CODE_MISMATCH',
      400,
      `인증 코드가 올바르지 않습니다 (${pending.attempts + 1}/${MAX_CODE_ATTEMPTS})`,
    );
  }

  // userId를 먼저 확보하기 위해 임시 Refresh Token 없이 users에 삽입한다.
  // 삽입 후 실제 userId로 토큰을 발급하고 DB를 업데이트한다.
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const userId = await userRepository.insertUser({
    email: normalized,
    password: hashedPassword,
    refreshToken: '', // 아래에서 실제 값으로 교체한다
  });

  const accessToken = signAccessToken(userId.toString());
  const refreshToken = signRefreshToken(userId.toString());

  // Refresh Token도 평문을 DB에 저장하지 않는다.
  // 탈취당해도 원본 토큰을 복원할 수 없게 해싱해서 저장한다.
  const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
  await userRepository.updateRefreshToken(userId, hashedRefreshToken);

  // 인증이 완료됐으므로 임시 데이터를 즉시 삭제한다.
  await pendingRepo.deleteByEmail(normalized);

  return { accessToken, refreshToken };
}

// 로그인.
// 이메일 소문자 정규화 → 잠금 확인 → 비밀번호 검증 → 실패/성공 처리 순서로 진행한다.
export async function login(email: string, password: string) {
  const normalized = email.toLowerCase();

  const user = await userRepository.findByEmail(normalized);
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 401, '이메일 또는 비밀번호를 확인해주세요');
  }

  const userId = user._id as ObjectId;
  const now = new Date();

  // 잠금 상태 확인.
  // lockedUntil이 아직 지나지 않았으면 차단하고, 지났으면 초기화 후 계속 진행한다.
  if (user.lockedUntil) {
    if (user.lockedUntil > now) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 60000);
      throw new AppError('ACCOUNT_LOCKED', 403, `${minutesLeft}분 후 다시 시도해주세요`);
    }
    await userRepository.resetLoginAttempts(userId);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await userRepository.incrementLoginAttempts(userId);

    // 20회 도달 시 잠금을 설정한다. 카운트 증가 후에 판단해야 정확한 횟수다.
    const newAttempts = (user.loginAttempts ?? 0) + 1;
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      await userRepository.lockUser(userId, new Date(now.getTime() + LOCK_DURATION_MS));
      throw new AppError('ACCOUNT_LOCKED', 403, '로그인 시도 횟수를 초과했습니다. 5분 후 다시 시도해주세요');
    }

    throw new AppError('INVALID_CREDENTIALS', 401, '이메일 또는 비밀번호를 확인해주세요');
  }

  // 로그인 성공 시 attempts를 초기화하고 토큰을 발급한다.
  await userRepository.resetLoginAttempts(userId);

  const accessToken = signAccessToken(userId.toString());
  const refreshToken = signRefreshToken(userId.toString());
  const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
  await userRepository.updateRefreshToken(userId, hashedRefreshToken);

  return { accessToken, refreshToken };
}

// Access Token 재발급 (Rotation 전략).
// Refresh Token 서명 검증 → DB 해싱 비교 → 성공 시 새 토큰 발급 + 기존 폐기 순서로 진행한다.
// DB 값과 불일치하면 탈취로 간주해 refreshToken을 null로 초기화한다.
export async function refresh(refreshToken: string) {
  // 서명 검증으로 userId를 꺼낸다. 만료됐거나 위조된 토큰이면 여기서 차단된다.
  let userId: string;
  try {
    const payload = verifyRefreshToken(refreshToken);
    userId = payload.userId;
  } catch {
    throw new AppError('INVALID_TOKEN', 401, '다시 로그인해주세요');
  }

  const user = await userRepository.findById(new ObjectId(userId));
  if (!user || !user.refreshToken) {
    throw new AppError('INVALID_TOKEN', 401, '다시 로그인해주세요');
  }

  // DB에 해싱된 값과 클라이언트가 보낸 평문을 비교한다.
  const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isMatch) {
    // 불일치 = 탈취 가능성. 저장된 토큰을 즉시 폐기해 해당 계정의 모든 세션을 차단한다.
    await userRepository.updateRefreshToken(new ObjectId(userId), null);
    throw new AppError('INVALID_TOKEN', 401, '다시 로그인해주세요');
  }

  // Rotation: 새 Access Token + 새 Refresh Token 발급, 기존 Refresh Token 즉시 폐기
  const newAccessToken = signAccessToken(userId);
  const newRefreshToken = signRefreshToken(userId);
  const hashedNewRefresh = await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS);
  await userRepository.updateRefreshToken(new ObjectId(userId), hashedNewRefresh);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// 로그아웃.
// DB의 refreshToken을 null로 초기화해 해당 토큰을 즉시 무효화한다.
export async function logout(userId: string) {
  await userRepository.updateRefreshToken(new ObjectId(userId), null);
}
