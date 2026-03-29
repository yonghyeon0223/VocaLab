# 프로필 설정 — 화면 5 학습 목적 선택

**날짜**: 2026-03-30 05:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

학습 목적 선택 화면(화면 5)을 완성했다. 32개 목적 칩을 5개 카테고리로 묶어 그리드 형태로 표시하고, 최소 1개~최대 5개 선택 규칙을 구현했다. "다음" 버튼에서 선택된 목적을 DB에 저장하고 화면 6(완료)으로 이동한다.

---

## 왜 이렇게 했는가

- **카테고리 그룹 분리**: 32개를 나열하면 사용자가 압도될 수 있다. 일상·학교·시험·직군·콘텐츠로 구분해 자신에게 해당하는 구간을 빠르게 탐색할 수 있도록 했다.
- **마지막 1개 해제 불가**: 선택이 0개가 되면 다음 버튼이 비활성화되는데, 그 전에 사용자가 모든 칩을 해제하는 혼란을 방지한다. 항상 최소 1개가 선택된 상태를 유지한다.
- **최대 5개 도달 시 나머지 비활성**: 선택 중인 칩은 건드리지 않고 선택하지 않은 칩만 비활성화한다. 카운터 색상도 빨간색으로 전환해 제한에 도달했음을 명확히 표시한다.
- **카운터는 오른쪽 정렬**: 타이틀 영역 아래에 전체 카운터를 두지 않고 별도 행으로 분리해, 선택 개수를 항상 확인 가능하게 했다.

---

## 작업 흐름 (Workflow)

1. `app/src/screens/ProfilePurposeScreen.tsx` — 플레이스홀더 → 실제 구현 (칩 선택 UI, 저장 로직)
2. `app/src/screens/ProfileCompleteScreen.tsx` — 화면 6 플레이스홀더 생성
3. `app/src/navigation/RootNavigator.tsx` — ProfileComplete 라우트 추가
4. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/screens/ProfilePurposeScreen.tsx` | 수정 | 플레이스홀더 → 실제 구현 |
| `app/src/screens/ProfileCompleteScreen.tsx` | 생성 | 화면 6 플레이스홀더 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | ProfileComplete 라우트 추가 |

---

## 다음 작업에서 고려할 것

- 화면 6(프로필 완료): 닉네임 아바타, 학습 목적 태그, 레벨 요약, "첫 단어 세트 만들기" / "나중에 할게요" 버튼
- 두 버튼 모두 `completeProfile()` 호출 → `profileCompleted: true` → RootNavigator가 메인 앱으로 전환
- profileStore에서 easyLevel/activeLevel/hardLevel을 읽어야 하므로, 화면 4에서 저장할 때 store에도 반영할 것 검토
