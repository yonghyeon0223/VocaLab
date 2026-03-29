// 클라이언트와 서버가 함께 쓰는 도메인 타입을 정의한다.
// 구현 없이 타입 선언만 둔다. 세부 타입은 각 스프린트마다 추가한다.

// 단어 난이도
export type Difficulty = 'daily' | 'middle' | 'high' | 'sat_basic' | 'sat_advanced';

// 학습 단계
export type Stage =
  | 'recognition'
  | 'recall'
  | 'expansion'
  | 'deepening'
  | 'production'
  | 'internalization';

// 단어 하나
export type Word = {
  id: string;
  text: string;
  meaning: string;
  difficulty: Difficulty;
};

// 사용자가 만든 단어 묶음 (10~20개)
export type WordSet = {
  id: string;
  userId: string;
  name: string;
  words: Word[];
  createdAt: string;
};

// 난이도에 따라 결정되는 Challenge 순서
export type LearningPath = {
  id: string;
  wordSetId: string;
  difficulty: Difficulty;
  challenges: Challenge[];
};

// 경로 상의 개별 도전
export type Challenge = {
  id: string;
  stage: Stage;
  wordId: string;
  completedAt: string | null;
};

// 사용자 계정
export type User = {
  _id: string;
  email: string;
  password: string;             // bcrypt 해싱된 값 (평문 절대 저장 금지)
  refreshToken: string | null;  // 로그인 시 저장, 로그아웃 시 null로 초기화
  isVerified: boolean;          // 이메일 인증 여부 (Sprint 02에서 활용)
  createdAt: Date;
  updatedAt: Date;
};

// 장기기억 루틴 대상 (Word × Stage 조합)
export type SpacedItem = {
  id: string;
  userId: string;
  wordId: string;
  stage: Stage;
  nextReviewAt: string;
  interval: number;
};
