# 토큰 관리 + API 연동

**날짜**: 2026-03-29
**스프린트**: Sprint 01
**상태**: ✅ 완료

---

## 무엇을 했는가

로그인/회원가입 화면을 서버 API에 연결하고, 토큰 관리와 화면 분기까지 구현해 전체 인증 흐름을 완성했다. 앱을 다시 시작해도 로그인이 유지되고, Access Token이 만료되면 자동으로 재발급한다. 로그아웃하면 서버와 클라이언트 양쪽에서 토큰이 모두 제거된다.

---

## 왜 이렇게 했는가

- **Access Token → Zustand, Refresh Token → AsyncStorage**: Access Token은 매 요청마다 쓰이므로 메모리에 두고 빠르게 접근한다. Refresh Token은 앱 재실행 후에도 살아있어야 하므로 영구 저장소(AsyncStorage)에 둔다.
- **Axios 인터셉터로 토큰 자동 처리**: 모든 화면 컴포넌트가 토큰을 신경 쓰지 않아도 된다. 요청 인터셉터가 헤더에 붙이고, 응답 인터셉터가 401 시 재발급을 처리한다.
- **`_retry` 플래그로 무한 루프 방지**: 재발급 요청도 401이 오면 다시 인터셉터를 타게 된다. `_retry`가 없으면 재발급 → 실패 → 재발급... 무한 루프가 생긴다.
- **자동 로그인은 `ready` 상태로 제어**: tryAutoLogin이 끝나기 전에 네비게이터가 렌더링되면 로그인 화면이 잠깐 보였다가 메인으로 이동하는 깜빡임이 생긴다. `ready`가 true가 된 뒤에만 렌더링해 이를 막는다.
- **서버 요청 실패해도 로그아웃 보장**: logout의 try/finally 구조로 서버 요청이 실패해도 클라이언트 토큰을 반드시 지운다.

---

## 작업 흐름 (Workflow)

1. AsyncStorage 패키지 설치
2. `authStore.ts` — Access Token과 인증 상태 Zustand store 작성
3. `api.ts` — Axios 인스턴스 + 요청/응답 인터셉터 작성
4. `authService.ts` — register, login, tryAutoLogin, logout 작성
5. `MainScreen.tsx` — 임시 메인 화면 + 로그아웃 버튼 작성
6. `RootNavigator.tsx` — isAuthenticated 기반 화면 분기 수정
7. `LoginScreen.tsx` — API 연동 + 로딩 상태 추가
8. `SignupScreen.tsx` — API 연동 + 로딩 상태 + 일반 에러 메시지 추가
9. `App.tsx` — tryAutoLogin + ready 상태로 스플래시 처리
10. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/stores/authStore.ts` | 생성 | Access Token + 인증 상태 Zustand store |
| `app/src/services/api.ts` | 생성 | Axios 인스턴스 + 토큰 인터셉터 |
| `app/src/services/authService.ts` | 생성 | register, login, tryAutoLogin, logout |
| `app/src/screens/MainScreen.tsx` | 생성 | 임시 메인 화면 + 로그아웃 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | 인증 상태 기반 화면 분기 |
| `app/src/screens/LoginScreen.tsx` | 수정 | API 연동 + 로딩 상태 |
| `app/src/screens/SignupScreen.tsx` | 수정 | API 연동 + 로딩 상태 + 일반 에러 |
| `app/App.tsx` | 수정 | tryAutoLogin + ready 상태 스플래시 |

---

## 다음 작업에서 고려할 것

- `app/.env`에 `EXPO_PUBLIC_API_URL`을 PC의 로컬 IP로 설정해야 앱에서 서버에 접근 가능 (`localhost`는 폰에서 안 됨)
- MainScreen은 Sprint 03~에서 실제 학습 콘텐츠로 교체 예정
- 회원가입 성공 후 로그인 화면으로 이동하는데, 자동 로그인 처리로 개선 가능 (이번 스프린트 범위 밖)
