import { Router } from 'express';
import * as wordSetController from '../controllers/wordSetController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// 모든 단어 세트 엔드포인트는 인증이 필요하다.
router.post('/', authenticate, wordSetController.createWordSet);
router.get('/', authenticate, wordSetController.getWordSets);
router.get('/:id', authenticate, wordSetController.getWordSetDetail);
router.delete('/:id', authenticate, wordSetController.deleteWordSet);

export default router;
