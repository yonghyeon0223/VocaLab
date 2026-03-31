import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useLevelTestStore } from '../stores/levelTestStore';
import { useWordSetStore } from '../stores/wordSetStore';

const REFRESH_TOKEN_KEY = 'refreshToken';

export const ASYNC_STORAGE_KEYS = {
  REFRESH_TOKEN: REFRESH_TOKEN_KEY,
} as const;

// 모든 API 요청에 공통으로 쓰는 Axios 인스턴스.
// baseURL은 환경변수에서 읽는다.
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

// 요청 인터셉터 — Access Token을 자동으로 헤더에 붙인다.
// store에서 직접 읽어서, 토큰이 갱신돼도 항상 최신 값을 쓴다.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 401이 오면 Refresh Token으로 재발급 후 원래 요청을 재시도한다.
// 재발급도 실패하면 로그아웃 처리한다.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이고 아직 재시도하지 않은 요청만 처리한다.
    // _retry 플래그로 무한 루프를 막는다.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken },
        );
        const newAccessToken: string = res.data.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 새 토큰으로 원래 요청을 다시 보낸다.
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        // 재발급도 실패하면 두 토큰을 모두 지우고 로그인 화면으로 보낸다.
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        useAuthStore.getState().clearAuth();
        useLevelTestStore.getState().reset();
        useWordSetStore.getState().reset();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
