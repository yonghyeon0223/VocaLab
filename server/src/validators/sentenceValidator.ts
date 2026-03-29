import { z } from 'zod';

// query string으로 오는 level 값을 숫자로 변환하고 1~10 범위를 검증한다.
export const testSentencesQuerySchema = z.object({
  level: z.coerce.number().int().min(1).max(10),
});
