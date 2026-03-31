import { create } from 'zustand';
import { WordSet } from '../../../shared/types';

// 홈 화면에서 표시하는 단어 세트 목록을 관리한다.
// 서버에서 가져온 목록을 캐싱하고, 생성/삭제 시 즉시 반영한다.
type WordSetState = {
  wordSets: WordSet[];
  loaded: boolean;

  setWordSets: (wordSets: WordSet[]) => void;
  addWordSet: (wordSet: WordSet) => void;
  removeWordSet: (setId: string) => void;
  reset: () => void;
};

export const useWordSetStore = create<WordSetState>((set) => ({
  wordSets: [],
  loaded: false,

  setWordSets: (wordSets) => set({ wordSets, loaded: true }),

  // 새 세트를 목록 맨 앞에 추가한다 (최신순).
  addWordSet: (wordSet) =>
    set((state) => ({ wordSets: [wordSet, ...state.wordSets] })),

  removeWordSet: (setId) =>
    set((state) => ({
      wordSets: state.wordSets.filter((ws) => ws._id !== setId),
    })),

  reset: () => set({ wordSets: [], loaded: false }),
}));
