# VocaLab

인지과학이 설계한, 군더더기 없는 영어 단어 학습 도구

---

## 🗂 프로젝트 구조
```
vocalab/
├── app/
│   └── src/
│       ├── screens/              # 화면 단위 컴포넌트
│       ├── components/ui/        # 재사용 UI 컴포넌트
│       ├── hooks/                # 커스텀 훅
│       ├── services/             # API 호출 레이어
│       ├── stores/               # 전역 상태 (Zustand)
│       ├── navigation/           # React Navigation 설정
│       ├── constants/            # 색상 등 앱 전역 상수
│       └── utils/                # 순수 유틸 함수
├── server/
│   └── src/
│       ├── routes/               # 라우터 (엔드포인트 정의만)
│       ├── controllers/          # 요청/응답 처리
│       ├── services/             # 비즈니스 로직
│       ├── repositories/         # DB 접근 레이어 (MongoDB native)
│       ├── middlewares/          # 인증, 에러 핸들링 등
│       ├── validators/           # Zod 스키마
│       └── utils/                # jwt, db, env, AppError, mailer 등
├── shared/
│   └── types.ts                  # 클라이언트/서버 공통 타입
├── docs/
│   └── sprints/
│       ├── sprint-XX/
│       │   ├── sprint-XX.md      # 스프린트 목표 및 작업 목록
│       │   └── YYYYMMDD-HHMM-{작업명}.md
│       └── ...
└── CLAUDE.md
```

---

## 🛠 기술 스택

| 레이어 | 기술 |
|--------|------|
| Language | TypeScript (strict mode) |
| Mobile | React Native (Expo) |
| 상태관리 | Zustand |
| 네비게이션 | React Navigation v6 |
| Backend | Node.js + Express |
| DB | MongoDB (native driver) |
| Auth | JWT |
| 유효성 검사 | Zod |
| API 통신 | Axios |

---

## 🧠 도메인 지식

각 스프린트에서 확립된 도메인 개념과 규칙. 코드베이스 전체에서 일관되게 사용할 것.

---

### Sprint 01 — UI 시스템

**컴포넌트** (`app/src/components/ui/`)

| 컴포넌트 | 주요 props | 비고 |
|---------|-----------|------|
| `Button` | `label`, `onPress`, `disabled` | 앱 전체 버튼 단일 스타일 |
| `TextInput` | `label`, `value`, `onChangeText`, `error`, `placeholder` | 포커스 시 border 색상 변경 |
| `PasswordInput` | TextInput props + `showStrength` | 표시/숨김 토글, 강도 표시 옵션 |
| `Logo` | `size: 'small' \| 'medium' \| 'large'` | 앱 로고 |

**색상 팔레트** (`app/src/constants/colors.ts`)

| 토큰 | 값 | 용도 |
|-----|----|------|
| `colors.background.primary` | `#0f0f0f` | 메인 배경 |
| `colors.background.secondary` | `#1a1a1a` | 입력창, 카드 |
| `colors.background.tertiary` | `#2a2a2a` | 구분선, 비활성 |
| `colors.text.primary` | `#f5f5f5` | 주요 텍스트 |
| `colors.text.secondary` | `#888888` | 보조 텍스트 |
| `colors.text.disabled` | `#444444` | placeholder |
| `colors.border.default` | `#2e2e2e` | 기본 테두리 |
| `colors.border.focused` | `#6c63ff` | 포커스 테두리 |
| `colors.accent` | `#6c63ff` | 버튼, 링크, 강조 |
| `colors.error` | `#e24b4a` | 에러 상태 |

---

### Sprint 02 — 인증 시스템

#### DB 엔티티

**`User`** (`users` 컬렉션 — 이메일 인증 완료한 유저만 존재)
```typescript
type User = {
  _id: ObjectId;
  email: string;           // 소문자 정규화, 유니크 인덱스
  password: string;        // bcrypt 해싱 (rounds: 12)
  refreshToken: string | null; // bcrypt 해싱 저장
  loginAttempts: number;   // 기본값 0, 20회 도달 시 잠금
  lockedUntil: Date | null;    // 20회 실패 시 현재 + 5분
  createdAt: Date;
  updatedAt: Date;
}
```

