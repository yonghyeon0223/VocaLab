# Sprint 02 — 인증 시스템 전면 재설계

**기간**: Sprint 02
**목표**: Sprint 01의 인증 코드를 전부 교체한다. 이메일 인증이 회원가입의 완료 조건이며, 인증된 유저만 DB에 저장된다.

---

## 📋 요약

**Sprint 02가 끝나면 뭐가 되나?**

`users` 컬렉션에는 이메일 인증까지 완료한 유저만 존재한다. 회원가입 중 비밀번호는 클라이언트 메모리(Zustand)에만 존재하고, 서버는 코드 검증 목적의 최소한의 데이터만 `pendingVerifications`에 임시 저장한다. 인증 완료 시 비밀번호를 받아 해싱 후 `users`에 삽입하고 토큰을 발급한다. 앱을 중간에 나가면 인증이 처음부터 다시 시작된다.

**기존 Sprint 01 인증 코드:** 전부 교체
**기존 DB documents:** 전부 삭제 후 새 스키마로 시작
**새로 추가되는 화면:** 이메일 인증 화면 1개
**외부 서비스:** Gmail SMTP (Nodemailer)

---

## 회원가입 흐름
```
register 요청 { email }
    ↓
서버: 이메일 소문자 정규화
users에 이미 존재 → 409
    ↓
코드 생성 → 해싱
pendingVerifications에 upsert
{ email, hashedCode, expiresAt, attempts: 0 }
    ↓
이메일 발송
201 반환 (토큰 없음)
    ↓
클라이언트: { email, password } Zustand에 보관
앱: 인증 화면으로 이동
    ↓
앱을 중간에 나가면 → Zustand 초기화 → 처음부터 재가입 필요
```

## 이메일 인증 흐름 (회원가입 완료)
```
verify-email 요청 { email, password, code }
    ↓
pendingVerifications에서 이메일로 조회
없음 or 만료 → 410
코드 불일치 → 400 (attempts +1)
5회 초과 → 410
    ↓
성공
→ password bcrypt 해싱
→ users에 정식 삽입
→ pendingVerifications 삭제
→ Access Token + Refresh Token 발급
→ 200 { accessToken, refreshToken }
    ↓
앱: Zustand 임시 데이터 삭제 → 토큰 저장 → 메인 화면
```

## 재발송 흐름
```
send-verification 요청 { email }
    ↓
pendingVerifications에 없는 이메일 → 200 반환 (스팸 방지)
1분 이내 재발송 → 429
    ↓
새 코드 생성 → 해싱 → pendingVerifications 업데이트
이메일 발송
200 반환
```

## 로그인 흐름
```
login 요청 { email, password }
    ↓
이메일 소문자 정규화
users에 없음 → 401
    ↓
lockedUntil이 null이 아님
  → lockedUntil > 지금 → 403 "N분 후 다시 시도해주세요"
  → lockedUntil <= 지금 → loginAttempts: 0, lockedUntil: null 초기화 후 계속
    ↓
비밀번호 틀림
  → loginAttempts +1
  → loginAttempts >= 20 → lockedUntil = 지금 + 5분 설정 → 403
  → loginAttempts < 20  → 401 "이메일 또는 비밀번호를 확인해주세요"
    ↓
성공 → loginAttempts: 0, lockedUntil: null 초기화 → 토큰 발급
200 { accessToken, refreshToken }
```

## Refresh Token 흐름 (Rotation 전략)
```
Access Token 만료
    ↓
서버에 Refresh Token 전송
    ↓
DB 해싱된 토큰과 비교
    ↓
일치 → 새 Access Token + 새 Refresh Token 발급
       기존 Refresh Token 즉시 폐기
불일치 → 401 (탈취 가능성 → 전체 토큰 폐기)
만료 → 401
```

---

## DB 모델

### `users` 컬렉션 — 인증 완료된 유저만 존재
```typescript
type User = {
  _id: ObjectId,
  email: string,               // 소문자 정규화, 유니크 인덱스
  password: string,            // bcrypt 해싱 (rounds: 12)
  refreshToken: string | null, // bcrypt 해싱 저장
  loginAttempts: number,       // 기본값 0, 20회 도달 시 잠금
  lockedUntil: Date | null,    // 20회 실패 시 현재시각 + 5분
  createdAt: Date,
  updatedAt: Date,
}
```

### `pendingVerifications` 컬렉션 — 코드 검증 목적만
```typescript
type PendingVerification = {
  _id: ObjectId,
  email: string,           // 유니크 인덱스
  hashedCode: string,      // bcrypt 해싱된 6자리 코드
  expiresAt: Date,         // 발급 후 10분
  attempts: number,        // 기본값 0, 5회 초과 시 만료 처리
  createdAt: Date,         // TTL index (24시간 후 자동 삭제)
}
```

