import { Router } from 'express';
import * as wordSetController from '../controllers/wordSetController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// AI 단어 추출 (단일 호출로 단어 + 뜻 + 품사)
router.post('/extract', authenticate, wordSetController.extractWords);

// CRUD
router.post('/', authenticate, wordSetController.createWordSet);
router.get('/', authenticate, wordSetController.getWordSets);
router.get('/:id', authenticate, wordSetController.getWordSetDetail);
router.delete('/:id', authenticate, wordSetController.deleteWordSet);

export default router;
