import { z } from 'zod';

// 단어 추출 요청 스키마 (텍스트 or 사진)
export const extractWordsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, '텍스트를 입력해주세요').max(50000, '최대 50,000자까지 입력 가능합니다'),
  }),
  z.object({
    type: z.literal('photo'),
    images: z.array(z.string()).min(1, '최소 1장의 사진이 필요합니다').max(10, '최대 10장까지 가능합니다'),
  }),
]);

// 뜻 추출 요청 스키마
export const extractMeaningsSchema = z.object({
  words: z.array(z.string()).min(1, '최소 1개의 단어가 필요합니다').max(1000),
});

// 단어 세트 생성 요청 스키마 (Sprint 05 변경: words 배열에 meaning/partOfSpeech 내장)
const wordSchema = z.object({
  spelling: z.string(),
  meaning: z.string(),
  partOfSpeech: z.string(),
});

export const createWordSetSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z.string()
        .min(1, '세트 이름을 입력해주세요')
        .max(30, '세트 이름은 30자 이하로 입력해주세요'),
    ),
  source: z.enum(['manual', 'photo']),
  words: z.array(wordSchema).min(1, '최소 1개의 단어가 필요합니다').max(1000, '최대 1,000개까지 가능합니다'),
});

export type ExtractWordsInput = z.infer<typeof extractWordsSchema>;
export type ExtractMeaningsInput = z.infer<typeof extractMeaningsSchema>;
export type CreateWordSetInput = z.infer<typeof createWordSetSchema>;
