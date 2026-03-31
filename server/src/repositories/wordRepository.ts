import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db';

function col() {
  return getDB().collection('words');
}

// words 컬렉션 인덱스 설정. 세트별 단어 조회를 빠르게 한다.
export async function ensureIndexes() {
  await col().createIndex({ wordSetId: 1 });
}

// 단어 목록을 일괄 삽입한다. 세트 생성 시 한 번에 호출된다.
export async function insertMany(data: {
  wordSetId: ObjectId;
  userId: ObjectId;
  spellings: string[];
}) {
  const now = new Date();
  const docs = data.spellings.map((spelling) => ({
    wordSetId: data.wordSetId,
    userId: data.userId,
    spelling,
    createdAt: now,
  }));
  await col().insertMany(docs);
}

// 특정 세트에 속한 모든 단어를 가져온다.
export async function findByWordSetId(wordSetId: ObjectId) {
  return col().find({ wordSetId }).toArray();
}

// 특정 세트의 모든 단어를 삭제한다. 세트 삭제 시 함께 호출된다.
export async function deleteByWordSetId(wordSetId: ObjectId) {
  await col().deleteMany({ wordSetId });
}
