import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService';
import { loginSchema, refreshSchema, registerSchema } from '../validators/authValidator';
import { AppError } from '../utils/AppError';

// 회원가입 요청 처리.
// 1. 요청 바디를 Zod로 검증한다
// 2. 실제 가입 처리는 authService에 맡긴다
// 3. 성공하면 201과 함께 생성된 userId를 돌려준다
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = registerSchema.parse(req.body);
    const data = await authService.register(body.email, body.password);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 로그인 요청 처리.
// 성공 시 Access Token과 Refresh Token을 함께 돌려준다.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const data = await authService.login(body.email, body.password);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Access Token 재발급 요청 처리.
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const body = refreshSchema.parse(req.body);
    const data = await authService.refresh(body.refreshToken);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 로그아웃 요청 처리.
// authMiddleware에서 이미 검증된 userId를 사용한다.
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      throw new AppError('UNAUTHORIZED', 401, '인증이 필요합니다');
    }
    await authService.logout(req.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
