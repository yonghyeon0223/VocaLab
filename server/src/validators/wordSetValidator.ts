import { z } from 'zod';

// 단어 세트 생성 요청 스키마.
// 클라이언트에서도 동일한 규칙을 적용해야 서버 에러가 엉뚱한 화면에 노출되지 않는다.
export const createWordSetSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z.string()
        .min(1, '세트 이름을 입력해주세요')
        .max(30, '세트 이름은 30자 이하로 입력해주세요'),
    ),
  words: z
    .array(z.string())
    .min(5, '최소 5개의 단어가 필요해요')
    .max(200, '최대 200개까지 입력할 수 있어요'),
});

export type CreateWordSetInput = z.infer<typeof createWordSetSchema>;
