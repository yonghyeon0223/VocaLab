# 프로필 설정 — 화면 1 닉네임 입력

**날짜**: 2026-03-30 01:30
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

프로필 설정 플로우의 기반(서버 레이어 + 앱 상태 관리 + 네비게이션 분기)을 구축하고, 화면 1 닉네임 입력을 완성했다. 회원가입/로그인 후 `profileCompleted === false`이면 프로필 설정 스택으로 진입하고, 닉네임 저장 완료 후 화면 2로 이동한다.

---

## 왜 이렇게 했는가

- **Sprint 03 전체 프로필 스키마 한 번에 확정**: `insertUser` 시 모든 프로필 필드를 기본값으로 삽입한다. 이후 화면 1~5가 `PATCH /api/users/profile`로 각자 필요한 필드만 업데이트하므로, 처음부터 컬럼을 준비해둔다.
- **PATCH /api/users/profile 범용 엔드포인트**: 화면 1~5가 같은 엔드포인트를 공유한다. 전달된 필드만 업데이트하므로 각 화면이 서로 영향을 주지 않는다.
- **profileCompleted를 auth 응답에 포함**: 로그인/회원가입/자동로그인 시 서버가 profileCompleted를 함께 반환해, 별도 `/me` API 없이 네비게이터가 즉시 분기 판단할 수 있다.
- **RootNavigator 3-way 분기**: 미인증 / 인증+미완료 / 인증+완료 세 스택을 각각 독립된 Navigator로 관리한다. 상태 변화 시 React Navigation이 자동으로 전환한다.
- **다음 버튼 비활성**: `trimmed.length < 1` 또는 `> 10`이면 버튼이 비활성화된다. 잘못된 상태로 API를 호출하는 일이 원천 차단된다.

---

## 작업 흐름 (Workflow)

1. `shared/types.ts` — `RatingValue`, `LevelRatings` 타입 추가, `User`에 프로필 필드 추가
2. `userRepository.ts` — `insertUser`에 프로필 기본값 추가
3. `authService.ts` (서버) — `verifyEmail`, `login`, `refresh` 반환값에 `profileCompleted` 추가
4. `profileValidator.ts`, `userProfileRepository.ts`, `profileService.ts`, `profileController.ts`, `routes/profile.ts` 생성
5. `server/src/index.ts` — `/api/users` 라우터 등록
6. `profileStore.ts` 생성 — `profileCompleted`, `nickname` 상태 관리
7. `app/src/services/profileService.ts` 생성 — `updateProfile`, `completeProfile` API 호출
8. `authService.ts` (앱) — 로그인/회원가입/자동로그인/로그아웃 시 profileStore 동기화
9. `ProfileNicknameScreen.tsx` 생성 — 닉네임 입력 UI, 유효성, 저장
10. `ProfileLevelIntroScreen.tsx` 생성 — 화면 2 플레이스홀더
11. `RootNavigator.tsx` 수정 — 3-way 분기, ProfileStackParamList 추가
12. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `shared/types.ts` | 수정 | RatingValue, LevelRatings 추가, User에 프로필 필드 추가 |
| `server/src/repositories/userRepository.ts` | 수정 | insertUser에 프로필 기본값 추가 |
| `server/src/services/authService.ts` | 수정 | verifyEmail, login, refresh에 profileCompleted 반환 |
| `server/src/validators/profileValidator.ts` | 생성 | PATCH /api/users/profile Zod 스키마 |
| `server/src/repositories/userProfileRepository.ts` | 생성 | updateProfile, completeProfile DB 함수 |
| `server/src/services/profileService.ts` | 생성 | 프로필 업데이트 비즈니스 로직 |
| `server/src/controllers/profileController.ts` | 생성 | updateProfile, completeProfile 핸들러 |
| `server/src/routes/profile.ts` | 생성 | PATCH /profile, /profile/complete 라우터 |
| `server/src/index.ts` | 수정 | /api/users 라우터 등록 |
| `app/src/stores/profileStore.ts` | 생성 | profileCompleted, nickname 상태 관리 |
| `app/src/services/profileService.ts` | 생성 | updateProfile, completeProfile API 호출 |
| `app/src/services/authService.ts` | 수정 | 로그인/회원가입/자동로그인/로그아웃 시 profileStore 동기화 |
| `app/src/screens/ProfileNicknameScreen.tsx` | 생성 | 화면 1 닉네임 입력 UI |
| `app/src/screens/ProfileLevelIntroScreen.tsx` | 생성 | 화면 2 플레이스홀더 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | 3-way 분기, ProfileStackParamList 추가 |

---

## 다음 작업에서 고려할 것

- 화면 2 난이도 안내 구현 시 `ProfileLevelIntroScreen.tsx` 교체
- 화면 3~6 구현 시 `ProfileStackParamList`에 라우트 추가
