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

// 프로필 필드를 부분 업데이트한다.
// 성공하면 profileStore의 nickname도 함께 갱신해 UI가 최신 상태를 유지한다.
export async function updateProfile(data: ProfileUpdateInput) {
  const res = await api.patch('/api/users/profile', data);
  const user = res.data.data.user as { nickname?: string };

  if (user.nickname !== undefined) {
    useProfileStore.getState().setNickname(user.nickname);
  }
}

// 프로필 설정 완료 처리. 화면 6에서 두 버튼 모두 이 함수를 호출한다.
export async function completeProfile() {
  await api.patch('/api/users/profile/complete');
  useProfileStore.getState().setProfileCompleted();
}
