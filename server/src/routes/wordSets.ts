import { Router } from 'express';
import * as wordSetController from '../controllers/wordSetController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// AI 파이프라인
router.post('/extract-spellings', authenticate, wordSetController.extractSpellings);
router.post('/generate-meanings', authenticate, wordSetController.generateMeanings);

// CRUD
router.patch('/:id', authenticate, wordSetController.updateWordSet);
router.post('/', authenticate, wordSetController.createWordSet);
router.get('/', authenticate, wordSetController.getWordSets);
router.get('/:id', authenticate, wordSetController.getWordSetDetail);
router.delete('/:id', authenticate, wordSetController.deleteWordSet);

export default router;
