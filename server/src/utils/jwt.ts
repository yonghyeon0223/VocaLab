import jwt from 'jsonwebtoken';
import { ENV } from './env';

type AccessTokenPayload = {
  userId: string;
};

// Access Token: 24시간 유효, 요청마다 헤더에 담아 보낸다.
export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// Refresh Token: 365일 유효, DB에 저장해두고 Access Token 재발급 시 사용한다.
export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// Access Token을 검증하고 payload를 반환한다.
// 만료되거나 위조된 토큰이면 jwt 라이브러리가 에러를 던진다.
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

// Refresh Token을 검증하고 payload를 반환한다.
export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as AccessTokenPayload;
}
