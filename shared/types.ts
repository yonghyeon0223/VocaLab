// 클라이언트와 서버가 함께 쓰는 도메인 타입을 정의한다.

// 문장 난이도 평가 값
export type RatingValue = 'easy' | 'appropriate' | 'hard' | 'alien';

// lv.1~10 각 레벨에 대한 평가 기록
export type LevelRatings = {
  [level: number]: RatingValue;
};

// 이메일 인증까지 완료한 사용자. 미인증 유저는 이 컬렉션에 존재하지 않는다.
export type User = {
  _id: string;
  email: string;               // 소문자 정규화, 유니크 인덱스
  password: string;            // bcrypt 해싱 (rounds: 12)
  refreshToken: string | null; // bcrypt 해싱 저장. Rotation 전략으로 재발급마다 교체
  loginAttempts: number;       // 기본값 0. 20회 도달 시 잠금
  lockedUntil: Date | null;    // 20회 실패 시 현재시각 + 5분
  // 프로필 설정 필드 — 프로필 완료 전까지 기본값(빈 문자열, 0, [])으로 존재한다
  profileCompleted: boolean;
  nickname: string;
  purposes: string[];          // 1~5개
  easyLevel: number;           // 1~10, 기초 예문 레벨
  activeLevel: number;         // 1~10, 학습 예문 레벨
  hardLevel: number;           // 1~10, 심화 예문 레벨
  levelRatings: LevelRatings;  // lv.1~10 전체 평가 기록
  createdAt: Date;
  updatedAt: Date;
};

// 레벨 테스트용 예문. testSentences 컬렉션에 저장된다.
export type TestSentence = {
  _id: string;
  level: number;       // 1~10
  text: string;        // 영어 원문
  translation: string; // 한국어 번역
};

// 개별 영단어. wordSets 문서의 words 배열에 내장된다.
export type Word = {
  spelling: string;       // 영단어 원형 (소문자 정규화)
  meaning: string;        // 한국어 뜻 그룹 (예: "옳은, 정확한")
  partOfSpeech: string;   // 품사 (noun, verb, adj, adv 등)
};

// 단어 세트. words 배열을 문서 안에 내장(embed)한다.
export type WordSet = {
  _id: string;
  userId: string;
  name: string;           // 세트 이름 (1~30자)
  source: 'manual' | 'photo'; // 생성 방식
  words: Word[];          // 내장 단어 배열
  createdAt: Date;
  updatedAt: Date;
};

// 이메일 인증 대기 중인 임시 데이터. 인증 완료 또는 만료 시 삭제된다.
export type PendingVerification = {
  _id: string;
  email: string;       // 유니크 인덱스
  hashedCode: string;  // bcrypt 해싱된 6자리 코드
  expiresAt: Date;     // 발급 후 10분
  attempts: number;    // 기본값 0. 5회 초과 시 만료 처리
  createdAt: Date;     // TTL index (24시간 후 자동 삭제)
};
