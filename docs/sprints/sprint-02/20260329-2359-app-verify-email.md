# 앱 이메일 인증 흐름 구현

**날짜**: 2026-03-29 23:59
**스프린트**: Sprint 02
**상태**: ✅ 완료

---

## 무엇을 했는가

앱 회원가입을 이메일 인증 흐름에 맞게 2단계로 재구성했다.
SignupScreen(이메일+비밀번호 입력) → VerifyEmailScreen(6자리 OTP 인증)으로 화면이 분리됐고,
인증 완료 즉시 자동 로그인되어 메인 화면으로 이동한다.

---

## 왜 이렇게 했는가

- **signupStore 도입**: 두 화면 간 이메일/비밀번호 공유가 필요하다. navigation params에 비밀번호를 담으면 스택 히스토리에 남아 보안상 좋지 않으므로 Zustand store를 사용했다. 화면을 떠날 때 반드시 clearSignupData를 호출해 민감 정보를 제거한다.
- **OTP 칸 분리 입력**: `<TextInput maxLength={1}>` 6개를 나열해 자동 포커스 이동과 백스페이스 역방향 이동을 구현했다. 사용자 경험상 일체형 입력보다 현재 진행 상황이 명확하다.
- **쿨다운을 화면 진입 시 즉시 시작**: 이미 SignupScreen에서 register를 호출해 코드가 발송된 상태이므로, VerifyEmailScreen 진입 즉시 60초 타이머를 시작한다. 첫 발송과 재발송 쿨다운이 동일한 규칙을 따른다.
- **verifyEmail 성공 후 자동 로그인**: 서버가 verifyEmail 응답으로 토큰을 즉시 발급하므로, 앱에서 바로 authStore에 저장한다. isAuthenticated가 true로 바뀌면 RootNavigator가 자동으로 Main으로 전환한다.

---

## 작업 흐름 (Workflow)

1. authService.ts 수정 — register(email만), sendVerification, verifyEmail(자동 로그인 포함) 추가
2. signupStore.ts 생성 — email/password 임시 보관 + clearSignupData
3. SignupScreen.tsx 수정 — register 호출 후 signupStore에 저장 → VerifyEmail로 이동
4. VerifyEmailScreen.tsx 생성 — OTP 입력 6칸, 60초 쿨다운 재발송, verifyEmail 호출
5. RootNavigator.tsx 수정 — VerifyEmail 라우트 추가
6. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/services/authService.ts` | 수정 | register(email만), sendVerification, verifyEmail 추가 |
| `app/src/stores/signupStore.ts` | 생성 | 회원가입 흐름 중 이메일/비밀번호 임시 저장 |
| `app/src/screens/SignupScreen.tsx` | 수정 | register 후 VerifyEmail로 이동하도록 변경 |
| `app/src/screens/VerifyEmailScreen.tsx` | 생성 | 6자리 OTP 입력, 재발송 쿨다운, verifyEmail 완료 처리 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | VerifyEmail 라우트 추가 |

---

## 다음 작업에서 고려할 것

- Sprint 02 서버+앱 전체 완료. Sprint 03으로 이월.
- 로그인 잠금(20회 초과) 안내 메시지는 현재 서버 에러 메시지 그대로 표시된다. 추후 UX 개선 여지 있음.
