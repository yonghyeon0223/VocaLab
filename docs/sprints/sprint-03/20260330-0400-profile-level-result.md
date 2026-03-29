# 프로필 설정 — 화면 4 레벨 결과 확인

**날짜**: 2026-03-30 04:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

레벨 테스트 결과 확인 화면(화면 4)을 완성했다. 화면 3에서 평가한 lv.1~10 데이터를 바탕으로 easyLevel/activeLevel/hardLevel을 계산해 시각적으로 보여주고, "다음" 버튼 클릭 시 계산된 레벨 값과 전체 평가 기록을 DB에 저장한 후 화면 5(학습 목적 선택)로 이동한다.

---

## 왜 이렇게 했는가

- **levelCalculator를 별도 유틸로 분리**: 계산 로직을 화면에서 분리해 순수 함수로 만들었다. 화면 6(완료), 프로필 수정 화면에서도 동일 로직을 재사용할 수 있고, 단위 테스트하기도 쉽다.
- **폴백 발생 여부를 명시적으로 표시**: 사용자가 특정 구간을 평가하지 않아 폴백이 적용된 경우 안내 메시지를 보여준다. 왜 설정된 레벨이 예상과 다를 수 있는지 투명하게 전달하기 위함이다.
- **바 차트로 평가 결과 시각화**: lv.1~10 각 레벨에 대한 평가를 한 눈에 파악할 수 있다. 평가하지 않은 레벨은 회색으로, 평가한 레벨은 해당 rating 색상으로 표시한다.
- **DB 저장은 이 화면에서 한 번만**: 화면 3에서는 store에만 저장하고, 화면 4 "다음" 버튼에서 레벨 값과 전체 평가 기록을 한 번에 DB에 반영한다. 중간 단계마다 저장하면 불완전한 데이터가 남을 수 있기 때문이다.

---

## 작업 흐름 (Workflow)

1. `app/src/utils/levelCalculator.ts` — sprint-03 스펙 기반 레벨 계산 로직 구현
2. `app/src/screens/ProfileLevelResultScreen.tsx` — 플레이스홀더 → 실제 구현 (바 차트, 폴백 메시지, 결과 카드)
3. `app/src/screens/ProfilePurposeScreen.tsx` — 화면 5 플레이스홀더 생성
4. `app/src/navigation/RootNavigator.tsx` — ProfilePurpose 라우트 추가
5. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/utils/levelCalculator.ts` | 생성 | easyLevel/activeLevel/hardLevel 계산 + 폴백 로직 |
| `app/src/screens/ProfileLevelResultScreen.tsx` | 수정 | 플레이스홀더 → 실제 구현 |
| `app/src/screens/ProfilePurposeScreen.tsx` | 생성 | 화면 5 플레이스홀더 |
| `app/src/navigation/RootNavigator.tsx` | 수정 | ProfilePurpose 라우트 추가 |

---

## 다음 작업에서 고려할 것

- 화면 5(학습 목적 선택): 32개 칩 중 최소 1개~최대 5개 선택, `purposes` 배열로 DB 저장
- 화면 6(프로필 완료): 아바타 + 레벨 요약 + "첫 단어 세트 만들기" / "나중에 할게요" 버튼, `completeProfile()` 호출로 profileCompleted → true
