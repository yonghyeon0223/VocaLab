import { RatingValue } from '../../../shared/types';

// lv.1~10 각 레벨의 수준 레이블
export const LEVEL_LABELS: Record<number, string> = {
  1: '초등 1~2학년',
  2: '초등 3~4학년',
  3: '초등 5~6학년',
  4: '중학 1학년',
  5: '중학 2~3학년',
  6: '고등 1학년',
  7: '고등 2학년',
  8: '고등 3학년 / 수능',
  9: '수능 고난도',
  10: '학술 논문',
};

// rating 값의 숫자 순서. 역전 방지 계산에 사용한다.
export const RATING_ORDER: Record<RatingValue, number> = {
  easy: 0,
  appropriate: 1,
  hard: 2,
  alien: 3,
};

// 각 rating 버튼의 레이블과 색상
export const RATING_OPTIONS: Array<{
  value: RatingValue;
  label: string;
  color: string;
}> = [
  { value: 'easy',        label: '바로 이해돼요',       color: '#4caf7d' },
  { value: 'appropriate', label: '조금 생각하면 돼요',   color: '#6c63ff' },
  { value: 'hard',        label: '뜻 파악이 힘들어요',   color: '#e8a838' },
  { value: 'alien',       label: '외계어예요',           color: '#e05252' },
];
