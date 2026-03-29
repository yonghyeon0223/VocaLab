import { NextFunction, Request, Response } from 'express';
import * as sentenceRepository from '../repositories/sentenceRepository';
import { testSentencesQuerySchema } from '../validators/sentenceValidator';

// 요청한 레벨의 예문 3개를 반환한다.
export async function getTestSentences(req: Request, res: Response, next: NextFunction) {
  try {
    const { level } = testSentencesQuerySchema.parse(req.query);
    const sentences = await sentenceRepository.findByLevel(level);
    res.json({ success: true, data: sentences });
  } catch (err) {
    next(err);
  }
}
