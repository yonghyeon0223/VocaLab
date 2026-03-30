# Sprint 03 — 최종 디자인 리포트

**날짜**: 2026-03-30 12:00
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 무엇을 했는가

프로필 설정 플로우(6개 화면) 전체의 디자인·카피·UX 행동을 구현 후 반복 개선했다. 로그인 화면의 회원가입 접근성도 개선했다. 글로벌 최소 폰트 사이즈 14px 규칙을 확립하고 전체 화면에 적용했다.

---

## 화면별 최종 상태

### 화면 1 — 닉네임 (`ProfileNicknameScreen`)

**카피**
- 타이틀: "반가워요! 뭐라고 부를까요?"
- placeholder: "예: 민준"
- 카운터: `{trimmed.length} / 10`

**디자인**
- TextInput label: 14px
- 카운터: 14px (12→14)
- 다음 버튼 (유효하지 않으면 비활성)

---

### 화면 2 — 난이도 안내 (`ProfileLevelIntroScreen`)

**카피**
- 타이틀: "내 수준에 맞는 예문을 알아볼게요"
- 부제: "VocaLab은 예문을 읽고 듣고 말하고 쓰면서 단어를 완전히 체화하도록 설계됐어요."

**디자인**
- 카드 3개: 처음 만날 때(#4caf7d), 실전 적용(#6c63ff), 심화(#e8a838)
  - 보더 없이 배경 tint(`color + '18'`) + 라벨 컬러
- subtitle: 17px, cardDescription: 15px
- "문장 보러 가기" 버튼: footer에서 카드 바로 아래 인라인으로 이동
- Safe area insets 적용 (하단 패딩)

---

### 화면 3 — 문장 평가 (`ProfileLevelTestScreen`)

**카피**
- 레벨 번호: "lv.{N}" (15px, accent)
- 레벨 레이블: "{수준 이름}" (20px)
- 번역: 기본 숨김, "뜻 보기" 탭으로 토글
- "다른 예문 보기" 텍스트 (accent, 14px) — reload 아이콘에서 변경

**디자인**
- 진행 바: 현재 레벨 height 8px, 나머지 4px (포인트 컬러 미사용)
- 영어 문장: 전체 너비 (reload 아이콘 분리)
- 뜻 보기 / 다른 예문 보기: divider 아래 같은 row
- 평가 버튼: tint 배경(`color + '22'`), 보더 없음, 선택 시 채움
- 이전 버튼: 외계어예요 아래 배치, chevron-back + "이전"
- 자동 이동: 평가 선택 시 250ms 후 다음 레벨

**UX 행동**
- "외계어예요" 선택 → 현재~lv.10 전부 alien 자동 처리 → DB 저장 → 결과 화면 이동
- lv.10 평가 완료 → DB 저장 → 결과 화면 자동 이동
- 이전 버튼 → 이동할 레벨 포함 이후 전체 평가 초기화
- 평가 선택 시 이후 레벨 평가 무조건 초기화 (조건부 아님)
- 역전 방지: 이전 레벨보다 쉬운 평가 버튼 비활성

---

### 화면 4 — 결과 확인 (`ProfileLevelResultScreen`)

**카피**
- 타이틀: "학습 구간이 설정됐어요"

**디자인**
- 바 차트: lv.1~10 실제 평가 색상 그대로 표시 (제한 규칙 제거)
- chartLabel: 14px (12→14)
- 결과 카드: 처음 만날 때(#4caf7d), 실전 적용(#6c63ff), 심화(#e8a838)
- resultCardLabel: 14px, resultCardLevelSub: 16px, fallbackText: 15px
- DB 저장 로직 제거 (화면 3에서 저장 완료됨)
- "다음" 버튼은 ProfilePurpose로 이동만

---

### 화면 5 — 학습 목적 (`ProfilePurposeScreen`)

**카피**
- 타이틀: "어떤 영어를 배우고 싶어요?"
- 부제: "선택한 목적에 맞는 예문이 더 자주 출제돼요." (기존 subtitle+hint 통합)
  - "최대 5개까지 고를 수 있어요." 삭제

**디자인**
- subtitle: 17px
- groupLabel: 14px (12→14)
- chipText: 14px (13→14)
- counterText: 14px (13→14)
- error: 14px (13→14)

---

### 화면 6 — 완료 (`ProfileCompleteScreen`)

**카피**
- 타이틀: "{닉네임}님, 프로필 설정을 완료했어요"
  - 기존 "다 됐어요, {닉네임}님!" 에서 변경
- 안내 문구 삭제 ("프로필에서 난이도를 직접 조정하거나...")
- "나중에 할게요" 버튼 제거

**디자인**
- sectionLabel: 14px (11→14)
- levelCardLabel: 14px (11→14)
- purposeChipText: 14px (12→14)
- error: 15px (13→15)
- 레벨 카드 구간별 컬러: 처음 만날 때(#4caf7d), 실전 적용(#6c63ff), 심화(#e8a838)
- 버튼: "첫 단어 세트 만들기" 단일

---

### 로그인 화면 (`LoginScreen`)

**카피**
- "아직 계정이 없으신가요?" + [회원가입] outlined 버튼
  - 기존 한 줄 텍스트 링크에서 분리

**디자인**
- subtitle: 14px (13→14)
- error: 14px (13→14)
- 회원가입: accent outline 버튼 (borderWidth 1.5, borderRadius 10)
- signupButtonText: 15px, fontWeight 600

---

### TextInput 컴포넌트

- label: 14px (12→14)
- error: 14px (11→14)

---

## 글로벌 디자인 규칙

| 규칙 | 내용 |
|------|------|
| 최소 폰트 사이즈 | **14px** (semi-permanent rule, 전 화면 적용) |
| 포인트 컬러 | `#6c63ff` (accent) |
| 구간 컬러 | 처음 만날 때 `#4caf7d`, 실전 적용 `#6c63ff`, 심화 `#e8a838`, 외계어 `#e05252` |
| 카드 스타일 | 보더 없이 배경 tint(`color + hex opacity`) |
| 버튼 스타일 | 평가 버튼은 tint 배경, 선택 시 채움. 보더 사용 안 함 |

---

## Store/로직 변경사항

| 변경 | 설명 |
|------|------|
| `levelTestStore.setRating` | 이후 레벨 평가 무조건 초기화 (기존: 역전 시에만) |
| `levelTestStore.setAlienFrom` | 신규 — alien 일괄 처리 |
| `levelTestStore.clearRatingsFrom` | 신규 — 이전 버튼용 초기화 |
| 로그아웃 시 store 초기화 | `authService.logout` 및 `api.ts` 토큰 갱신 실패 시 `levelTestStore.reset()` 추가 |
| DB 저장 시점 변경 | 결과 화면 → 테스트 화면(lv.10 또는 alien 선택 시)으로 이동 |

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/src/components/ui/TextInput.tsx` | 수정 | label/error 폰트 14px |
| `app/src/screens/LoginScreen.tsx` | 수정 | 회원가입 outlined 버튼, 폰트 14px |
| `app/src/screens/ProfileNicknameScreen.tsx` | 수정 | counter 14px |
| `app/src/screens/ProfileLevelIntroScreen.tsx` | 수정 | 카피 변경, 카드 tint, 버튼 인라인, safe area |
| `app/src/screens/ProfileLevelTestScreen.tsx` | 수정 | 진행 바 높이, 번역 숨김, reload→텍스트, 이전 위치, alien 자동완성 |
| `app/src/screens/ProfileLevelResultScreen.tsx` | 수정 | 바 차트 제한 제거, 저장 로직 제거, 폰트 증가 |
| `app/src/screens/ProfilePurposeScreen.tsx` | 수정 | subtitle 통합, 폰트 14px |
| `app/src/screens/ProfileCompleteScreen.tsx` | 수정 | 카피 변경, 버튼 단일화, 구간 컬러, 폰트 14px |
| `app/src/stores/levelTestStore.ts` | 수정 | setAlienFrom, clearRatingsFrom 추가, setRating 무조건 초기화 |
| `app/src/services/authService.ts` | 수정 | logout 시 levelTestStore.reset() |
| `app/src/services/api.ts` | 수정 | 토큰 갱신 실패 시 levelTestStore.reset() |
