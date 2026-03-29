# 프로필 설정 — 화면 3 문장 평가

**날짜**: 2026-03-30 03:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

레벨 테스트 문장 평가 화면(화면 3)을 완성했다. 서버에 testSentences 시드 데이터(30개)와 `GET /api/sentences/test?level=N` 엔드포인트를 추가했고, 앱에서 lv.1~10 문장을 순서대로 평가하는 화면을 구현했다. 역전 방지 로직, 이전 레벨 재평가, 문장 순환, 진행 바 등 스펙을 전부 구현했다.

---

## 왜 이렇게 했는가

- **예문 prefetch**: 화면 진입 시 lv.1~10 전체를 10개 병렬 요청으로 한 번에 불러온다. 레벨 이동 시 추가 로딩 없이 즉시 표시된다. 이미 로드됐으면 재요청하지 않는다.
- **역전 방지를 store에서 처리**: `setRating` 호출 시 이후 레벨의 역전 평가를 자동 초기화한다. 화면이 이 로직을 알 필요 없이 단순히 `setRating`만 호출하면 된다.
- **진행 바 클릭으로 자유 이동**: 10개 세그먼트를 각각 터치해 해당 레벨로 바로 이동할 수 있다. "이전/다음" 버튼 외에 비선형 이동도 지원한다.
- **DB 저장은 화면 3에서 하지 않음**: 스펙 대로 화면 4 완료 시점에 levelRatings와 계산된 레벨 값을 한 번에 저장한다.
- **LEVEL_LABELS, RATING_OPTIONS를 constants/levels.ts에 분리**: 화면 4(결과 확인), 프로필 수정 화면에서도 동일하게 사용하기 위해 공통 상수로 추출했다.

---

## 작업 흐름 (Workflow)

1. `shared/types.ts` — `TestSentence` 타입 추가
2. `server/src/seeds/testSentences.ts` — 30개 시드 데이터
3. `server/src/repositories/sentenceRepository.ts` — `findByLevel`, `seedIfEmpty`
4. `server/src/validators/sentenceValidator.ts` — query level 검증
5. `server/src/controllers/sentenceController.ts` + `routes/sentences.ts` — `GET /api/sentences/test`
6. `server/src/index.ts` — sentenceRouter 등록, 시드 실행
7. `app/src/constants/levels.ts` — LEVEL_LABELS, RATING_ORDER, RATING_OPTIONS
8. `app/src/stores/levelTestStore.ts` — ratings, sentences, 역전 방지 setRating
9. `app/src/services/sentenceService.ts` — fetchAllTestSentences (병렬)
10. `ProfileLevelTestScreen.tsx` — 실제 구현
11. `ProfileLevelResultScreen.tsx` — 화면 4 플레이스홀더
12. `RootNavigator.tsx` — ProfileLevelResult 라우트 추가
13. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `shared/types.ts` | 수정 | TestSentence 타입 추가 |
| `server/src/seeds/testSentences.ts` | 생성 | 30개 시드 데이터 |
| `server/src/repositories/sentenceRepository.ts` | 생성 | findByLevel, seedIfEmpty |
| `server/src/validators/sentenceValidator.ts` | 생성 | level query 검증 |
| `server/src/controllers/sentenceController.ts` | 생성 | GET /api/sentences/test 핸들러 |
| `server/src/routes/sentences.ts` | 생성 | sentences 라우터 |
| `server/src/index.ts` | 수정 | sentenceRouter 등록, 시드 실행 |
| `app/src/constants/levels.ts` | 생성 | LEVEL_LABELS, RATING_ORDER, RATING_OPTIONS |
| `app/src/stores/levelTestStore.ts` | 생성 | ratings, sentences, 역전 방지 로직 |
| `app/src/services/sentenceService.ts` | 생성 | 전체 예문 병렬 fetch |
| `app/src/screens/ProfileLevelTestScreen.tsx` | 수정 | 플레이스홀더 → 실제 구현 |
| `app/src/screens/ProfileLevelResultScreen.tsx` | 생성 | 화면 4 플레이스홀더 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | ProfileLevelResult 라우트 추가 |

---

## 다음 작업에서 고려할 것

- 화면 4(결과 확인): `levelTestStore`의 ratings로 easyLevel/activeLevel/hardLevel 계산 후 DB 저장, 바 차트 표시
