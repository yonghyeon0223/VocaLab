import api from './api';
import { useProfileStore } from '../stores/profileStore';

type ProfileUpdateInput = {
  nickname?: string;
  purposes?: string[];
  easyLevel?: number;
  activeLevel?: number;
  hardLevel?: number;
  levelRatings?: Record<string, string>;
};

// 서버에서 프로필 전체를 가져와 store에 반영한다.
// 로그인 직후 또는 자동 로그인 시 호출한다.
export async function fetchProfile() {
  const res = await api.get('/api/users/profile');
  const profile = res.data.data.profile as {
    profileCompleted: boolean;
    nickname: string;
    purposes: string[];
    easyLevel: number;
    activeLevel: number;
    hardLevel: number;
  };

  const store = useProfileStore.getState();
  store.setProfile({ profileCompleted: profile.profileCompleted, nickname: profile.nickname });
  if (profile.purposes?.length) store.setPurposes(profile.purposes);
  if (profile.easyLevel) store.setLevels({
    easyLevel: profile.easyLevel,
    activeLevel: profile.activeLevel,
    hardLevel: profile.hardLevel,
  });
}

// 프로필 필드를 부분 업데이트한다.
// 성공하면 전달한 필드를 profileStore에도 반영해 UI가 최신 상태를 유지한다.
export async function updateProfile(data: ProfileUpdateInput) {
  const res = await api.patch('/api/users/profile', data);
  const user = res.data.data.user as {
    nickname?: string;
    purposes?: string[];
    easyLevel?: number;
    activeLevel?: number;
    hardLevel?: number;
  };

  const store = useProfileStore.getState();

  if (user.nickname !== undefined) {
    store.setNickname(user.nickname);
  }
  if (user.purposes !== undefined) {
    store.setPurposes(user.purposes);
  }
  if (
    user.easyLevel !== undefined &&
    user.activeLevel !== undefined &&
    user.hardLevel !== undefined
  ) {
    store.setLevels({
      easyLevel: user.easyLevel,
      activeLevel: user.activeLevel,
      hardLevel: user.hardLevel,
    });
  }
}

// 프로필 설정 완료 처리. 화면 6에서 두 버튼 모두 이 함수를 호출한다.
export async function completeProfile() {
  await api.patch('/api/users/profile/complete');
  useProfileStore.getState().setProfileCompleted();
}
