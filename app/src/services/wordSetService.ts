import api from './api';
import { useWordSetStore } from '../stores/wordSetStore';
import { WordSet } from '../../../shared/types';

// 서버에서 단어 세트 목록을 가져와 store에 반영한다.
export async function fetchWordSets() {
  const res = await api.get('/api/word-sets');
  const wordSets = res.data.data.wordSets as WordSet[];
  useWordSetStore.getState().setWordSets(wordSets);
  return wordSets;
}

// 새 단어 세트를 생성하고 store에 추가한다.
export async function createWordSet(name: string, words: string[]) {
  const res = await api.post('/api/word-sets', { name, words });
  const wordSet = res.data.data.wordSet as WordSet;
  useWordSetStore.getState().addWordSet(wordSet);
  return wordSet;
}

// 단어 세트를 삭제하고 store에서 제거한다.
export async function deleteWordSet(setId: string) {
  await api.delete(`/api/word-sets/${setId}`);
  useWordSetStore.getState().removeWordSet(setId);
}
