import { create } from 'zustand';
import { LevelRatings, RatingValue, TestSentence } from '../../../shared/types';
import { RATING_ORDER } from '../constants/levels';

type LevelTestState = {
  currentLevel: number;
  ratings: LevelRatings;
  sentences: { [level: number]: TestSentence[] };

  setCurrentLevel: (level: number) => void;

  // rating 설정 시 역전 방지 로직을 함께 처리한다.
  // 새 rating보다 "쉬운" 이후 레벨 평가는 자동 초기화된다.
  setRating: (level: number, rating: RatingValue) => void;

  setAllSentences: (sentences: { [level: number]: TestSentence[] }) => void;

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
      const newOrder = RATING_ORDER[rating];

      // 현재 레벨보다 이후 레벨 중 역전이 발생하는 평가를 초기화한다.
      // 예: lv.3을 'hard'로 바꾸면 lv.4~10 중 'hard'보다 쉬운 평가는 무효화된다.
      for (let l = level + 1; l <= 10; l++) {
        const existing = newRatings[l];
        if (existing !== undefined && RATING_ORDER[existing] < newOrder) {
          delete newRatings[l];
        }
      }

      return { ratings: newRatings };
    }),

  setAllSentences: (sentences) => set({ sentences }),

  reset: () => set({ currentLevel: 1, ratings: {}, sentences: {} }),
}));
