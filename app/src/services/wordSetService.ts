import api from './api';
import { useWordSetStore } from '../stores/wordSetStore';
import { WordSet, Word } from '../../../shared/types';

// --- AI 파이프라인 ---

// 호출 #1: 단어 추출 (spelling만)
export async function extractSpellings(
  input: { type: 'text'; text: string; wordCount: number } | { type: 'photo'; images: string[]; wordCount: number },
) {
  const res = await api.post('/api/word-sets/extract-spellings', input, { timeout: 120000 });
  return res.data.data as { spellings: string[] };
}

// 호출 #2: 뜻 생성 (원본 텍스트 + spelling 목록)
export async function generateMeanings(originalText: string, spellings: string[]) {
  const res = await api.post('/api/word-sets/generate-meanings', { originalText, spellings }, { timeout: 120000 });
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
