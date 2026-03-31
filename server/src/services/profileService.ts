import { ObjectId } from 'mongodb';
import * as userProfileRepository from '../repositories/userProfileRepository';
import * as userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';

type ProfileUpdateInput = {
  nickname?: string;
  purposes?: string[];
  easyLevel?: number;
  activeLevel?: number;
  hardLevel?: number;
  levelRatings?: Record<string, string>;
};

// 프로필 조회. 비밀번호와 토큰 등 민감 필드를 제외하고 반환한다.
export async function getProfile(userId: string) {
  const user = await userRepository.findById(new ObjectId(userId));
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 404, '유저를 찾을 수 없습니다');
  }
  const { password, refreshToken, loginAttempts, lockedUntil, ...profile } = user;
  return profile;
}

// 프로필 필드를 부분 업데이트한다.
// 업데이트 후 변경된 유저 document를 반환해 클라이언트가 최신 상태를 유지할 수 있게 한다.
export async function updateProfile(userId: string, data: ProfileUpdateInput) {
  const updated = await userProfileRepository.updateProfile(new ObjectId(userId), data);
  if (!updated) {
    throw new AppError('USER_NOT_FOUND', 404, '유저를 찾을 수 없습니다');
  }
  return updated;
}

// profileCompleted를 true로 설정한다. 프로필 설정 플로우의 마지막 단계(화면 6)에서 호출된다.
export async function completeProfile(userId: string) {
  await userProfileRepository.completeProfile(new ObjectId(userId));
}