**`PendingVerification`** (`pendingVerifications` 컬렉션 — 인증 대기 임시 저장)
```typescript
type PendingVerification = {
  _id: ObjectId;
  email: string;       // 유니크 인덱스
  hashedCode: string;  // bcrypt 해싱된 6자리 코드
  expiresAt: Date;     // 발급 후 10분
  attempts: number;    // 기본값 0, 5회 초과 시 만료 처리
  createdAt: Date;     // TTL 인덱스 — 24시간 후 자동 삭제
}
```

#### 인증 규칙

- `register` 요청에는 **이메일만** 포함한다. 비밀번호는 `verifyEmail` 시점에 처음 서버로 전달된다.
- 이메일은 항상 **소문자로 정규화** 후 저장·비교한다. (`ABC@Gmail.com` → `abc@gmail.com`)
- 인증 코드는 `crypto.randomInt`로 생성한다. (`Math.random` 사용 금지)
- `send-verification` 요청 시 `pendingVerifications`에 없는 이메일은 **200을 반환**한다 (계정 열거 공격 방지).

#### 토큰 규칙

| 항목 | 값 | 이유 |
|------|-----|------|
| Access Token 유효기간 | 24시간 | 짧게 유지해 탈취 피해 최소화 |
| Refresh Token 유효기간 | 365일 | 앱 재실행 후 자동 로그인 유지 |
| Refresh Token DB 저장 방식 | bcrypt 해싱 | DB 탈취 시 원본 복원 불가 |
| Refresh Token Rotation | 재발급마다 새 토큰 발급 + 기존 즉시 폐기 | 이전 토큰 재사용 감지 시 전체 폐기 |

#### 로그인 잠금

- 비밀번호 20회 연속 실패 → `lockedUntil = 현재 + 5분`
- 잠금 중 요청 → `403` + 잔여 분 반환
- 잠금 만료 후 첫 요청 → `loginAttempts: 0`, `lockedUntil: null` 자동 초기화
- 로그인 성공 시에도 `loginAttempts: 0` 초기화

#### 클라이언트 상태 관리

새 상태 추가 시 아래 표를 기준으로 저장소를 결정한다.

| 데이터 | 저장소 | 앱 종료 후 | 이유 |
|--------|--------|-----------|------|
| `accessToken` | Zustand (`authStore`) | 소멸 | 메모리 빠른 접근, 유효기간 짧아 영구 저장 불필요 |
| `refreshToken` | AsyncStorage | **유지** | 앱 재실행 후 자동 로그인 |
| `isAuthenticated` | Zustand (`authStore`) | 소멸 | `accessToken` 유무에서 파생 |
| 회원가입 중 `email`, `password` | Zustand (`signupStore`) | 소멸 | 2단계 화면 간 임시 공유, 완료 즉시 `clearSignupData()` |

- `signupStore`는 AsyncStorage에 절대 저장하지 않는다. 앱 종료 = 회원가입 처음부터.
- API 요청 시 Access Token 자동 첨부 → 401 응답 시 Axios 인터셉터가 자동 refresh 후 재시도.

#### 구현된 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/register` | 없음 | 이메일 인증 코드 발송 |
| POST | `/api/auth/send-verification` | 없음 | 인증 코드 재발송 (1분 쿨다운) |
| POST | `/api/auth/verify-email` | 없음 | 코드 검증 → 회원 생성 → 토큰 발급 |
| POST | `/api/auth/login` | 없음 | 로그인 → 토큰 발급 |
| POST | `/api/auth/refresh` | 없음 | Access Token 재발급 (Rotation) |
| POST | `/api/auth/logout` | Bearer | Refresh Token 무효화 |

---

