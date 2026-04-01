// 영어 품사(Part of Speech)의 영문 키 → 한국어 문법 용어 매핑.
// AI 자동 추출과 수동 입력 양쪽에서 사용한다.
export const POS_LABELS: Record<string, string> = {
  noun: '명사',
  verb: '동사',
  adj: '형용사',
  adv: '부사',
  prep: '전치사',
  conj: '접속사',
  pron: '대명사',
  det: '한정사',
  interj: '감탄사',
  phrase: '숙어',
  idiom: '관용구',
  other: '그 외',
};

// 수동 입력 화면에서 선택 가능한 품사
export const POS_OPTIONS = [
  'noun', 'verb', 'adj', 'adv', 'phrase', 'other',
] as const;

// 한 줄 칩용 줄임말
export const POS_SHORT: Record<string, string> = {
  noun: '명사',
  verb: '동사',
  adj: '형용사',
  adv: '부사',
  phrase: '숙어',
  other: '그 외',
};
