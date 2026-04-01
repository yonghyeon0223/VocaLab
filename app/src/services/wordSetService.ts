import api from './api';
import { useWordSetStore } from '../stores/wordSetStore';
import { WordSet, Word } from '../../../shared/types';

// --- AI 파이프라인 ---

type ClassifiedWords = {
  easy: string[];
  appropriate: string[];
  hard: string[];
};

type MeaningEntry = {
  meaning: string;
  partOfSpeech: string;
};

// AI 단어 추출 + 카테고리 분류. 사진 입력 시 base64 전송에 시간이 걸리므로 timeout을 60초로 설정.
export async function extractWords(input: { type: 'text'; text: string } | { type: 'photo'; images: string[] }) {
  const res = await api.post('/api/word-sets/extract-words', input, { timeout: 60000 });
  return res.data.data as { categories: ClassifiedWords; totalCount: number };
}

// AI 뜻 추출. 단어 수가 많으면 시간이 걸리므로 timeout을 120초로 설정.
export async function extractMeanings(words: string[]) {
  const res = await api.post('/api/word-sets/extract-meanings', { words }, { timeout: 120000 });
  return res.data.data.meanings as Record<string, MeaningEntry[]>;
}

// --- CRUD ---

// 서버에서 단어 세트 목록을 가져와 store에 반영한다.
export async function fetchWordSets() {
  const res = await api.get('/api/word-sets');
  const wordSets = res.data.data.wordSets as WordSet[];
  useWordSetStore.getState().setWordSets(wordSets);
  return wordSets;
}

// 새 단어 세트를 생성하고 store에 추가한다.
export async function createWordSet(
  name: string,
  source: 'manual' | 'photo',
  words: Word[],
) {
  const res = await api.post('/api/word-sets', { name, source, words });
  const wordSet = res.data.data.wordSet as WordSet;
  useWordSetStore.getState().addWordSet(wordSet);
  return wordSet;
}

// 단어 세트를 삭제하고 store에서 제거한다.
export async function deleteWordSet(setId: string) {
  await api.delete(`/api/word-sets/${setId}`);
  useWordSetStore.getState().removeWordSet(setId);
}
