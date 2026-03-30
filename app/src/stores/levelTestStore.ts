import { create } from 'zustand';
import { LevelRatings, RatingValue, TestSentence } from '../../../shared/types';

type LevelTestState = {
  currentLevel: number;
  ratings: LevelRatings;
  sentences: { [level: number]: TestSentence[] };

  setCurrentLevel: (level: number) => void;

  // rating 설정 시 역전 방지 로직을 함께 처리한다.
  // 새 rating보다 "쉬운" 이후 레벨 평가는 자동 초기화된다.
  setRating: (level: number, rating: RatingValue) => void;

  setAllSentences: (sentences: { [level: number]: TestSentence[] }) => void;

  // 이전 레벨로 돌아갈 때 호출한다.
  // level 이상의 모든 평가를 초기화해 다시 선택하게 한다.
  clearRatingsFrom: (level: number) => void;

  // "외계어예요" 선택 시 호출한다.
  // level부터 lv.10까지 전부 alien으로 일괄 처리한다.
  setAlienFrom: (level: number) => void;

  // "난이도 테스트 다시 받기" 또는 새 프로필 설정 시작 시 호출한다.
  reset: () => void;
};

export const useLevelTestStore = create<LevelTestState>((set) => ({
  currentLevel: 1,
  ratings: {},
  sentences: {},

  setCurrentLevel: (level) => set({ currentLevel: level }),

  setRating: (level, rating) =>
    set((state) => {
      const newRatings: LevelRatings = { ...state.ratings, [level]: rating };

      // 레벨을 선택하면 이후 레벨의 평가를 모두 초기화한다.
      // 이전 선택이 시각적으로 남아있으면 혼란스럽고,
      // 실수로 외계어 등을 선택했다가 돌아온 경우에도 깨끗하게 다시 시작할 수 있다.
      for (let l = level + 1; l <= 10; l++) {
        delete newRatings[l];
      }

      return { ratings: newRatings };
    }),

  setAllSentences: (sentences) => set({ sentences }),

  clearRatingsFrom: (level) =>
    set((state) => {
      const newRatings: LevelRatings = { ...state.ratings };
      for (let l = level; l <= 10; l++) {
        delete newRatings[l];
      }
      return { ratings: newRatings };
    }),

  setAlienFrom: (level) =>
    set((state) => {
      const newRatings: LevelRatings = { ...state.ratings };
      for (let l = level; l <= 10; l++) {
        newRatings[l] = 'alien';
      }
      return { ratings: newRatings };
    }),

  reset: () => set({ currentLevel: 1, ratings: {}, sentences: {} }),
}));