### 학습 도메인 (미구현 — `shared/types.ts`에 타입만 정의됨)

향후 스프린트에서 구현 예정. 아래 용어를 코드 전체에서 일관되게 사용할 것.

| 용어 | 설명 |
|------|------|
| `WordSet` | 사용자가 만든 단어 묶음 |
| `Word` | 단어 하나 |
| `Difficulty` | `daily \| middle \| high \| sat_basic \| sat_advanced` |
| `LearningPath` | 난이도에 따라 결정되는 Challenge 순서 |
| `Challenge` | 경로 상의 개별 도전 |
| `Stage` | `recognition \| recall \| expansion \| deepening \| production \| internalization` |
| `SpacedItem` | 장기기억 루틴 대상 (Word × Stage 조합) |

---

## ✍️ 코딩 컨벤션

### 네이밍
- 변수/함수: `camelCase`
- 컴포넌트/클래스/타입/인터페이스: `PascalCase`
- 상수: `UPPER_SNAKE_CASE`
- 파일명: 컴포넌트는 `PascalCase.tsx`, 나머지는 `camelCase.ts`

### 타입
- `any` 사용 절대 금지
- `interface`보다 `type` 우선 사용
- 공통 타입은 반드시 `shared/types.ts`에 정의

### 함수
- 단일 책임 원칙 (하나의 함수 = 하나의 역할)
- 함수 길이 50줄 초과 시 분리 검토

### 주석

- **모든 주석은 한국어로 작성**
- 기술 용어보다 **흐름과 목적** 중심으로 작성
- "무엇을 하는 코드인가"보다 **"왜 이 순서인가"** 를 설명
- 자명한 코드에는 주석 달지 않음

---

#### 주석 스타일 원칙

코드를 처음 보는 사람이 **위에서 아래로 읽으면서 흐름이 머릿속에 그려져야** 한다.
```typescript
// ❌ 나쁜 주석 — 코드를 그냥 말로 옮긴 것
const user = await userRepository.findByEmail(email); // 이메일로 유저 찾기

// ✅ 좋은 주석 — 왜 이 순서인지, 무슨 판단을 하는지
// 먼저 이미 가입된 이메일인지 확인한다.
// 중복이면 DB에 저장하기 전에 여기서 멈춘다.
const user = await userRepository.findByEmail(email);
if (user) throw new AppError('EMAIL_ALREADY_EXISTS', 409, '...');
```

---

#### 흐름을 보여주는 주석 예시

**API 요청이 들어왔을 때 — 전체 흐름**
```typescript
// 1. 사용자가 보낸 이메일/비밀번호가 형식에 맞는지 확인한다
const body = registerSchema.parse(req.body);

// 2. 실제 가입 처리는 authService에 맡긴다
//    (중복 검사, 비밀번호 암호화 등은 거기서 처리)
const user = await authService.register(body.email, body.password);

// 3. 성공하면 새로 만들어진 유저 정보를 돌려준다
res.status(201).json({ success: true, data: user });
```

**비즈니스 판단이 있는 곳 — 이유 설명**
```typescript
// 비밀번호는 절대 그대로 저장하지 않는다.
// 해킹으로 DB가 털려도 실제 비밀번호는 알 수 없게 암호화한다.
const hashed = await bcrypt.hash(password, 12);
```

**화면 컴포넌트 — 데이터가 어디서 오는지**
```typescript
// 단어 목록은 서버에서 가져온다.
// 실제 API 호출은 wordSetService가 담당하고,
// 이 화면은 결과만 받아서 보여준다.
const wordSets = useWordSetStore((s) => s.wordSets);
```

**복잡한 로직 — 단계별로 쪼개서**
```typescript
// [1단계] 오늘 복습해야 할 단어들을 가져온다
// [2단계] 마지막으로 맞춘 날짜를 기준으로 간격을 계산한다
// [3단계] 간격이 지난 단어만 골라서 문제로 낸다
```

---

## 🚦 작업 프로세스 규칙 (필독)

