import express from 'express';
import { ENV } from './utils/env';
import { connectDB } from './utils/db';
import { ensureIndexes as ensureUserIndexes } from './repositories/userRepository';
import { ensureIndexes as ensurePendingIndexes } from './repositories/pendingVerificationRepository';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();

app.use(express.json());

// 서버가 살아있는지 확인하는 기본 엔드포인트
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 라우터는 Sprint 02 구현 완료 후 여기에 등록한다.
app.use(errorMiddleware);

// DB 연결 → 인덱스 준비 → 서버 오픈 순서를 지킨다.
// 인덱스가 없는 상태에서 요청을 받으면 유니크 제약이 동작하지 않는다.
async function bootstrap() {
  await connectDB();
  await ensureUserIndexes();
  await ensurePendingIndexes();
  app.listen(ENV.PORT, () => {
    console.log(`서버가 ${ENV.PORT}에서 실행 중입니다.`);
  });
}

bootstrap();
