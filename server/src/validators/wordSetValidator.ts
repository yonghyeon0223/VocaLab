import { z } from 'zod';

// 호출 #1: 단어 추출 요청
export const extractSpellingsSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1).max(5000),
    wordCount: z.number().int().min(1).max(100),
  }),
  z.object({
    type: z.literal('photo'),
    images: z.array(z.string()).min(1).max(5),
    wordCount: z.number().int().min(1).max(100),
  }),
]);

// 호출 #2: 뜻 생성 요청
export const generateMeaningsSchema = z.object({
  originalText: z.string().min(1),
  spellings: z.array(z.string()).min(1).max(100),
});

// 세트 생성 요청
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
  name: z.string().transform((s) => s.trim()).pipe(
    z.string().min(1, '세트 이름을 입력해주세요').max(30, '세트 이름은 30자 이하로 입력해주세요'),
  ),
  source: z.enum(['manual', 'photo']),
  words: z.array(wordSchema).min(1).max(100),
});

export type ExtractSpellingsInput = z.infer<typeof extractSpellingsSchema>;
export type GenerateMeaningsInput = z.infer<typeof generateMeaningsSchema>;
export type CreateWordSetInput = z.infer<typeof createWordSetSchema>;
