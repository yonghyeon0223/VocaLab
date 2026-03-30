# Sprint 03 — 최종 디자인 & 텍스트 변경 리포트

**날짜**: 2026-03-30
**스프린트**: Sprint 03
**상태**: ✅ 완료

---

## 개요

Sprint 03 구현 과정에서 초기 명세 대비 확정된 디자인·텍스트·UX 변경사항을 정리한다.
이 문서는 최종 구현 상태의 기준 문서다.

---

## 화면별 최종 상태

### 화면 1 — 닉네임 설정 (`ProfileNicknameScreen`)

**최종 카피**
- 타이틀: "반가워요!\n뭐라고 부를까요?"
- 입력 label: "닉네임" (fontSize 14)
- placeholder: "예: 민준"
- 카운터: `{n} / 10` (fontSize 14, 오른쪽 정렬)

**디자인 변경**
- `counter` fontSize: 12 → 14 (글로벌 최소 폰트 규칙 적용)

---

### 화면 2 — 난이도 안내 (`ProfileLevelIntroScreen`)

**최종 카피**
- 타이틀: "내 수준에 맞는\n예문을 알아볼게요"
- 부제목: "VocaLab은 예문을 읽고 듣고 말하고 쓰면서\n단어를 완전히 체화하도록 설계됐어요."
- 카드 1 — label: "처음 만날 때" / description: "먼저 쉬운 문장으로 단어와 자연스럽게 친해져요"
- 카드 2 — label: "실전 적용" / description: "내 수준의 문장에서 단어를 실제로 써볼 수 있게 만들어요"
- 카드 3 — label: "심화" / description: "한 단계 위의 문장에 도전하면서 단어와 함께 영어 실력도 올려요"
- CTA 버튼: "문장 보러 가기"

**디자인 변경**
- `subtitle` fontSize: 15 → 17 (부연 설명 +2pt)
- `cardDescription` fontSize: 13 → 15 (부연 설명 +2pt)
- 카드 스타일: border 없음, 배경 `card.color + '18'` (tint only)
- 카드 label 포인트 컬러: 처음 만날 때 #4caf7d / 실전 적용 #6c63ff / 심화 #e8a838
- "문장 보러 가기" 버튼: footer 고정 → ScrollView 내 카드 바로 아래 인라인 배치
- `useSafeAreaInsets`로 하단 safe area 보장

---

### 화면 3 — 문장 평가 (`ProfileLevelTestScreen`)

**최종 UI 구조**
```
[이전 버튼 (chevron + 텍스트)]
[lv.N]                          ← fontSize 15, accent 컬러
[수준 레이블]                    ← fontSize 20, bold
[progress bar 10칸]              ← 현재 레벨만 height 8, 나머지 height 4, alignItems: 'flex-end'
─────────────────────────────────
[영어 문장 (full width)]
[divider]
[뜻 보기 / 번역 텍스트] [다른 예문 보기]  ← 같은 row
─────────────────────────────────
[바로 이해돼요]    (초록 #4caf7d)
[조금 생각하면 돼요] (보라 #6c63ff)
[뜻 파악이 힘들어요] (주황 #e8a838)
[외계어예요]       (빨강 #e05252)
─────────────────────────────────
[이전 버튼]
```

**디자인 변경**
- progress bar: 포인트 컬러 현재 레벨 표시 제거 → 현재 레벨만 height 8 (높이 차이로 강조)
- reload 아이콘: 영어 문장 옆 → 번역 row 오른쪽 끝 "다른 예문 보기" 텍스트로 교체 (accent 컬러)
- 번역: 기본 숨김, "뜻 보기" 탭 → 노출, 다시 탭 → 숨김
- 이전/다음 버튼: 동일 스타일 → 이전 버튼만 유지
- 이전 버튼 위치: 하단 nav → 헤더 lv 번호 바로 위 + 외계어예요 버튼 아래 (ScrollView 내)
- `lv.N` fontSize: 12 → 15
- 버튼 스타일: border 없음, 선택 → solid fill, 미선택 → color+'22' tint
- `useSafeAreaInsets`로 하단 safe area 보장

**UX 변경**
- 평가 선택 시 250ms 후 자동으로 다음 레벨 이동
- "외계어예요" 선택 시 현재 레벨~lv.10 전부 alien 처리 → DB 저장 → 결과 화면 이동
- lv.10 평가 완료 시 DB 저장 → 결과 화면 자동 이동 (별도 버튼 없음)
- 이전으로 돌아갈 때: `clearRatingsFrom(currentLevel - 1)` → 이동할 레벨 포함 이후 전부 초기화
- 어떤 레벨에서 선택해도 그 이후 레벨의 평가가 전부 초기화 (store `setRating` 로직)

---

### 화면 4 — 결과 확인 (`ProfileLevelResultScreen`)

