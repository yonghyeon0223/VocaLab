import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

type WordMeaningDoc = {
  definition: string;
  meaning: string;
  partOfSpeech: string;
};

type WordDoc = {
  spelling: string;
  meanings: WordMeaningDoc[];
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

// 목록 조회 시 words 배열 대신 단어 수만 반환한다.
export async function findByUserId(userId: ObjectId) {
  return col()
    .aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      { $addFields: { wordCount: { $size: { $ifNull: ['$words', []] } } } },
      { $project: { words: 0 } },
    ])
    .toArray();
}

export async function findByIdAndUserId(setId: ObjectId, userId: ObjectId) {
  return col().findOne({ _id: setId, userId });
}

export async function updateName(setId: ObjectId, name: string) {
  return col().findOneAndUpdate(
    { _id: setId },
    { $set: { name, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
}

export async function deleteById(setId: ObjectId) {
  await col().deleteOne({ _id: setId });
}
