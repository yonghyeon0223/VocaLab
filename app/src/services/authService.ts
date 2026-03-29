import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import api, { ASYNC_STORAGE_KEYS } from './api';

// 회원가입 1단계 — 이메일만 전송해 중복 확인 + 인증 코드 발송을 요청한다.
// 비밀번호는 이메일 인증 완료 단계(verifyEmail)에서 함께 보낸다.
export async function register(email: string) {
  await api.post('/api/auth/register', { email });
}

// 인증 코드 재발송 — 1분 쿨다운은 서버가 강제하므로 클라이언트는 그냥 요청한다.
export async function sendVerification(email: string) {
  await api.post('/api/auth/send-verification', { email });
}

// 회원가입 2단계 — 코드 검증 후 비밀번호를 설정하고 즉시 로그인 처리한다.
// 성공하면 서버가 발급한 토큰을 authStore와 AsyncStorage에 각각 저장한다.
export async function verifyEmail(email: string, password: string, code: string) {
  const res = await api.post('/api/auth/verify-email', { email, password, code });
  const { accessToken, refreshToken } = res.data.data as {
    accessToken: string;
    refreshToken: string;
  };

  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  useAuthStore.getState().setAccessToken(accessToken);
}

// 로그인 성공 시 두 토큰을 각각 적절한 저장소에 보관한다.
// Access Token → Zustand store (메모리, 빠른 접근)
// Refresh Token → AsyncStorage (영구 저장, 앱 재실행에도 유지)
export async function login(email: string, password: string) {
  const res = await api.post('/api/auth/login', { email, password });
  const { accessToken, refreshToken } = res.data.data as {
    accessToken: string;
    refreshToken: string;
  };

  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  useAuthStore.getState().setAccessToken(accessToken);
}

// 앱 재실행 시 AsyncStorage에 Refresh Token이 있으면 자동 로그인을 시도한다.
// 실패하면 저장된 토큰을 지우고 조용히 종료한다 (로그인 화면으로 이동).
export async function tryAutoLogin() {
  const refreshToken = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return;

  try {
    const res = await api.post('/api/auth/refresh', { refreshToken });
    const { accessToken } = res.data.data as { accessToken: string };
    useAuthStore.getState().setAccessToken(accessToken);
  } catch {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN);
  }
}

// 로그아웃 시 서버와 클라이언트 양쪽에서 토큰을 모두 제거한다.
// 서버 요청이 실패해도 클라이언트 토큰은 반드시 지워 로그아웃 상태를 보장한다.
export async function logout() {
  try {
    await api.post('/api/auth/logout');
  } finally {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN);
    useAuthStore.getState().clearAuth();
  }
}
