import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

// Express Request에 userId를 추가한다.
// 인증 미들웨어를 통과한 요청에서만 userId를 사용할 수 있다.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Authorization 헤더에서 Bearer 토큰을 꺼내 검증한다.
// 유효하면 req.userId에 담아 다음 핸들러로 넘기고,
// 그렇지 않으면 401을 반환해 요청을 차단한다.
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 401, '인증이 필요합니다');
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    throw new AppError('UNAUTHORIZED', 401, '인증이 필요합니다');
  }
}
