# Sprint 04 — 버그 수정 및 디자인 개선

**날짜**: 2026-03-31 15:00
**스프린트**: Sprint 04
**상태**: ✅ 완료

---

## 무엇을 했는가

Sprint 04 초기 구현 이후 발견된 버그와 디자인 이슈를 일괄 수정했다. 네비게이션 충돌, safe area 미적용, UX 흐름 개선 등 실사용 테스트에서 발견된 문제들을 해결했다.

---

## 주요 변경사항

### 버그 수정

1. **재테스트 navigate 에러**: MainTabNavigator에 `ProfileLevelRetestResult`로 등록돼 있었으나 화면에서 `ProfileLevelResult`로 navigate → 이름 통일 후 `RetestLevel`/`RetestResult`로 개명해 ProfileStack과 충돌 방지
2. **재테스트 결과 화면 "다음" 무반응**: `getParent()?.goBack()` → `popToTop()`으로 변경
3. **재테스트 시 이전 데이터 잔존**: 재테스트 진입 시에만 `levelTestStore.reset()` 호출, 결과 화면에서는 제거
4. **프로필 화면 이탈 시 자동저장 누락**: `useFocusEffect` cleanup에서 현재 탭 변경사항 감지 → 서버 저장
5. **프로필 완료 후 결과 화면 회귀**: ProfileStack/MainTabNavigator 화면 이름 충돌로 navigator 전환 시 이전 state 복원됨 → 고유 이름으로 해결 + 완료 화면 뒤로가기 차단 + 서버 실패 시에도 store 업데이트
6. **회원가입 플로우 결과 초기화**: 결과 화면 handleNext에서 `levelTestStore.reset()` 제거

### 디자인/UX 개선

1. **로그인 회원가입 버튼**: 전체 너비 + accent tint 배경으로 가시성 향상
2. **예문 난이도 안내 화면**: 스크롤 카드 → 수평 슬라이드 5장 (VocaLab 철학 → 3구간 → 시작), 도트 인디케이터, 마지막 장에서만 버튼 활성
3. **학습 목적 선택 해제**: 1개일 때도 해제 허용, 0개면 다음/저장 비활성
4. **프로필 닉네임**: 자동저장 제거 → 버튼 전용, 실시간 에러 표시, 빈칸/미변경 시 비활성
5. **인증 코드 재발송**: 쿨다운 중 "코드가 오지 않았나요? N초 후 재발송할 수 있어요" + 종료 시 accent tint 버튼
6. **프로필 탭 이름**: "난이도" → "예문 난이도", "난이도 테스트 다시 받기" → "예문 난이도 테스트 받기"
7. **하단 safe area**: ProfileLevelTestScreen, ProfileLevelResultScreen, ProfilePurposeScreen, ProfileCompleteScreen에 `useSafeAreaInsets` 적용
8. **text.disabled 색상**: `#444444` → `#666666` 가독성 개선

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/navigation/MainTabNavigator.tsx` | 수정 | 재테스트 화면 RetestLevel/RetestResult로 개명 |
| `app/src/screens/ProfileLevelTestScreen.tsx` | 수정 | 결과 화면 navigate 동적 분기, safe area 적용 |
| `app/src/screens/ProfileLevelResultScreen.tsx` | 수정 | reset 제거, popToTop, safe area 적용 |
| `app/src/screens/ProfileScreen.tsx` | 수정 | useFocusEffect 자동저장, 닉네임 버튼 전용, 목적 0개 허용, 탭 이름 변경 |
| `app/src/screens/ProfileCompleteScreen.tsx` | 수정 | 뒤로가기 차단, 서버 실패 시 store 업데이트, safe area |
| `app/src/screens/ProfileLevelIntroScreen.tsx` | 수정 | 수평 슬라이드 카드 넘기기 형식 |
| `app/src/screens/ProfilePurposeScreen.tsx` | 수정 | 1개 선택 해제 허용, safe area |
| `app/src/screens/LoginScreen.tsx` | 수정 | 회원가입 버튼 전체 너비 tint |
| `app/src/screens/VerifyEmailScreen.tsx` | 수정 | 재발송 안내 문구 + 버튼 디자인 |
| `app/src/constants/colors.ts` | 수정 | text.disabled #444444 → #666666 |
| `CLAUDE.md` | 수정 | Sprint 04 도메인 지식 업데이트 |

---

## 다음 작업에서 고려할 것

- Sprint 05에서 단어 세트 생성 + 학습 로드맵 본격 구현 시 `Word`/`WordSet` 모델에 변경사항이 예상됨 (뜻, 예문, 학습 상태 등 필드 추가)
- 비밀번호 변경 기능은 아직 placeholder
- 프로필 설정 안내 화면 슬라이드 내용은 추후 카피라이팅 개선 가능
