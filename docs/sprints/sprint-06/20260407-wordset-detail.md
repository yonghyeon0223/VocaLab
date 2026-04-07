# 단어 세트 상세 페이지 + 학습 로드맵 UI

**날짜**: 2026-04-07
**스프린트**: Sprint 06
**상태**: ✅ 완료

---

## 무엇을 했는가

단어 세트 상세 페이지를 구현했다. 8단계 학습 로드맵을 카드 리스트로 보여주고, 1단계 "단어 소개"에서는 단어 목록을 필터와 함께 볼 수 있다. 세점 메뉴로 세트 이름 수정/삭제/공유(placeholder)를 제공하며, 목록 화면과 상세 화면 양쪽에서 동일한 세점 메뉴를 사용한다.

---

## 왜 이렇게 했는가

- **8단계 로드맵을 한 화면에 리스트로 표시**: 유저가 학습 전체 구조를 한눈에 파악할 수 있다. 탭 분리 대신 단일 스크롤 화면으로 구성해 네비게이션 복잡도를 줄였다.
- **1단계에 단어 목록 + 필터 통합**: 원래 별도 "단어 탭"으로 계획했으나, 단어 소개 섹션에 넣어 화면 수를 줄였다.
- **세점 메뉴 공통 컴포넌트**: 목록과 상세에서 동일한 메뉴를 재사용해 일관성 확보.
- **WordSetNameScreen 재사용**: 생성 모드와 편집 모드를 route name(`WordSetName` vs `WordSetRename`)으로 분기해 중복 코드 방지.
- **잠금 상태 탭 무반응**: "이전 단계를 완료해주세요" 같은 안내 없이 조용히 무시. 잠금 해제 로직은 학습 기능 구현 시 추가.

---

## 작업 흐름

1. 서버: PATCH /api/word-sets/:id (이름 수정) — repository → service → controller → route
2. 클라이언트: DotMenu 공통 컴포넌트 + wordSetStore.updateWordSet + wordSetService.updateWordSetName
3. 클라이언트: WordSetDetailScreen (8단계 로드맵 + 진행률 + 세점 메뉴)
4. 클라이언트: WordIntroScreen (필터 토글 + 단어 목록, 클라이언트 state로 필터 관리)
5. 클라이언트: LearningScreen 수정 (쓰레기통 → 세점 메뉴, 카드 탭 → 상세 이동)
6. 클라이언트: HomeScreen 수정 ("최근 학습 이어하기" → 상세 연결)
7. 클라이언트: WordSetNameScreen 편집 모드 (WordSetRename route로 진입 시 기존 이름 프리필 + PATCH)

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `server/src/repositories/wordSetRepository.ts` | 수정 | updateName 함수 추가 |
| `server/src/services/wordSetService.ts` | 수정 | updateWordSetName 함수 추가 |
| `server/src/controllers/wordSetController.ts` | 수정 | updateWordSet 핸들러 추가 |
| `server/src/routes/wordSets.ts` | 수정 | PATCH /:id 라우트 추가 |
| `server/src/validators/wordSetValidator.ts` | 수정 | updateWordSetSchema 추가 |
| `app/src/components/ui/DotMenu.tsx` | 생성 | 세점 메뉴 공통 컴포넌트 |
| `app/src/screens/WordSetDetailScreen.tsx` | 생성 | 세트 상세 (8단계 로드맵) |
| `app/src/screens/WordIntroScreen.tsx` | 생성 | 1단계 단어 소개 (필터 + 목록) |
| `app/src/screens/LearningScreen.tsx` | 수정 | 세점 메뉴 + 상세 이동 |
| `app/src/screens/HomeScreen.tsx` | 수정 | 최근 학습 → 상세 연결 |
| `app/src/screens/WordSetNameScreen.tsx` | 수정 | 생성 + 편집 모드 분기 |
| `app/src/navigation/MainTabNavigator.tsx` | 수정 | 새 화면 등록 |
| `app/src/stores/wordSetStore.ts` | 수정 | updateWordSet 액션 추가 |
| `app/src/services/wordSetService.ts` | 수정 | updateWordSetName API 추가 |

---

## 다음 작업에서 고려할 것

- 2~8단계 학습 기능 구현 (문제 풀기, 진행률 기록, 오답 노트)
- 잠금 해제 로직 (이전 단계 완료 판정)
- 공유 기능 구현
- 세트 내 단어 수정/삭제/추가
- 상세 페이지 진입 시 데이터 refetch 최적화 (useFocusEffect로 이름 변경 반영 중)
