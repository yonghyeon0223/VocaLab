import express from 'express';
import { ENV } from './utils/env';
import { connectDB } from './utils/db';
import { ensureIndexes as ensureUserIndexes } from './repositories/userRepository';
import { ensureIndexes as ensurePendingIndexes } from './repositories/pendingVerificationRepository';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import sentenceRouter from './routes/sentences';
import { seedIfEmpty } from './repositories/sentenceRepository';
import { TEST_SENTENCES } from './seeds/testSentences';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();

app.use(express.json());

// 서버가 살아있는지 확인하는 기본 엔드포인트
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 인증 관련 엔드포인트 (/api/auth/*)
app.use('/api/auth', authRouter);

// 유저 프로필 엔드포인트 (/api/users/*)
app.use('/api/users', profileRouter);

// 예문 엔드포인트 (/api/sentences/*)
app.use('/api/sentences', sentenceRouter);

// 모든 라우터 아래에 에러 핸들러를 등록한다.
app.use(errorMiddleware);

// DB 연결 → 인덱스 준비 → 서버 오픈 순서를 지킨다.
// 인덱스가 없는 상태에서 요청을 받으면 유니크 제약이 동작하지 않는다.
async function bootstrap() {
  await connectDB();
  await ensureUserIndexes();
  await ensurePendingIndexes();
  // testSentences 컬렉션이 비어있으면 시드 데이터를 삽입한다.
  await seedIfEmpty(TEST_SENTENCES);
  app.listen(ENV.PORT, () => {
    console.log(`서버가 ${ENV.PORT}에서 실행 중입니다.`);
  });
}

bootstrap();
