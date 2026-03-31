import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// 모든 프로필 엔드포인트는 유효한 Access Token이 필요하다.
router.get('/profile', authenticate, profileController.getProfile);
router.patch('/profile', authenticate, profileController.updateProfile);
router.patch('/profile/complete', authenticate, profileController.completeProfile);

export default router;
