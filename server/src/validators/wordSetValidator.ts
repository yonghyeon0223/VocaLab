import { z } from 'zod';

// 단어 추출 요청 스키마 — wordCount 추가 (1~100)
export const extractWordsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, '텍스트를 입력해주세요').max(50000),
    wordCount: z.number().int().min(1).max(100),
  }),
  z.object({
    type: z.literal('photo'),
    images: z.array(z.string()).min(1).max(10),
    wordCount: z.number().int().min(1).max(100),
  }),
]);

const meaningSchema = z.object({
  definition: z.string(),
  meaning: z.string(),
  partOfSpeech: z.string(),
});

const wordSchema = z.object({
  spelling: z.string(),
  meanings: z.array(meaningSchema).min(1),
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
  words: z.array(wordSchema).min(1).max(100),
});

export type ExtractWordsInput = z.infer<typeof extractWordsSchema>;
export type CreateWordSetInput = z.infer<typeof createWordSetSchema>;
