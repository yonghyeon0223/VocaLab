import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

type WordDoc = {
  spelling: string;
  meaning: string;
  partOfSpeech: string;
};

function col() {
  return getDB().collection('wordSets');
}

export async function ensureIndexes() {
  await col().createIndex({ userId: 1, createdAt: -1 });
}

export async function insertWordSet(data: {
  userId: ObjectId;
  name: string;
  source: 'manual' | 'photo';
  words: WordDoc[];
}) {
  const now = new Date();
  const result = await col().insertOne({
    userId: data.userId,
    name: data.name,
    source: data.source,
    words: data.words,
    createdAt: now,
    updatedAt: now,
  });
  return {
    _id: result.insertedId,
    userId: data.userId,
    name: data.name,
    source: data.source,
    words: data.words,
    createdAt: now,
    updatedAt: now,
  };
}

// 목록 조회 시에는 words 배열을 제외해 전송량을 줄인다.
export async function findByUserId(userId: ObjectId) {
  return col()
    .find({ userId }, { projection: { words: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findByIdAndUserId(setId: ObjectId, userId: ObjectId) {
  return col().findOne({ _id: setId, userId });
}

export async function deleteById(setId: ObjectId) {
  await col().deleteOne({ _id: setId });
}
