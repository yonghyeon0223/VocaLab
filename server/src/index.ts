import express from 'express';
import { ENV } from './utils/env';
import { connectDB } from './utils/db';
import { ensureIndexes } from './repositories/userRepository';
import authRouter from './routes/auth';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();

app.use(express.json());

// 서버가 살아있는지 확인하는 기본 엔드포인트
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 인증 관련 엔드포인트 (/api/auth/*)
app.use('/api/auth', authRouter);

// 모든 라우터 아래에 에러 핸들러를 등록한다.
// 순서가 중요하다 — 라우터보다 위에 있으면 에러를 잡지 못한다.
app.use(errorMiddleware);

// DB 연결이 완료된 뒤에 서버를 열어야 한다.
// 인덱스도 서버 오픈 전에 준비해야 요청이 들어올 때 이미 적용된 상태다.
async function bootstrap() {
  await connectDB();
  await ensureIndexes();
  app.listen(ENV.PORT, () => {
    console.log(`서버가 ${ENV.PORT}에서 실행 중입니다.`);
  });
}

bootstrap();
