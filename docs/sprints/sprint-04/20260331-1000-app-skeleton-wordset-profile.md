# 앱 뼈대 + 단어 세트 생성 + 프로필

**날짜**: 2026-03-31 10:00
**스프린트**: Sprint 04
**상태**: ✅ 완료

---

## 무엇을 했는가

메인 앱의 하단 탭 네비게이션(홈/학습/장기기억/프로필)을 구성하고, 홈 화면에서 단어 세트를 생성·조회·삭제할 수 있게 했다. 프로필 화면에서는 닉네임 수정, 학습 목적 변경, 난이도 직접 설정이 가능하며 탭 전환 시 자동 저장된다. 로그인/자동로그인 시 서버에서 프로필 전체 데이터를 가져와 store에 동기화하도록 했다.

---

## 왜 이렇게 했는가

- **MainTabNavigator를 NativeStack 위에 올림**: 단어 세트 생성 플로우, 난이도 재테스트 같은 전체 화면 플로우가 탭 위에 떠야 하므로 탭 바가 사라지는 구조가 자연스럽다.
- **wordSetStore에 loaded 플래그**: 최초 1회만 서버에서 가져오고, 이후에는 생성/삭제 시 store에서 즉시 반영해 불필요한 네트워크 요청을 줄인다.
- **프로필 조회 API 신설**: 기존에는 로그인 시 `profileCompleted`만 반환했다. Sprint 04부터 프로필 화면에서 닉네임/목적/레벨을 표시해야 하므로 전체 프로필을 가져오는 GET 엔드포인트를 추가했다.
- **프로필 자동 저장**: 저장 버튼 없이 탭 전환 시 변경 감지 → PATCH. UX 마찰을 최소화.

---

## 작업 흐름

1. shared/types.ts에 WordSet, Word 타입 정의
2. 서버: validator → repository → service → controller → routes 순서로 단어 세트 CRUD 구현
3. 서버: 프로필 조회(GET) 엔드포인트 추가
4. 서버 index.ts에 wordSet 라우트 등록, DB 인덱스 등록
5. 클라이언트: wordSetStore, wordSetService 구현
6. 클라이언트: HomeScreen (대시보드 placeholder + 세트 목록 + FAB 버튼)
7. 클라이언트: WordSetNameScreen, WordSetWordsScreen (세트 생성 플로우)
8. 클라이언트: LearningScreen, MemoryLabScreen (placeholder)
9. 클라이언트: ProfileScreen (3탭: 기본/학습목적/난이도, 자동저장, 토스트)
10. 클라이언트: MainTabNavigator (하단 4탭 + 플로우 화면)
11. RootNavigator에서 MainScreen → MainTabNavigator로 교체
12. authService: 로그인/자동로그인 시 fetchProfile 호출 추가
13. 로그아웃 경로에 wordSetStore.reset() 추가

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `shared/types.ts` | 수정 | WordSet, Word 타입 추가 |
| `server/src/validators/wordSetValidator.ts` | 생성 | 세트 생성 Zod 스키마 |
| `server/src/repositories/wordSetRepository.ts` | 생성 | wordSets CRUD |
| `server/src/repositories/wordRepository.ts` | 생성 | words 일괄 삽입/조회/삭제 |
| `server/src/services/wordSetService.ts` | 생성 | 세트 생성/조회/삭제 비즈니스 로직 |
| `server/src/controllers/wordSetController.ts` | 생성 | 세트 API 엔드포인트 핸들러 |
| `server/src/routes/wordSets.ts` | 생성 | 세트 라우터 |
| `server/src/services/profileService.ts` | 수정 | getProfile 추가 |
| `server/src/controllers/profileController.ts` | 수정 | getProfile 핸들러 추가 |
| `server/src/routes/profile.ts` | 수정 | GET /profile 라우트 추가 |
| `server/src/index.ts` | 수정 | wordSet 라우트, 인덱스 등록 |
| `app/src/stores/wordSetStore.ts` | 생성 | 세트 목록 캐싱 store |
| `app/src/services/wordSetService.ts` | 생성 | 세트 API 호출 + store 동기화 |
| `app/src/services/profileService.ts` | 수정 | fetchProfile 추가 |
| `app/src/services/authService.ts` | 수정 | 로그인 시 fetchProfile, 로그아웃 시 wordSetStore.reset() |
| `app/src/services/api.ts` | 수정 | 토큰 갱신 실패 시 wordSetStore.reset() |
| `app/src/screens/HomeScreen.tsx` | 수정 | 대시보드 + 세트 목록 + FAB |
| `app/src/screens/WordSetNameScreen.tsx` | 생성 | 세트 이름 입력 |
| `app/src/screens/WordSetWordsScreen.tsx` | 생성 | 단어 일괄 입력 |
| `app/src/screens/LearningScreen.tsx` | 생성 | placeholder |
| `app/src/screens/MemoryLabScreen.tsx` | 생성 | placeholder |
| `app/src/screens/ProfileScreen.tsx` | 생성 | 3탭 프로필 (기본/학습목적/난이도) |
| `app/src/navigation/MainTabNavigator.tsx` | 생성 | 하단 탭 + 플로우 스택 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | MainScreen → MainTabNavigator |
| `CLAUDE.md` | 수정 | Sprint 04 도메인 지식, 기술 참고 업데이트 |

---

## 다음 작업에서 고려할 것

- 비밀번호 변경 기능은 이번 스프린트에서 UI만 placeholder로 남김 → 이후 스프린트에서 구현
- 난이도 재테스트 시 ProfileLevelTestScreen이 프로필 설정 플로우 외에서도 사용되므로, navigation 분기 처리 필요 (결과 후 돌아가기 등)
- 홈 대시보드의 학습 현황/복습 캘린더는 해당 기능 구현 후 실제 데이터로 교체
- 단어 세트 수정 기능 (이름 변경, 단어 추가/삭제)은 Sprint 04 범위 밖
