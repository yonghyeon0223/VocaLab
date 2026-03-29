import { create } from 'zustand';

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;

  // 로그인 성공 시 Access Token을 store에 저장한다.
  // Refresh Token은 AsyncStorage에만 보관하고 여기서는 다루지 않는다.
  setAccessToken: (token: string) => void;

  // 로그아웃 시 store를 초기 상태로 되돌린다.
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: true }),

  clearAuth: () =>
    set({ accessToken: null, isAuthenticated: false }),
}));
