import { getDB } from '../utils/db';

function col() {
  return getDB().collection('testSentences');
}

// 해당 레벨의 예문 전체를 반환한다. 레벨당 3개.
export async function findByLevel(level: number) {
  return col().find({ level }).toArray();
}

// testSentences 컬렉션이 비어있으면 시드 데이터를 삽입한다.
// 서버 시작 시 한 번만 호출된다.
export async function seedIfEmpty(
  sentences: Array<{ level: number; text: string; translation: string }>,
) {
  const count = await col().countDocuments();
  if (count === 0) {
    await col().insertMany(sentences);
    console.log(`testSentences 시드 데이터 ${sentences.length}개 삽입 완료`);
  }
}
