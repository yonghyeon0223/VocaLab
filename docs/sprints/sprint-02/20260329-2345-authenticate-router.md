# authenticate 미들웨어 + authController + authRouter 구현

**날짜**: 2026-03-29 23:45
**스프린트**: Sprint 02
**상태**: ✅ 완료

---

## 무엇을 했는가

인증 미들웨어(authenticate), 컨트롤러(authController), 라우터(auth.ts)를 구현하고 index.ts에 등록했다.
이로써 서버의 모든 인증 엔드포인트(/api/auth/*)가 완전히 동작 가능한 상태가 됐다.

---

## 왜 이렇게 했는가

- **authenticate 분리**: 인증 검증 로직을 미들웨어로 분리해 logout처럼 인증이 필요한 엔드포인트에 선택적으로 적용한다. refresh는 만료된 토큰도 받아야 하므로 authenticate를 거치지 않고 service 내부에서 직접 처리한다.
- **refresh에 authenticate 미적용**: Access Token이 만료된 상태로 refresh 요청이 오는 것이 정상 시나리오다. authenticate는 만료된 토큰을 거부하므로 refresh 엔드포인트에는 적용할 수 없다.
- **controller 역할 최소화**: Zod parse → service 호출 → 응답 반환 세 줄로 제한한다. 비즈니스 판단은 모두 authService에 있다.

---

## 작업 흐름 (Workflow)

1. authenticate.ts 작성 — Bearer 토큰 추출 → verifyAccessToken → req.userId 주입
2. authController.ts 작성 — register, sendVerification, verifyEmail, login, refresh, logout 6개 핸들러
3. routes/auth.ts 작성 — 공개/보호 엔드포인트 분리 등록
4. index.ts에 authRouter 추가
5. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `server/src/middlewares/authenticate.ts` | 생성 | Bearer 토큰 검증, req.userId 주입 |
| `server/src/controllers/authController.ts` | 생성 | 6개 인증 핸들러 |
| `server/src/routes/auth.ts` | 생성 | /api/auth/* 라우터 정의 |
| `server/src/index.ts` | 수정 | authRouter 등록 |

---

## 다음 작업에서 고려할 것

- 다음은 앱 사이드 작업: signupStore, SignupScreen 수정, VerifyEmailScreen 신규 구현
- VerifyEmailScreen: 6자리 OTP 입력, 1분 쿨다운 재발송 타이머
- app/src/services/authService.ts: register(email만), verifyEmail(email+password+code) 방식으로 변경
