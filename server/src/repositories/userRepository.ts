import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

function col() {
  return getDB().collection('users');
}

// users 컬렉션 인덱스 설정. 서버 시작 시 한 번만 호출한다.
export async function ensureIndexes() {
  await col().createIndex({ email: 1 }, { unique: true });
}

export async function findByEmail(email: string) {
  return col().findOne({ email });
}

export async function findById(userId: ObjectId) {
  return col().findOne({ _id: userId });
}

export async function insertUser(data: {
  email: string;
  password: string;
  refreshToken: string; // 삽입 시점에 이미 bcrypt 해싱된 값
}) {
  const now = new Date();
  const result = await col().insertOne({
    email: data.email,
    password: data.password,
    refreshToken: data.refreshToken,
    loginAttempts: 0,
    lockedUntil: null,
    profileCompleted: false,
    nickname: '',
    purposes: [],
    easyLevel: 0,
    activeLevel: 0,
    hardLevel: 0,
    levelRatings: {},
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId;
}

// Refresh Token을 교체한다.
// null이면 로그아웃, 문자열이면 bcrypt 해싱된 새 토큰이다.
export async function updateRefreshToken(userId: ObjectId, hashedToken: string | null) {
  await col().updateOne(
    { _id: userId },
    { $set: { refreshToken: hashedToken, updatedAt: new Date() } },
  );
}

// 로그인 실패 시 attempts를 1 증가시킨다.
export async function incrementLoginAttempts(userId: ObjectId) {
  await col().updateOne(
    { _id: userId },
    { $inc: { loginAttempts: 1 }, $set: { updatedAt: new Date() } },
  );
}

// 20회 실패 시 5분 잠금을 설정한다.
export async function lockUser(userId: ObjectId, until: Date) {
  await col().updateOne(
    { _id: userId },
    { $set: { lockedUntil: until, updatedAt: new Date() } },
  );
}

// 로그인 성공 또는 잠금 해제 시 attempts와 lockedUntil을 초기화한다.
export async function resetLoginAttempts(userId: ObjectId) {
  await col().updateOne(
    { _id: userId },
    { $set: { loginAttempts: 0, lockedUntil: null, updatedAt: new Date() } },
  );
}
