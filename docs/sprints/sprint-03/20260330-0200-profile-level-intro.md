# 프로필 설정 — 화면 2 난이도 안내

**날짜**: 2026-03-30 02:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

레벨 테스트 전 안내 화면(화면 2)을 구현했다. "처음 만날 때"와 "실전 적용" 두 카드로 레벨이 어떻게 쓰이는지 설명하고, "문장 보러 가기" 버튼으로 화면 3으로 이동한다.

---

## 왜 이렇게 했는가

- **순수 UI 화면**: API 호출 없이 정보만 전달한다. 사용자가 레벨 테스트의 목적을 이해하고 진입하도록 한다.
- **카드 구조**: 두 레벨(easyLevel, activeLevel)이 각각 어느 학습 활동에 쓰이는지 시각적으로 구분해 보여준다. pill로 학습 활동(읽기·듣기·말하기·쓰기)을 나열해 연관성을 명확히 한다.

---

## 작업 흐름 (Workflow)

1. `ProfileLevelIntroScreen.tsx` — 플레이스홀더를 실제 UI로 교체
2. `ProfileLevelTestScreen.tsx` — 화면 3 플레이스홀더 생성
3. `RootNavigator.tsx` — `ProfileLevelTest` 라우트 추가
4. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/screens/ProfileLevelIntroScreen.tsx` | 수정 | 플레이스홀더 → 실제 UI 구현 |
| `app/src/screens/ProfileLevelTestScreen.tsx` | 생성 | 화면 3 플레이스홀더 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | ProfileLevelTest 라우트 추가 |

---

## 다음 작업에서 고려할 것

- 화면 3 문장 평가 구현 시 `ProfileLevelTestScreen.tsx` 교체
- 서버에 `GET /api/sentences/test?level=N` 엔드포인트 및 시드 데이터 필요
