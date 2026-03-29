import { z } from 'zod';

// PATCH /api/users/profile 요청 스키마.
// 화면 1~5가 모두 이 엔드포인트를 공유하므로, 각 필드는 optional이다.
// 전달된 필드만 DB에 업데이트된다.
export const updateProfileSchema = z
  .object({
    nickname: z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1, '닉네임을 입력해주세요').max(10, '닉네임은 10자 이하로 입력해주세요'))
      .optional(),
    purposes: z
      .array(z.string())
      .min(1, '학습 목적을 1개 이상 선택해주세요')
      .max(5, '학습 목적은 최대 5개까지 선택 가능합니다')
      .optional(),
    easyLevel: z.number().int().min(1).max(10).optional(),
    activeLevel: z.number().int().min(1).max(10).optional(),
    hardLevel: z.number().int().min(1).max(10).optional(),
    levelRatings: z
      .record(z.string(), z.enum(['easy', 'appropriate', 'hard', 'alien']))
      .optional(),
  })
  .refine(
    (data) => {
      // easyLevel ≤ hardLevel 역전 방지. 같은 값은 허용한다.
      if (data.easyLevel !== undefined && data.hardLevel !== undefined) {
        return data.easyLevel <= data.hardLevel;
      }
      return true;
    },
    { message: '레벨 설정이 올바르지 않습니다' },
  );