### 1단계 — 작업 전 계획 제출 (구현 시작 전 필수)

코드를 단 한 줄도 작성하기 전에 아래 형식으로 계획을 제출하고 승인을 받을 것.
**승인 없이 구현을 시작하는 것은 금지.**
```
## 📋 작업 계획

**목표**
한 문장으로 이번 작업이 달성하려는 것

**작업 파일 목록**
- 생성: 경로/파일명
- 수정: 경로/파일명
- 삭제: 없음

**구현 방법 요약**
어떤 방식으로 구현할 것인지 2~5줄

**예상 사이드이펙트**
이 작업이 다른 파일/기능에 영향을 줄 수 있는 부분

**스프린트 범위 확인**
현재 스프린트(sprint-XX)의 범위 안에 있음을 확인했음 ✅

---
진행할까요?
```

아래 상황에서는 반드시 계획을 먼저 제출할 것:
1. 새로운 파일/모듈을 만들 때
2. 기존 파일 구조가 바뀔 때
3. 스프린트 범위 밖의 작업이 필요하다고 판단될 때
4. 리팩토링 범위가 파일 2개 이상일 때

### 2단계 — 작업 완료 후 리포트 저장

작업이 완료되면 아래 형식의 리포트를 해당 스프린트 폴더에 저장할 것.

**파일명 규칙**: `docs/sprints/sprint-XX/YYYYMMDD-HHMM-{작업명}.md`
**예시**: `docs/sprints/sprint-01/20240315-1430-user-auth-jwt.md`

---

#### 리포트 형식
```markdown
# [작업명]

**날짜**: YYYY-MM-DD HH:MM
**스프린트**: Sprint XX
**상태**: ✅ 완료 / ⚠️ 부분 완료 / ❌ 실패

---

## 무엇을 했는가

이번 작업에서 구현한 것을 한 문단으로 요약.
기술 용어보다 **무엇이 가능해졌는지** 중심으로 서술.

---

## 왜 이렇게 했는가

결정한 내용과 그 이유를 항목별로 기술.
대안이 있었다면 왜 이 방법을 선택했는지 함께 설명.

---

## 작업 흐름 (Workflow)

작업이 진행된 순서를 단계별로 기술.
코드보다 **흐름과 판단** 중심으로.

1. ...
2. ...
3. ...

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `경로/파일명` | 생성/수정/삭제 | 한 줄 설명 |

---

## 다음 작업에서 고려할 것

이번 작업 중 발견한 주의사항, 미완성 부분, 다음 스프린트에 넘긴 항목.
```

---

### 스프린트 목표 파일 형식 (sprint-XX.md)
```markdown
# Sprint XX — [스프린트 이름]

**기간**: YYYY-MM-DD ~ YYYY-MM-DD
**목표**: 한 줄 요약

---

## 작업 목록

- [ ] 작업 A
- [ ] 작업 B

---

## 완료 조건 (Definition of Done)

- 조건 1
- 조건 2

---

## 이번 스프린트에서 하지 않는 것

- 항목 A (→ Sprint 0X로 이월)
- 항목 B (범위 밖)
```

---

### 작업 완료 후 체크리스트
```
- [ ] TypeScript 에러 없음
- [ ] 주석 한국어로 작성됨
- [ ] 하드코딩된 값 없음 (상수 또는 환경변수 사용)
- [ ] 새 파일이 올바른 디렉토리에 위치함
- [ ] 리포트가 해당 스프린트 폴더에 저장됨
```

---

## 🚫 절대 하면 안 되는 것

- `mongoose` 사용
- `any` 타입 사용
- `.env` 파일 직접 수정
- 승인 없이 구현 시작
- 스프린트 범위 밖 기능 선구현
- `console.log` 디버깅 코드 커밋

---

## 📎 환경변수 목록
```
# server/.env
PORT=
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
EMAIL_USER=
EMAIL_PASS=

# app/.env
EXPO_PUBLIC_API_URL=
```