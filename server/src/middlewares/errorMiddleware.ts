import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

// 모든 에러를 한 곳에서 처리한다.
// AppError는 의도된 비즈니스 에러, ZodError는 입력값 검증 실패,
// 나머지는 예상치 못한 서버 에러로 구분해 응답한다.
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: err.errors[0]?.message ?? '입력값을 확인해주세요',
    });
    return;
  }

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: '서버 오류가 발생했습니다',
  });
}
