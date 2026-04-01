import { NextFunction, Request, Response } from 'express';
import * as wordSetService from '../services/wordSetService';
import { createWordSetSchema, extractWordsSchema } from '../validators/wordSetValidator';
import { AppError } from '../utils/AppError';

// AI 단어 추출 (단어 + 뜻 + 품사 한 번에)
export async function extractWords(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const data = extractWordsSchema.parse(req.body);
    const result = await wordSetService.extractWords(req.userId, data);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// 세트 생성
export async function createWordSet(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const data = createWordSetSchema.parse(req.body);
    const wordSet = await wordSetService.createWordSet(
      req.userId, data.name, data.source, data.words,
    );

    res.status(201).json({ success: true, data: { wordSet } });
  } catch (err) {
    next(err);
  }
}

// 세트 목록 조회
export async function getWordSets(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const wordSets = await wordSetService.getWordSets(req.userId);
    res.json({ success: true, data: { wordSets } });
  } catch (err) {
    next(err);
  }
}

// 세트 상세 조회
export async function getWordSetDetail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const wordSet = await wordSetService.getWordSetDetail(req.userId, req.params.id);
    res.json({ success: true, data: { wordSet } });
  } catch (err) {
    next(err);
  }
}

// 세트 삭제
export async function deleteWordSet(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    await wordSetService.deleteWordSet(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
