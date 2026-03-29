import { getDB } from '../utils/db';

function col() {
  return getDB().collection('pendingVerifications');
}

// pendingVerifications 컬렉션 인덱스 설정. 서버 시작 시 한 번만 호출한다.
// TTL 인덱스: createdAt 기준 24시간 후 MongoDB가 자동으로 document를 삭제한다.
// 인증을 완료하지 않고 방치된 데이터가 자동 정리되도록 보장한다.
export async function ensureIndexes() {
  await col().createIndex({ email: 1 }, { unique: true });
  await col().createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
}

export async function findByEmail(email: string) {
  return col().findOne({ email });
}

// 같은 이메일로 재발송 요청이 오면 기존 document를 덮어쓴다.
// upsert를 쓰는 이유: insert 후 update 두 번 치는 것보다 atomic하게 처리할 수 있다.
export async function upsert(data: {
  email: string;
  hashedCode: string;
  expiresAt: Date;
}) {
  const now = new Date();
  await col().updateOne(
    { email: data.email },
    {
      $set: {
        hashedCode: data.hashedCode,
        expiresAt: data.expiresAt,
        attempts: 0,
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

// 코드 불일치 시 attempts를 1 증가시킨다.
export async function incrementAttempts(email: string) {
  await col().updateOne(
    { email },
    { $inc: { attempts: 1 } },
  );
}

// 인증 완료 후 임시 데이터를 즉시 삭제한다.
// TTL 인덱스에 맡기지 않고 직접 삭제해 불필요한 데이터가 남지 않게 한다.
export async function deleteByEmail(email: string) {
  await col().deleteOne({ email });
}
