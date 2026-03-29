import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

// DB에서 users 컬렉션을 가져오는 헬퍼.
// 컬렉션 이름을 여러 곳에 하드코딩하지 않기 위해 한 곳에서 관리한다.
function col() {
  return getDB().collection('users');
}

// users 컬렉션에 email 유니크 인덱스를 생성한다.
// 서버 시작 시 한 번만 호출하면 된다.
// 이미 인덱스가 있으면 MongoDB가 무시하므로 중복 생성 걱정은 없다.
export async function ensureIndexes() {
  await col().createIndex({ email: 1 }, { unique: true });
}

export async function findByEmail(email: string) {
  return col().findOne({ email });
}

export async function findByIdAndRefreshToken(userId: ObjectId, refreshToken: string) {
  return col().findOne({ _id: userId, refreshToken });
}

export async function insertUser(data: {
  email: string;
  password: string;
}) {
  const now = new Date();
  const result = await col().insertOne({
    email: data.email,
    password: data.password,
    refreshToken: null,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId;
}

export async function updateRefreshToken(userId: ObjectId, refreshToken: string | null) {
  await col().updateOne(
    { _id: userId },
    { $set: { refreshToken, updatedAt: new Date() } },
  );
}
