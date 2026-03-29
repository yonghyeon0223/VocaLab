import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  sendVerificationSchema,
  verifyEmailSchema,
} from '../validators/authValidator';
import { AppError } from '../utils/AppError';

// 회원가입 1단계 — 이메일 중복 확인 후 인증 코드 발송
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = registerSchema.parse(req.body);
    await authService.register(email);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

// 인증 코드 재발송
export async function sendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = sendVerificationSchema.parse(req.body);
    await authService.sendVerification(email);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// 이메일 인증 완료 (회원가입 2단계) — 코드 검증 후 users 삽입 + 토큰 발급
export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, code } = verifyEmailSchema.parse(req.body);
    const data = await authService.verifyEmail(email, password, code);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 로그인
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await authService.login(email, password);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Access Token 재발급 (Rotation)
// authenticate 미들웨어를 통과한 요청이므로 req.userId가 존재한다.
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const data = await authService.refresh(refreshToken);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 로그아웃 — DB에서 Refresh Token 무효화
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    }
    await authService.logout(req.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
