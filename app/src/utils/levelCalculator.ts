import { LevelRatings } from '../../../shared/types';

export type LevelCalculationResult = {
  easyLevel: number;
  activeLevel: number;
  hardLevel: number;
  fallbacks: {
    easy: boolean;      // true이면 easy 평가가 없어 lv.1로 폴백
    active: boolean;    // true이면 appropriate 평가가 없어 중간값으로 폴백
    hard: boolean;      // true이면 hard/alien 평가가 없어 lv.10으로 폴백
  };
};

// sprint-03.md 계산 방식 그대로 구현.
// easyLevel ≤ activeLevel ≤ hardLevel 관계를 항상 보장한다.
export function calculateLevels(ratings: LevelRatings): LevelCalculationResult {
  const entries = Object.entries(ratings).map(([k, v]) => ({ level: Number(k), rating: v }));

  const easyLevels = entries.filter((e) => e.rating === 'easy').map((e) => e.level);
  const activeLevels = entries.filter((e) => e.rating === 'appropriate').map((e) => e.level);
  const hardLevels = entries.filter((e) => e.rating === 'hard' || e.rating === 'alien').map((e) => e.level);

  // 1. easyLevel: 쉽다고 평가한 것 중 최고. 없으면 폴백 1
  const easyFallback = easyLevels.length === 0;
  const easyLevel = easyFallback ? 1 : Math.max(...easyLevels);

  // 2. hardLevel: 힘들어요/외계어 중 최솟값. 없으면 폴백 10
  const hardFallback = hardLevels.length === 0;
  const hardLevel = hardFallback ? 10 : Math.min(...hardLevels);

  // 3. activeLevel: 적절한 레벨들의 중간값. 없으면 폴백 min(easyLevel+1, hardLevel)
  //    hardLevel을 초과할 수 없음
  const activeFallback = activeLevels.length === 0;
  const activeLevel = activeFallback
    ? Math.min(easyLevel + 1, hardLevel)
    : Math.floor((Math.min(...activeLevels) + Math.max(...activeLevels)) / 2);

  return {
    easyLevel,
    activeLevel,
    hardLevel,
    fallbacks: { easy: easyFallback, active: activeFallback, hard: hardFallback },
  };
}
