import express from 'express';
import { ENV } from './utils/env';
import { connectDB } from './utils/db';

const app = express();

app.use(express.json());

// 서버가 살아있는지 확인하는 기본 엔드포인트
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// DB 연결이 완료된 뒤에 서버를 열어야 한다.
// 순서가 바뀌면 DB 없이 요청을 받는 상황이 생긴다.
async function bootstrap() {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`서버가 ${ENV.PORT}에서 실행 중입니다.`);
  });
}

bootstrap();
