import jwt from 'jsonwebtoken';
import { ENV } from './env';

type TokenPayload = {
  userId: string;
};

// Access Token: 24시간 유효. 모든 인증 요청 헤더에 담아 보낸다.
export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// Refresh Token: 365일 유효. Rotation 전략을 쓰므로 재발급마다 새 토큰을 발급한다.
// DB에는 이 평문을 bcrypt 해싱해서 저장한다.
export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// Access Token 서명 검증. 만료되거나 위조된 경우 예외를 던진다.
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;
}

// Refresh Token 서명 검증. 서명만 확인하고 DB 해싱 비교는 service에서 처리한다.
// 두 단계로 나눈 이유: 서명이 유효해도 DB 값과 불일치하면 탈취로 간주해 전체 폐기한다.
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;
}
