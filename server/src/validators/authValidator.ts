import { z } from 'zod';

// 회원가입 요청 검증.
// 비밀번호 확인 일치 여부는 refine으로 마지막에 검사한다.
export const registerSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다').max(254),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .max(72, '비밀번호는 최대 72자까지 가능합니다')
      .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
      .regex(/[0-9]/, '숫자를 포함해야 합니다'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

// 로그인 요청 검증.
// 실패 원인을 구체적으로 알려주지 않아야 보안상 안전하므로
// 형식만 확인하고 실제 인증은 서비스 레이어에서 처리한다.
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// 토큰 갱신 요청 검증
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
