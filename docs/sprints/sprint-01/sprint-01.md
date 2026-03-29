# Sprint 01 — 이메일 인증 + 디자인 시스템

**기간**: Sprint 01
**목표**: 이메일 회원가입/로그인을 구현하고, 앱 전체에서 쓸 디자인 시스템과 인증 화면 UI를 완성한다

---

## 디자인 시스템 스펙

### 컬러 토큰
```typescript
// app/src/constants/colors.ts
export const colors = {
  background: {
    primary: '#0f0f0f',    // 메인 배경
    secondary: '#1a1a1a',  // 입력창, 카드 배경
    tertiary: '#2a2a2a',   // 구분선, 비활성
  },
  text: {
    primary: '#f5f5f5',    // 주요 텍스트
    secondary: '#888888',  // 보조 텍스트
    disabled: '#444444',   // placeholder
  },
  border: {
    default: '#2e2e2e',    // 기본 테두리
    focused: '#6c63ff',    // 포커스 상태
  },
  accent: '#6c63ff',       // 포인트 컬러 (버튼, 링크, 강조)
  error: '#e24b4a',        // 에러 상태
}
```

### 타이포그래피
- 제목: 26px / weight 500 / color text.primary
- 부제목: 13px / weight 400 / color text.secondary
- 라벨: 12px / weight 400 / color text.secondary
- 본문: 14px / weight 400 / color text.primary
- 소문자: 11px / weight 400 / color text.secondary

### 공통 컴포넌트 (`app/src/components/ui/`)
- `Button` — primary (accent 배경) / disabled 상태
- `TextInput` — 기본 / 포커스 (accent 테두리) / 에러 상태 (error 테두리 + 에러 메시지)
- `PasswordInput` — TextInput + 강도 표시 바 (4단계)
- `Logo` — 로고마크 + VocaLab 텍스트

---

## DB 모델

### `users` 컬렉션
```typescript
// shared/types.ts
type User = {
  _id: ObjectId,
  email: string,                // 유니크 인덱스
  password: string,             // bcrypt 해싱된 값 (평문 절대 저장 금지)
  refreshToken: string | null,  // 로그인 시 저장, 로그아웃 시 null로 초기화
  isVerified: boolean,          // 이메일 인증 여부 (Sprint 02에서 활용, 기본값 false)
  createdAt: Date,
  updatedAt: Date,
}
```

### 인덱스
```
email: unique index
```

### 검증 스키마 (Zod)
```typescript
// server/src/validators/authValidator.ts
const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').max(254),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(72, '비밀번호는 최대 72자까지 가능합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
```

---

## API 엔드포인트

### POST /api/auth/register
```
요청: { email, password, passwordConfirm }
성공: 201 { success: true, data: { userId } }
실패: 409 이메일 중복
      400 Zod 검증 실패 (형식 오류, 비밀번호 불일치 등)
```

### POST /api/auth/login
```
요청: { email, password }
성공: 200 { success: true, data: { accessToken, refreshToken } }
실패: 401 이메일 없음 or 비밀번호 불일치
```

### POST /api/auth/refresh
```
요청: { refreshToken }
성공: 200 { success: true, data: { accessToken } }
실패: 401 Refresh Token 만료 or 유효하지 않음
```

### POST /api/auth/logout
```
요청: Authorization 헤더에 Access Token
성공: 200 { success: true }
동작: DB에서 refreshToken 필드를 null로 초기화
```

---

## 작업 목록

### 1. 디자인 시스템 (가장 먼저)
- [x] `app/src/constants/colors.ts` 컬러 토큰 정의
- [x] `Button` 컴포넌트
- [x] `TextInput` 컴포넌트
- [x] `PasswordInput` 컴포넌트 (강도 바 포함)
- [x] `Logo` 컴포넌트

### 2. Server
- [x] `shared/types.ts` — User 타입 추가
- [x] users 컬렉션 email 유니크 인덱스 설정
- [x] `server/src/validators/authValidator.ts` — Zod 스키마 정의
- [x] `server/src/repositories/userRepository.ts` — findByEmail, insertUser, updateRefreshToken
- [x] `server/src/utils/jwt.ts` — Access Token (24시간) / Refresh Token (365일) 발급 및 검증
- [x] `server/src/services/authService.ts` — register, login
- [x] `server/src/middlewares/authMiddleware.ts` — Access Token 검증
- [x] `server/src/routes/auth.ts` — 4개 엔드포인트 연결

