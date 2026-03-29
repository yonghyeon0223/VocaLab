import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import * as userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

// 회원가입.
// 이미 가입된 이메일인지 먼저 확인하고, 통과하면 비밀번호를 암호화해 저장한다.
export async function register(email: string, password: string) {
  // 중복 이메일이면 DB에 저장하기 전에 여기서 멈춘다.
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('EMAIL_ALREADY_EXISTS', 409, '이미 사용 중인 이메일입니다');
  }

  // 비밀번호는 절대 그대로 저장하지 않는다.
  // 해킹으로 DB가 털려도 실제 비밀번호는 알 수 없게 암호화한다.
  const hashed = await bcrypt.hash(password, 12);
  const userId = await userRepository.insertUser({ email, password: hashed });

  return { userId: userId.toString() };
}

// 로그인.
// 이메일 존재 여부와 비밀번호 일치 여부를 확인한 뒤 토큰을 발급한다.
// 실패 원인을 구분해서 알려주면 이메일 존재 여부가 노출되므로 같은 메시지를 쓴다.
export async function login(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 401, '이메일 또는 비밀번호를 확인해주세요');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('INVALID_CREDENTIALS', 401, '이메일 또는 비밀번호를 확인해주세요');
  }

  // 두 토큰을 동시에 발급한다.
  // Refresh Token은 DB에 저장해야 로그아웃 시 무효화할 수 있다.
  const userId = (user._id as ObjectId).toString();
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await userRepository.updateRefreshToken(user._id as ObjectId, refreshToken);

  return { accessToken, refreshToken };
}

// Access Token 재발급.
// Refresh Token이 유효하고 DB에 저장된 값과 일치할 때만 새 Access Token을 발급한다.
// 두 조건을 모두 만족해야 하는 이유: 서명 검증만으로는 로그아웃된 사용자를 막을 수 없다.
export async function refresh(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('INVALID_TOKEN', 401, '다시 로그인해주세요');
  }

  // DB에 저장된 값과 일치하는지 확인해 로그아웃된 토큰을 걸러낸다.
  const user = await userRepository.findByIdAndRefreshToken(
    new ObjectId(payload.userId),
    refreshToken,
  );
  if (!user) {
    throw new AppError('INVALID_TOKEN', 401, '다시 로그인해주세요');
  }

  const accessToken = signAccessToken(payload.userId);
  return { accessToken };
}

// 로그아웃.
// DB에서 Refresh Token을 null로 초기화해 해당 토큰을 무효화한다.
// 이후 해당 Refresh Token으로 재발급 요청이 와도 DB 검증에서 차단된다.
export async function logout(userId: string) {
  await userRepository.updateRefreshToken(new ObjectId(userId), null);
}
