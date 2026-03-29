// 클라이언트와 서버가 함께 쓰는 도메인 타입을 정의한다.
// 학습 도메인 타입은 추후 스프린트에서 확정 후 추가한다.

// 이메일 인증까지 완료한 사용자. 미인증 유저는 이 컬렉션에 존재하지 않는다.
export type User = {
  _id: string;
  email: string;               // 소문자 정규화, 유니크 인덱스
  password: string;            // bcrypt 해싱 (rounds: 12)
  refreshToken: string | null; // bcrypt 해싱 저장. Rotation 전략으로 재발급마다 교체
  loginAttempts: number;       // 기본값 0. 20회 도달 시 잠금
  lockedUntil: Date | null;    // 20회 실패 시 현재시각 + 5분
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
