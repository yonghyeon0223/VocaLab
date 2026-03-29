import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// 인증이 필요 없는 공개 엔드포인트
router.post('/register', authController.register);
router.post('/send-verification', authController.sendVerification);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);

// 유효한 Access Token이 있어야 하는 엔드포인트
// refresh: 만료된 Access Token도 허용해야 하므로 authenticate 대신 service에서 직접 처리
// logout: 유효한 토큰 없이 로그아웃 요청이 와도 서버 상태가 바뀌지 않도록 차단
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