### 인덱스
```
users.email: unique index
pendingVerifications.email: unique index
pendingVerifications.createdAt: TTL index (24시간)
```

---

## 로그인 잠금 로직 상세
```typescript
// lockedUntil이 null → 잠금 없음, attempts 계속 카운트
// lockedUntil이 null이 아님 + 시간 안 지남 → 잠금 중
// lockedUntil이 null이 아님 + 시간 지남 → 초기화 후 정상 처리

if (user.lockedUntil) {
  if (user.lockedUntil > now) {
    // 잠금 중
    const minutesLeft = Math.ceil((user.lockedUntil - now) / 60000);
    throw new AppError('ACCOUNT_LOCKED', 403, `${minutesLeft}분 후 다시 시도해주세요`);
  } else {
    // 잠금 시간 지남 → 초기화하고 계속 진행
    await userRepository.resetLoginAttempts(user._id);
  }
}
```

---

## 미들웨어 구조
```typescript
// authenticate — Access Token 유효성만 확인
// users에 존재하는 유저 = 무조건 인증된 유저
// 토큰 실패 → 401

// 공개 API (미들웨어 없음)
POST /api/auth/register
POST /api/auth/send-verification
POST /api/auth/verify-email
POST /api/auth/login

// authenticate 적용
POST /api/auth/refresh
POST /api/auth/logout
// 이후 모든 핵심 기능 API
```

---

## API 엔드포인트

### POST /api/auth/register
```
미들웨어: 없음
요청: { email }
처리: users에 존재 → 409
      pendingVerifications에 upsert + 코드 발송
성공: 201 { success: true }
실패: 409 이미 가입된 이메일
      400 이메일 형식 오류
```

### POST /api/auth/send-verification
```
미들웨어: 없음
요청: { email }
처리: pendingVerifications에 없는 이메일 → 200 (스팸 방지)
      1분 이내 재발송 → 429
      새 코드 발급 + 발송
성공: 200 { success: true }
실패: 429 재발송 너무 빠름
```

### POST /api/auth/verify-email
```
미들웨어: 없음
요청: { email, password, code }
처리: pendingVerifications 조회 → 코드 검증
      성공 → password 해싱 → users 삽입 → pendingVerifications 삭제 → 토큰 발급
성공: 200 { success: true, data: { accessToken, refreshToken } }
실패: 400 코드 불일치 (attempts +1)
      410 코드 만료 (시간 or 5회 초과)
```

### POST /api/auth/login
```
미들웨어: 없음
요청: { email, password }
성공: 200 { success: true, data: { accessToken, refreshToken } }
실패: 401 이메일/비밀번호 불일치
      403 계정 잠금 (잔여 잠금 시간 포함)
```

### POST /api/auth/refresh
```
미들웨어: authenticate
요청: { refreshToken }
성공: 200 { success: true, data: { accessToken, refreshToken } }
실패: 401 토큰 불일치 (전체 폐기)
      401 토큰 만료
```

### POST /api/auth/logout
```
미들웨어: authenticate
요청: Authorization 헤더
성공: 200 { success: true }
처리: DB에서 refreshToken null 초기화
```

---

## 클라이언트 상태 관리 (Zustand)
```typescript
// 회원가입 진행 중에만 존재하는 임시 상태
// 앱 종료 or 인증 완료 시 초기화
// AsyncStorage에 저장하지 않음 (메모리만)
type SignupStore = {
  email: string | null,
  password: string | null,
}
```

---

## 이메일 서비스

- **라이브러리**: Nodemailer
- **발송**: Gmail SMTP (개발용)
- **환경변수** (`server/.env`):
```
  EMAIL_USER=Gmail 주소
  EMAIL_PASS=Gmail 앱 비밀번호 (16자리)
```

### 이메일 템플릿
```
제목: [VocaLab] 이메일 인증 코드: 123456

안녕하세요, VocaLab입니다.
아래 6자리 코드를 입력해 이메일 인증을 완료해주세요.

  123456

이 코드는 10분 후 만료됩니다.
본인이 요청하지 않은 경우 이 이메일을 무시해주세요.
```

---

## 작업 목록

### 0. 기존 코드 정리 (가장 먼저)
- [ ] 기존 `users` 컬렉션 documents 전부 삭제
- [ ] Sprint 01 인증 관련 파일 전부 삭제
  - `userRepository.ts`
  - `authService.ts`
  - `authMiddleware.ts`
  - `jwt.ts`
  - `authValidator.ts`
  - `routes/auth.ts`

