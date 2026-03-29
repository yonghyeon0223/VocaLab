import { create } from 'zustand';

// 회원가입 2단계 흐름에서 화면 간 공유가 필요한 데이터를 임시 보관한다.
// SignupScreen에서 입력한 이메일/비밀번호를 VerifyEmailScreen에서 꺼내 쓴다.
// 회원가입이 완료되거나 취소되면 반드시 clear를 호출해 민감 정보를 지운다.
type SignupState = {
  email: string;
  password: string;
  setSignupData: (email: string, password: string) => void;
  clearSignupData: () => void;
};

export const useSignupStore = create<SignupState>((set) => ({
  email: '',
  password: '',

  setSignupData: (email, password) => set({ email, password }),

  clearSignupData: () => set({ email: '', password: '' }),
}));
