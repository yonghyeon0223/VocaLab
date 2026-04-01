import { Router } from 'express';
import * as wordSetController from '../controllers/wordSetController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// AI 파이프라인 엔드포인트
router.post('/extract-words', authenticate, wordSetController.extractWords);
router.post('/extract-meanings', authenticate, wordSetController.extractMeanings);

// CRUD 엔드포인트
router.post('/', authenticate, wordSetController.createWordSet);
router.get('/', authenticate, wordSetController.getWordSets);
router.get('/:id', authenticate, wordSetController.getWordSetDetail);
router.delete('/:id', authenticate, wordSetController.deleteWordSet);

export default router;
