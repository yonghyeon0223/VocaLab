import { NextFunction, Request, Response } from 'express';
import * as profileService from '../services/profileService';
import { updateProfileSchema } from '../validators/profileValidator';
import { AppError } from '../utils/AppError';

// 프로필 조회. 민감 필드 제외 후 반환.
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    }
    const profile = await profileService.getProfile(req.userId);
    res.json({ success: true, data: { profile } });
  } catch (err) {
    next(err);
  }
}

// 프로필 필드 부분 업데이트.
// authenticate 미들웨어를 통과한 요청이므로 req.userId가 반드시 존재한다.
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    }
    const data = updateProfileSchema.parse(req.body);
    const user = await profileService.updateProfile(req.userId, data);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// 프로필 설정 완료 처리.
// profileCompleted: true로 변경해 메인 앱 진입을 허용한다.
export async function completeProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    }
    await profileService.completeProfile(req.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