**최종 UI 구조**
```
[학습 구간이\n설정됐어요]   ← fontSize 28
[바 차트 lv.1~10]           ← 실제 평가 색상 그대로 (제한 규칙 없음)
[폴백 안내 박스]             ← 폴백 발생 시에만 표시
[결과 카드 3개]
[다음 버튼]                  ← ProfilePurpose로만 이동 (저장 없음)
```

**디자인 변경 (초기 명세 대비)**
- 바 차트: easy 최대 2개 / alien 최대 1개 표시 규칙 제거 → 실제 평가 색상 그대로 표시
- `fallbackText` fontSize: 13 → 15
- `resultCardLabel` fontSize: 12 → 14
- `resultCardLevelSub` fontSize: 14 → 16
- `chartLabel` fontSize: 12 → 14

**로직 변경**
- DB 저장: 결과 화면 "다음" 버튼 → 화면 3 lv.10/alien 평가 시점으로 이동
- 결과 화면 "다음"은 단순 navigate만 수행

---

### 화면 5 — 학습 목적 (`ProfilePurposeScreen`)

**최종 카피**
- 타이틀: "어떤 영어를\n배우고 싶어요?"
- 부제목(subtitle 위치): "선택한 목적에 맞는 예문이 더 자주 출제돼요." ← 원래 hint 위치에서 승격
- 제거된 텍스트: "최대 5개까지 고를 수 있어요." (subtitle에서 삭제)

**디자인 변경**
- `subtitle` fontSize: 15 → 17
- `groupLabel` fontSize: 12 → 14
- `chipText` fontSize: 13 → 14
- `counterText` fontSize: 13 → 14
- `error` fontSize: 13 → 14
- `hint` fontSize: 12 → 14 → 부제목 위치로 이동 후 `subtitle` 스타일 적용

---

### 화면 6 — 프로필 완료 (`ProfileCompleteScreen`)

**최종 카피**
- 타이틀: "{nickname}님,\n프로필 설정을 완료했어요"
- 제거된 텍스트: "프로필에서 난이도를 직접 조정하거나 테스트를 다시 받을 수 있어요." (기능은 유지, 문구만 삭제)
- CTA 버튼: "첫 단어 세트 만들기" (단일 버튼)
- 제거된 버튼: "나중에 할게요"

**디자인 변경**
- `sectionLabel` fontSize: 11 → 14 (글로벌 최소 폰트 + 부연설명 규칙)
- `levelCardLabel` fontSize: 11 → 14
- `purposeChipText` fontSize: 12 → 14
- `error` fontSize: 13 → 15
- 레벨 카드 컬러: 모두 accent → 구간별 구분
  - 처음 만날 때: #4caf7d (초록)
  - 실전 적용: #6c63ff (보라)
  - 심화: #e8a838 (주황)

---

## 로그인 화면 (`LoginScreen`)

**디자인 변경**
- 회원가입 링크 강화: 단순 텍스트 링크 → 분리된 2단 구조
  - "아직 계정이 없으신가요?" (fontSize 14, secondary)
  - `[회원가입]` outlined 버튼 (fontSize 15, bold, accent border)
- `subtitle` fontSize: 13 → 14
- `error` fontSize: 13 → 14

---

## 공통 컴포넌트 (`TextInput`)

**디자인 변경**
- `label` fontSize: 12 → 14
- `error` fontSize: 11 → 14

---

## 글로벌 디자인 룰 (Sprint 03에서 확립)

| 규칙 | 값 | 비고 |
|------|----|------|
| 최소 폰트 사이즈 | **14px** | 모든 텍스트에 적용, semi-permanent rule |
| 부연 설명 폰트 | **subtitle: 17px, cardDescription: 15px** | 제목 아래 설명 텍스트 기준 |
| 포인트 컬러 사용 금지 구역 | progress bar 현재 위치 | 높이 차이로 대체 |
| 버튼 스타일 | border 없음, tint/fill | 선택: solid fill, 미선택: color+'22' |
| 구간 색상 | 처음 만날 때 #4caf7d / 실전 적용 #6c63ff / 심화 #e8a838 | 차트·카드·인트로 화면 일관 |

---

## 스토어 & 로직 변경

| 변경 | 내용 |
|------|------|
| `levelTestStore.setRating` | 역전 조건부 삭제 → 선택 시 이후 레벨 전부 무조건 초기화 |
| `levelTestStore.clearRatingsFrom` | 이전 버튼 시 `currentLevel-1`부터 초기화 (이동할 레벨 포함) |
| `levelTestStore.setAlienFrom` | alien 선택 시 일괄 처리용 bulk setter 추가 |
| `authService.logout` | `levelTestStore.reset()` 추가 (세션 간 상태 오염 방지) |
| `api.ts` (토큰 재발급 실패) | `levelTestStore.reset()` 추가 |
| DB 저장 시점 | ProfileLevelResultScreen → ProfileLevelTestScreen (lv.10/alien 선택 시점) |