### 3. App — 화면
- [x] 로그인 화면 (`screens/LoginScreen.tsx`)
  - 타이틀: "반가워요!"
  - 부제목: "오늘은 어떤 단어를 만나볼까요?"
  - 이메일 / 비밀번호 입력
  - 에러 메시지 표시
  - 로그인 버튼
  - 회원가입 화면 이동 링크

- [x] 회원가입 화면 (`screens/SignupScreen.tsx`)
  - 타이틀: "과학적으로 설계된 학습, 지금 시작해요"
  - 부제목: "인지과학 기반 단어 학습을 직접 경험해보세요."
  - 이메일 / 비밀번호 / 비밀번호 확인 입력
  - 비밀번호 강도 바 (4단계)
  - 에러 메시지 표시
  - 이용약관 안내 텍스트
  - 계정 만들기 버튼

### 4. App — 토큰 관리
- [x] 로그인 성공 시 Access Token → Zustand store, Refresh Token → AsyncStorage
- [x] `app/src/services/api.ts` — Axios 인스턴스 생성
  - 모든 요청에 Access Token 자동 첨부
  - 401 응답 시 Refresh Token으로 자동 재발급 후 요청 재시도
- [x] 앱 재실행 시 AsyncStorage에서 Refresh Token 읽어 자동 로그인
- [x] 로그인 여부에 따라 화면 분기 (미인증 → 로그인 / 인증 → 메인)
- [x] 로그아웃 시 양쪽 토큰 모두 삭제

---

## 에러 메시지 정의

| 상황 | 메시지 |
|------|--------|
| 이메일 형식 오류 | 올바른 이메일 형식이 아닙니다 |
| 비밀번호 8자 미만 | 비밀번호는 최소 8자 이상이어야 합니다 |
| 영문+숫자 미포함 | 영문자와 숫자를 모두 포함해야 합니다 |
| 비밀번호 불일치 | 비밀번호가 일치하지 않습니다 |
| 이메일 중복 | 이미 사용 중인 이메일입니다 |
| 로그인 실패 | 이메일 또는 비밀번호를 확인해주세요 |
| 토큰 만료 | 다시 로그인해주세요 |

---

## 완료 조건 (Definition of Done)

- 다크모드 컬러 토큰이 `constants/colors.ts`에 정의됨
- 공통 컴포넌트가 `components/ui/`에 존재하고 재사용 가능함
- 회원가입 → 로그인 → 메인화면 진입 흐름이 앱에서 동작함
- 비밀번호 bcrypt 해싱 저장 확인
- Zod 서버 검증 동작 확인
- 비밀번호 / 비밀번호 확인 불일치 시 에러 메시지 표시
- 잘못된 비밀번호 → 401, 중복 이메일 → 409 에러 반환
- Access Token (24시간) + Refresh Token (365일) 발급 확인
- Refresh Token이 DB에 저장됨
- Access Token 만료 시 자동 재발급 후 요청 재시도
- 앱 재실행 시 Refresh Token 있으면 자동 로그인
- 로그아웃 시 DB에서 Refresh Token null 처리 확인

---

## 이번 스프린트에서 하지 않는 것

- 이메일 인증 (→ Sprint 02)
- 로그인 실패 횟수 제한 (→ 보안 강화 스프린트)
- 소셜 로그인 (→ 나중에)
- 비밀번호 찾기 / 재설정 (→ 나중에)
- 메인 화면 실제 콘텐츠 (→ Sprint 03~)
- UI 애니메이션 (→ 나중에)

---

## 참고 정보

- **GitHub 레포**: https://github.com/yonghyeon0223/VocaLab.git
- **디자인 방향**: 다크모드 기본, 포인트 컬러 #6c63ff
- **환경변수**:
  - `JWT_ACCESS_EXPIRES_IN=24h`
  - `JWT_REFRESH_EXPIRES_IN=365d`
- **이전 스프린트**: Sprint 00 완료