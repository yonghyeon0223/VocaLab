import { NextFunction, Request, Response } from 'express';
import * as wordSetService from '../services/wordSetService';
import { createWordSetSchema, extractSpellingsSchema, generateMeaningsSchema } from '../validators/wordSetValidator';
import { AppError } from '../utils/AppError';

// 호출 #1: 단어 추출 (spelling만)
export async function extractSpellings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const data = extractSpellingsSchema.parse(req.body);
    const { wordCount, ...input } = data;
    const result = await wordSetService.extractSpellings(req.userId, input, wordCount);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// 호출 #2: 뜻 생성
export async function generateMeanings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));

    const data = generateMeaningsSchema.parse(req.body);
    const result = await wordSetService.generateMeanings(data.originalText, data.spellings);

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

export async function getWordSets(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    const wordSets = await wordSetService.getWordSets(req.userId);
    res.json({ success: true, data: { wordSets } });
  } catch (err) {
    next(err);
  }
}

export async function getWordSetDetail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    const wordSet = await wordSetService.getWordSetDetail(req.userId, req.params.id);
    res.json({ success: true, data: { wordSet } });
  } catch (err) {
    next(err);
  }
}

export async function deleteWordSet(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('UNAUTHORIZED', 401, '인증이 필요합니다'));
    await wordSetService.deleteWordSet(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
