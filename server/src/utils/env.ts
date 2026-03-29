import dotenv from 'dotenv';

dotenv.config();

// 서버 실행에 필요한 환경변수를 한 곳에서 관리한다.
// 값이 없으면 서버 시작 전에 바로 알 수 있도록 여기서 검증한다.
export const ENV = {
  PORT: process.env.PORT ?? '3000',
  MONGO_URI: process.env.MONGO_URI ?? '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? '',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '365d',
  EMAIL_USER: process.env.EMAIL_USER ?? '',
  EMAIL_PASS: process.env.EMAIL_PASS ?? '',
} as const;
