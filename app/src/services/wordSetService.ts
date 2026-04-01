import api from './api';
import { useWordSetStore } from '../stores/wordSetStore';
import { WordSet, Word } from '../../../shared/types';

// --- AI ---

type ExtractedWord = {
  spelling: string;
  meanings: Array<{ meaning: string; partOfSpeech: string }>;
};

// AI 단어 추출 (단어 + 뜻 + 품사 한 번에). 사진 입력 시 시간이 걸리므로 timeout 120초.
export async function extractWords(input: { type: 'text'; text: string } | { type: 'photo'; images: string[] }) {
  const res = await api.post('/api/word-sets/extract', input, { timeout: 120000 });
  return res.data.data as { words: ExtractedWord[] };
}

// --- CRUD ---

export async function fetchWordSets() {
  const res = await api.get('/api/word-sets');
  const wordSets = res.data.data.wordSets as WordSet[];
  useWordSetStore.getState().setWordSets(wordSets);
  return wordSets;
}

export async function createWordSet(name: string, source: 'manual' | 'photo', words: Word[]) {
  const res = await api.post('/api/word-sets', { name, source, words });
  const wordSet = res.data.data.wordSet as WordSet;
  useWordSetStore.getState().addWordSet(wordSet);
  return wordSet;
}

export async function deleteWordSet(setId: string) {
  await api.delete(`/api/word-sets/${setId}`);
  useWordSetStore.getState().removeWordSet(setId);
}