### 1. 공통 유틸
- [ ] `server/src/utils/jwt.ts` — Access Token (24시간) / Refresh Token (365일)
- [ ] `server/src/utils/mailer.ts` — Nodemailer Gmail SMTP
- [ ] `server/src/utils/verificationCode.ts` — 6자리 랜덤 코드 생성

### 2. DB 레이어
- [ ] `shared/types.ts` — User, PendingVerification 타입 정의
- [ ] `server/src/repositories/userRepository.ts` — 전면 재작성
  - `findByEmail`
  - `insertUser`
  - `updateRefreshToken`
  - `incrementLoginAttempts`
  - `lockUser`
  - `resetLoginAttempts`
- [ ] `server/src/repositories/pendingVerificationRepository.ts` — 신규
  - `findByEmail`
  - `upsert`
  - `incrementAttempts`
  - `deleteByEmail`

### 3. 비즈니스 로직
- [ ] `server/src/validators/authValidator.ts` — Zod 스키마
- [ ] `server/src/services/authService.ts` — 전면 재작성
  - `register`
  - `sendVerification`
  - `verifyEmail`
  - `login`
  - `refresh`
  - `logout`

### 4. 미들웨어
- [ ] `server/src/middlewares/authenticate.ts` — Access Token 유효성만 확인

### 5. 라우터
- [ ] `server/src/routes/auth.ts` — 6개 엔드포인트

### 6. App
- [ ] `stores/signupStore.ts` — 회원가입 임시 상태 (메모리만)
- [ ] `screens/SignupScreen.tsx` 수정 — register 요청 시 password Zustand에 보관
- [ ] `screens/VerifyEmailScreen.tsx` — 신규
  - 타이틀: "이메일을 확인해주세요"
  - 부제목: "{email}로 발송된 6자리 코드를 입력해주세요"
  - OTP 입력 (6칸, 자동 포커스 이동)
  - 인증 완료 버튼
  - 재발송 버튼 (1분 쿨다운 타이머)
  - 에러 메시지
- [ ] verify-email 성공 후 signupStore 초기화 → 토큰 저장 → 메인 화면

---

## 에러 메시지 정의

| 상황 | 메시지 |
|------|--------|
| 이미 가입된 이메일 | 이미 사용 중인 이메일입니다 |
| 코드 불일치 | 인증 코드가 올바르지 않습니다 (N/5) |
| 코드 만료 (시간 or 5회 초과) | 인증 코드가 만료됐습니다. 재발송해주세요 |
| 재발송 너무 빠름 | 1분 후 다시 시도해주세요 |
| 로그인 실패 | 이메일 또는 비밀번호를 확인해주세요 |
| 계정 잠금 | 로그인 시도 횟수를 초과했습니다. 5분 후 다시 시도해주세요 |
| 토큰 만료 | 다시 로그인해주세요 |

---

## 완료 조건 (Definition of Done)

- 기존 인증 코드 전부 교체됨
- users 컬렉션에 미인증 유저 없음 확인
- register 요청 시 email만 서버로 전송, password는 클라이언트 메모리 보관 확인
- verify-email 성공 시 password 해싱 후 users 삽입 확인
- 인증 성공 시 처음으로 토큰 발급 확인
- pendingVerifications TTL 24시간 자동 삭제 확인
- Refresh Token 해싱 저장 확인
- Refresh Token Rotation 동작 확인 (재사용 시 전체 폐기)
- 로그인 20회 실패 시 5분 잠금 확인
- 5분 후 로그인 시도 시 loginAttempts 0으로 초기화 확인
- 로그인 성공 시 loginAttempts 0으로 초기화 확인
- 이메일 대소문자 무관하게 같은 계정 처리 확인
- DB에 없는 이메일로 send-verification 시 200 반환 확인 (스팸 방지)

---

## 이번 스프린트에서 하지 않는 것

- 이메일 템플릿 HTML 디자인 (→ 나중에)
- AWS SES 등 프로덕션 이메일 서비스 교체 (→ 배포 스프린트)
- 소셜 로그인 (→ 나중에)
- 비밀번호 찾기 / 재설정 (→ 나중에)

---

## 참고 정보

- **GitHub 레포**: https://github.com/yonghyeon0223/VocaLab.git
- **디자인 방향**: 다크모드 기본, 포인트 컬러 #6c63ff
- **환경변수 추가** (`server/.env`):
  - `EMAIL_USER=`
  - `EMAIL_PASS=`
- **이전 스프린트**: Sprint 01 (인증 코드 전부 교체됨)
```

---
