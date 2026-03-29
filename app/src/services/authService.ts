import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import api, { ASYNC_STORAGE_KEYS } from './api';

// 회원가입 후 바로 로그인 처리는 하지 않는다.
// 회원가입과 로그인을 분리해 사용자가 명시적으로 로그인하게 한다.
export async function register(email: string, password: string, passwordConfirm: string) {
  const res = await api.post('/api/auth/register', { email, password, passwordConfirm });
  return res.data.data as { userId: string };
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
