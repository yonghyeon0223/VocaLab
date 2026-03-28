import { MongoClient } from 'mongodb';
import { ENV } from './env';

let client: MongoClient | null = null;

// MongoDB 연결을 한 번만 만들고 재사용한다.
// 연결 객체를 모듈 수준에서 관리해서 매 요청마다 새로 연결하는 낭비를 막는다.
export async function connectDB(): Promise<MongoClient> {
  if (client) return client;

  client = new MongoClient(ENV.MONGO_URI);
  await client.connect();

  // 실제로 연결이 됐는지 ping으로 확인한다.
  await client.db('admin').command({ ping: 1 });
  console.log('MongoDB 연결에 성공했습니다.');

  return client;
}

export function getDB() {
  if (!client) throw new Error('DB가 아직 연결되지 않았습니다. connectDB()를 먼저 호출하세요.');
  return client.db('vocalab');
}
