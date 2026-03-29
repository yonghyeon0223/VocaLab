import { z } from 'zod';

// 회원가입 1단계: 이메일만 받는다.
// 비밀번호는 클라이언트 메모리에만 존재하고 서버로 오지 않는다.
export const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').max(254),
});

// 인증 코드 재발송 요청
export const sendVerificationSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').max(254),
});

// 이메일 인증 완료: email + password + code를 한 번에 받는다.
// 비밀번호가 서버로 오는 유일한 시점이다.
export const verifyEmailSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(72, '비밀번호는 최대 72자까지 가능합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  code: z.string().length(6, '인증 코드는 6자리입니다'),
});

// 로그인
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Refresh Token 재발급
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SendVerificationInput = z.infer<typeof sendVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
