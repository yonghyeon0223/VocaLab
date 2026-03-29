import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

function col() {
  return getDB().collection('users');
}

type ProfileUpdateData = {
  nickname?: string;
  purposes?: string[];
  easyLevel?: number;
  activeLevel?: number;
  hardLevel?: number;
  levelRatings?: Record<string, string>;
};

// 전달된 필드만 업데이트한다.
// 화면 1~5가 각자 필요한 필드만 보내므로, 한 번에 전체를 덮어쓰지 않는다.
export async function updateProfile(userId: ObjectId, data: ProfileUpdateData) {
  const setFields: Record<string, unknown> = { updatedAt: new Date() };

  if (data.nickname !== undefined) setFields['nickname'] = data.nickname;
  if (data.purposes !== undefined) setFields['purposes'] = data.purposes;
  if (data.easyLevel !== undefined) setFields['easyLevel'] = data.easyLevel;
  if (data.activeLevel !== undefined) setFields['activeLevel'] = data.activeLevel;
  if (data.hardLevel !== undefined) setFields['hardLevel'] = data.hardLevel;
  if (data.levelRatings !== undefined) setFields['levelRatings'] = data.levelRatings;

  const result = await col().findOneAndUpdate(
    { _id: userId },
    { $set: setFields },
    { returnDocument: 'after' },
  );

  return result;
}

// 프로필 설정 완료 플래그를 true로 변경한다.
// 화면 6의 두 버튼("첫 단어 세트 만들기" / "나중에 할게요") 모두 이 함수를 호출한다.
export async function completeProfile(userId: ObjectId) {
  await col().updateOne(
    { _id: userId },
    { $set: { profileCompleted: true, updatedAt: new Date() } },
  );
}
