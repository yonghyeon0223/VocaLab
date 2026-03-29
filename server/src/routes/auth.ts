import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 인증이 필요 없는 엔드포인트
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// 로그아웃은 유효한 Access Token이 있어야 한다.
// 토큰 없이 로그아웃 요청이 와도 서버 상태가 바뀌지 않도록 차단한다.
router.post('/logout', authMiddleware, authController.logout);

export default router;
