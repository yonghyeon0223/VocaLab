import { Router } from 'express';
import * as sentenceController from '../controllers/sentenceController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// 레벨 테스트 예문 조회. 프로필 설정 중에도 인증된 유저만 접근 가능하다.
router.get('/test', authenticate, sentenceController.getTestSentences);

export default router;
