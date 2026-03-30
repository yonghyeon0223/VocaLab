# 난이도 테스트 UX 개선

**날짜**: 2026-03-30 07:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

ProfileLevelTestScreen의 UX를 세 가지 방향으로 개선했다. (1) progress bar에서 현재 레벨 세그먼트만 높이를 키워 위치를 직관적으로 강조한다. (2) 이전/다음 버튼을 제거하고 좌우 스와이프로 레벨 간 이동을 지원한다. (3) lv.10 평가 즉시 DB에 저장하고 결과 화면으로 자동 이동한다. ProfileLevelResultScreen에서는 저장 로직을 제거하고 결과 표시와 다음 화면 이동만 담당한다.

---

## 왜 이렇게 했는가

- **progress bar 높이 강조**: 포인트 컬러 사용 금지 제약 안에서 현재 레벨을 구분하는 방법으로, 색상 대신 height 차이(현재 8px, 나머지 4px)를 선택했다. `alignItems: 'flex-end'`로 바닥 정렬해 올라오는 효과를 낸다.
- **스와이프 전환**: `PanResponder`로 수평 스와이프만 포착한다. `Math.abs(dx) > Math.abs(dy)` 조건으로 수직 ScrollView 스크롤과 충돌하지 않게 했다. 우측 스와이프는 항상, 좌측 스와이프는 현재 레벨을 평가했을 때만 동작한다.
- **lv.10 자동 저장+이동**: 마지막 레벨 평가 시점이 저장의 자연스러운 트리거다. 결과 화면에서 별도 버튼을 누르는 단계를 없애 흐름이 끊기지 않게 했다. store의 `setRating`이 비동기 반영되기 전에 `{ ...ratings, 10: value }`로 직접 병합해 `calculateLevels`에 전달한다.
- **저장 실패 시 계속 진행**: 저장 실패해도 결과 화면은 볼 수 있다. 프로필 완료 화면까지 이어지는 흐름이 끊기지 않는 것을 우선시했다.

---

## 작업 흐름 (Workflow)

1. `ProfileLevelTestScreen.tsx` — `PanResponder` 추가, progress bar height 로직 변경, 이전/다음 버튼 및 nav 섹션 제거, `handleRating` lv.10 분기에서 저장+navigate 처리
2. `ProfileLevelResultScreen.tsx` — `updateProfile` import/호출 제거, `loading`/`error` state 제거, `handleNext`를 단순 navigate로 단순화
3. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/screens/ProfileLevelTestScreen.tsx` | 수정 | PanResponder 스와이프, progress bar 높이 강조, lv.10 자동 저장+이동, 버튼 제거 |
| `app/src/screens/ProfileLevelResultScreen.tsx` | 수정 | 저장 로직 제거, handleNext 단순화 |

---

## 다음 작업에서 고려할 것

- 스와이프 안내 힌트("← 스와이프로 레벨 이동 →")는 첫 진입 시에만 보여주는 방식으로 개선할 수 있다 (AsyncStorage 활용)
- lv.10 저장 실패 시 결과 화면에서 재시도 UI를 추가할지 검토
