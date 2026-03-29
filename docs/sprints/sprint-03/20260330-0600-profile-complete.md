# 프로필 설정 — 화면 6 완료

**날짜**: 2026-03-30 06:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

프로필 설정 완료 화면(화면 6)을 구현했다. 닉네임 아바타, 학습 목적 태그, 권장 학습 난이도 카드를 표시하고 "첫 단어 세트 만들기" / "나중에 할게요" 두 버튼 모두 `completeProfile()` 호출로 `profileCompleted: true`를 DB에 저장한 후 RootNavigator가 자동으로 메인 앱으로 전환한다. 또한 화면 4/5의 저장 결과를 profileStore에 동기화해 화면 6이 이를 읽을 수 있도록 profileStore와 profileService를 확장했다.

---

## 왜 이렇게 했는가

- **profileStore 확장**: 화면 6에서 easyLevel/activeLevel/hardLevel/purposes를 표시하려면 이 값들이 메모리에 있어야 한다. levelTestStore에서 다시 계산하는 방법도 있었지만, 화면 4/5에서 이미 DB에 저장한 값을 store에도 동기화하는 것이 더 명확하다.
- **profileService에서 store 동기화**: 화면이 직접 store setter를 호출하지 않고 profileService의 updateProfile에서 응답 기반으로 store를 갱신한다. 이렇게 하면 어떤 화면에서 updateProfile을 호출하든 자동으로 store가 최신 상태를 유지한다.
- **completeProfile 후 명시적 navigate 불필요**: profileCompleted가 true가 되면 RootNavigator가 이를 감지해 메인 앱을 자동 렌더링한다. 화면에서 navigation.navigate를 추가로 호출하면 오히려 상태 불일치가 생길 수 있다.
- **두 버튼이 동일한 함수 호출**: "첫 단어 세트 만들기"와 "나중에 할게요"는 완료 처리 자체는 동일하다. 이후 메인 앱에서의 행동(단어 세트 생성 화면으로 바로 이동 등)은 메인 앱 스프린트에서 구현한다.

---

## 작업 흐름 (Workflow)

1. `app/src/stores/profileStore.ts` — easyLevel, activeLevel, hardLevel, purposes, setLevels, setPurposes 추가
2. `app/src/services/profileService.ts` — updateProfile 응답에서 레벨/목적 store 동기화
3. `app/src/screens/ProfileCompleteScreen.tsx` — 플레이스홀더 → 실제 구현
4. TypeScript 컴파일 확인 → 에러 없음

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/stores/profileStore.ts` | 수정 | easyLevel/activeLevel/hardLevel/purposes 필드 + 세터 추가 |
| `app/src/services/profileService.ts` | 수정 | updateProfile에서 레벨/목적 store 동기화 |
| `app/src/screens/ProfileCompleteScreen.tsx` | 수정 | 플레이스홀더 → 실제 구현 |

---

## 다음 작업에서 고려할 것

- Sprint 03 화면 1~6 전체 구현 완료
- 다음 스프린트에서 메인 앱 진입 시 "첫 단어 세트 만들기" 버튼에 해당하는 화면으로 deep link 처리 검토
- 프로필 수정 화면은 별도 스프린트에서 구현 예정
