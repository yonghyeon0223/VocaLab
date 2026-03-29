import { create } from 'zustand';

// 프로필 설정 완료 여부와 기본 프로필 정보를 관리한다.
// isAuthenticated가 true이더라도 profileCompleted가 false이면 프로필 설정 플로우로 이동한다.
type ProfileState = {
  profileCompleted: boolean;
  nickname: string;

  // 로그인/회원가입/자동 로그인 성공 후 서버 응답으로 초기화한다.
  setProfile: (data: { profileCompleted: boolean; nickname?: string }) => void;

  // 닉네임만 업데이트할 때 사용한다 (화면 1 저장 후).
  setNickname: (nickname: string) => void;

  // 프로필 설정 완료 시 true로 변경한다 (화면 6).
  setProfileCompleted: () => void;

  // 로그아웃 시 상태를 초기화한다.
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profileCompleted: false,
  nickname: '',

  setProfile: (data) =>
    set({ profileCompleted: data.profileCompleted, nickname: data.nickname ?? '' }),

  setNickname: (nickname) => set({ nickname }),

  setProfileCompleted: () => set({ profileCompleted: true }),

  clearProfile: () => set({ profileCompleted: false, nickname: '' }),
}));
