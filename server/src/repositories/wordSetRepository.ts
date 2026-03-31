import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

function col() {
  return getDB().collection('wordSets');
}

// wordSets 컬렉션 인덱스 설정. 유저별 최신순 조회를 빠르게 한다.
export async function ensureIndexes() {
  await col().createIndex({ userId: 1, createdAt: -1 });
}

export async function insertWordSet(data: {
  userId: ObjectId;
  name: string;
  wordCount: number;
}) {
  const now = new Date();
  const result = await col().insertOne({
    userId: data.userId,
    name: data.name,
    wordCount: data.wordCount,
    createdAt: now,
    updatedAt: now,
  });
  return {
    _id: result.insertedId,
    userId: data.userId,
    name: data.name,
    wordCount: data.wordCount,
    createdAt: now,
    updatedAt: now,
  };
}

// 해당 유저의 모든 세트를 최신순으로 가져온다.
export async function findByUserId(userId: ObjectId) {
  return col().find({ userId }).sort({ createdAt: -1 }).toArray();
}

// 세트 하나를 조회한다. 소유권 확인을 위해 userId도 함께 사용한다.
export async function findByIdAndUserId(setId: ObjectId, userId: ObjectId) {
  return col().findOne({ _id: setId, userId });
}

// 세트를 삭제한다.
export async function deleteById(setId: ObjectId) {
  await col().deleteOne({ _id: setId });
}
