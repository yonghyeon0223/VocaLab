import api from './api';
import { useWordSetStore } from '../stores/wordSetStore';
import { WordSet, Word } from '../../../shared/types';

// --- AI + Dictionary ---

// AI 단일 호출로 N개 핵심 단어 + 뜻 + 품사 추출. timeout 120초.
export async function extractWords(
  input: { type: 'text'; text: string; wordCount: number } | { type: 'photo'; images: string[]; wordCount: number },
) {
  const res = await api.post('/api/word-sets/extract', input, { timeout: 120000 });
  return res.data.data as { words: Word[] };
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
