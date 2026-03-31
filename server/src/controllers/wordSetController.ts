import { NextFunction, Request, Response } from 'express';
import * as wordSetService from '../services/wordSetService';
import { createWordSetSchema } from '../validators/wordSetValidator';
import { AppError } from '../utils/AppError';

// 세트 생성: 이름 + 단어 배열을 받아 DB에 저장한다.
export async function createWordSet(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const data = createWordSetSchema.parse(req.body);
    const wordSet = await wordSetService.createWordSet(req.userId, data.name, data.words);

    res.status(201).json({ success: true, data: { wordSet } });
  } catch (err) {
    next(err);
  }
}

// 유저의 모든 세트를 최신순으로 조회한다.
export async function getWordSets(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const wordSets = await wordSetService.getWordSets(req.userId);
    res.json({ success: true, data: { wordSets } });
  } catch (err) {
    next(err);
  }
}

// 세트 상세 조회: 세트 정보 + 소속 단어 목록.
export async function getWordSetDetail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const { wordSet, words } = await wordSetService.getWordSetDetail(req.userId, req.params.id);
    res.json({ success: true, data: { wordSet, words } });
  } catch (err) {
    next(err);
  }
}

// 세트 삭제: 소속 단어와 함께 삭제한다.
export async function deleteWordSet(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    await wordSetService.deleteWordSet(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
