# Sprint 06 — 단어 세트 상세 페이지 + 학습 로드맵 UI

**기간**: Sprint 06
**목표**: 단어 세트 상세 페이지를 구현하고, 8단계 학습 로드맵의 UI 틀을 잡는다. 1단계 "단어 소개"는 단어 목록 + 필터 기능까지 구현하고, 나머지 단계는 placeholder로 남긴다.

---

## 요약

Sprint 05에서 AI 기반 단어 세트 생성이 완성되었다. Sprint 06에서는 생성된 세트의 상세 페이지를 만든다. 8단계 학습 로드맵을 카드 리스트로 보여주고, 1단계 "단어 소개"에서는 단어 목록을 필터와 함께 볼 수 있다. 세점 메뉴로 세트 이름 수정/삭제/공유(placeholder)를 제공하며, 목록 화면과 상세 화면 양쪽에서 동일한 세점 메뉴를 사용한다.

---

## 화면 구성

### 단어 세트 상세 페이지 (WordSetDetailScreen)

**진입 경로**
- 학습 탭 → 세트 카드 탭 → 상세 페이지
- 홈 → "최근 학습 이어하기" → 상세 페이지

**UI**
```
┌─────────────────────────────────────┐
│  세트 이름                    ⋮     │
│                                     │
│  전체 진행률 ████░░░░░░░░ 12%       │
│                                     │
│  1. 단어 소개          0/35         │
│  2. 뜻 익히기          🔒           │
│  3. 써보기             🔒           │
│  4. 단어 가족 만나기    🔒           │
│  5. 맥락 읽기          🔒           │
│  6. 말문 트기          🔒           │
│  7. 문장 만들기        🔒           │
│  8. 심화 훈련          🔒           │
└─────────────────────────────────────┘
```

**룰**
- 1단계만 활성, 2~8단계는 잠금 상태
- 잠금된 단계를 탭해도 반응 없음 (이전 단계 완료 시 잠금 해제 — 추후 구현)
- 1단계 탭 → 단어 소개 상세 페이지로 이동
- 전체 진행률: 8단계 중 완료된 단계 비율 (이번 스프린트에서는 항상 0%)
- 상단 ⋮ 메뉴: 이름 수정 / 삭제 / 공유(placeholder)

---

### 학습 8단계

| 단계 | 이름 | 설명 | 이번 스프린트 |
|------|------|------|------------|
| 1 | 단어 소개 | 단어와 뜻을 처음 만나는 단계 | **구현** (단어 목록 + 필터) |
| 2 | 뜻 익히기 | 뜻을 보고 단어를 맞추는 연습 | placeholder |
| 3 | 써보기 | 단어를 직접 타이핑하는 연습 | placeholder |
| 4 | 단어 가족 만나기 | 파생어, 동의어, 반의어 학습 | placeholder |
| 5 | 맥락 읽기 | 예문 속에서 단어의 쓰임 이해 | placeholder |
| 6 | 말문 트기 | 발음과 말하기 연습 | placeholder |
| 7 | 문장 만들기 | 단어를 활용해 문장 작성 | placeholder |
| 8 | 심화 훈련 | 종합 복습 + 응용 문제 | placeholder |

---

### 1단계 — 단어 소개 상세 (WordIntroScreen)

**UI**
```
┌─────────────────────────────────────┐
│  단어 소개                          │
│  35개 단어                          │
│                                     │
│  필터: [단어✓] [한국어 뜻✓] [영문 뜻] [품사] │
│                                     │
│  1  elaborate                       │
│     정교한                          │
│                                     │
│  2  perceive                        │
│     인식하다                         │
│                                     │
│  3  break down                      │
│     분해하다                         │
│  ...                                │
└─────────────────────────────────────┘
```

**룰**
- 상단 필터 토글: 단어(항상 켜짐, 해제 불가), 한국어 뜻, 영문 뜻, 품사
- 기본값: 단어 + 한국어 뜻만 켜짐
- 선택한 필터에 따라 각 단어 카드에 표시되는 항목이 변경됨
- 읽기 전용 — 단어 수정/삭제 불가
- 탭 인터랙션 없음 (추후 추가 예정)

---

### 세점 메뉴 (⋮)

**사용 위치**
1. 학습 탭 (LearningScreen) — 각 세트 카드 우측
2. 단어 세트 상세 페이지 — 상단 우측

**메뉴 항목**
| 항목 | 동작 |
|------|------|
| 이름 수정 | WordSetNameScreen으로 이동 (편집 모드, 기존 이름 프리필) |
| 삭제 | 확인 다이얼로그 → 삭제 → 이전 화면 복귀 |
| 공유 | "준비 중이에요" 토스트 (placeholder) |

---

### 이름 수정 화면

기존 `WordSetNameScreen`을 재사용한다.
- 편집 모드: 기존 세트 이름이 프리필됨
- 저장 시 `PATCH /api/word-sets/:id` 호출
- 저장 후 `goBack()`으로 이전 화면 복귀

---

## API 엔드포인트

### PATCH /api/word-sets/:id (신규)
```
미들웨어: authenticate
요청: { name: string }
처리:
  1. 세트 소유권 확인
  2. name 검증 (1~30자, trim)
  3. name 업데이트
성공: 200 { success: true, data: { wordSet } }
실패: 404 세트 없음 또는 권한 없음
```

### 기존 유지
- GET `/api/word-sets` — 목록 (wordCount aggregation)
- GET `/api/word-sets/:id` — 상세 (words 포함)
- DELETE `/api/word-sets/:id` — 삭제

---

## 코드 변경 목록

### 신규
| 파일 | 설명 |
|------|------|
| `app/src/screens/WordSetDetailScreen.tsx` | 세트 상세 (8단계 로드맵) |
| `app/src/screens/WordIntroScreen.tsx` | 1단계 단어 소개 (필터 + 단어 목록) |
| `app/src/components/ui/DotMenu.tsx` | 세점 메뉴 공통 컴포넌트 |

### 수정
| 파일 | 설명 |
|------|------|
| `server/src/routes/wordSets.ts` | PATCH /:id 라우트 추가 |
| `server/src/controllers/wordSetController.ts` | updateWordSet 핸들러 추가 |
| `server/src/services/wordSetService.ts` | updateWordSet 함수 추가 |
| `server/src/repositories/wordSetRepository.ts` | updateName 함수 추가 |
| `server/src/validators/wordSetValidator.ts` | updateWordSetSchema 추가 |
| `app/src/navigation/MainTabNavigator.tsx` | 새 화면 등록 |
| `app/src/screens/LearningScreen.tsx` | 쓰레기통 → 세점 메뉴, 카드 탭 → 상세 이동 |
| `app/src/screens/HomeScreen.tsx` | "최근 학습 이어하기" → 상세 이동 |
| `app/src/screens/WordSetNameScreen.tsx` | 편집 모드 지원 (기존 이름 프리필 + PATCH 호출) |
| `app/src/stores/wordSetStore.ts` | updateWordSet 액션 추가 |
| `app/src/services/wordSetService.ts` | updateWordSet API 추가 |

---

## 완료 조건 (Definition of Done)

- 학습 탭에서 세트 카드 탭 → 상세 페이지 진입 확인
- 홈 "최근 학습 이어하기" → 상세 페이지 진입 확인
- 상세 페이지: 세트 이름, 전체 진행률(0%), 8단계 카드 표시 확인
- 1단계 "단어 소개" 탭 → 단어 목록 표시 확인
- 필터 토글 (단어/한국어 뜻/영문 뜻/품사) 동작 확인
- 필터 기본값: 단어 + 한국어 뜻 확인
- 단어 필터 해제 불가 확인
- 2~8단계 잠금 상태, 탭 시 반응 없음 확인
- 세점 메뉴: 상세 페이지 + 목록 양쪽에서 표시 확인
- 이름 수정: 기존 이름 프리필 → 수정 → 서버 저장 → 화면 반영 확인
- 삭제: 확인 다이얼로그 → 삭제 → 목록/홈 반영 확인
- 공유: "준비 중이에요" 토스트 확인
- PATCH /api/word-sets/:id 정상 동작 확인
- TypeScript 에러 없음

---

## 이번 스프린트에서 하지 않는 것

- 학습 기능 (문제 풀기, 진행률 기록, 오답 노트 등)
- 2~8단계 상세 내용 (placeholder만)
- 단어 수정/삭제 (세트 내 개별 단어)
- 세트 내 단어 추가
- 공유 기능 (UI placeholder만)
- 잠금 해제 로직 (이전 단계 완료 판정)
- Spaced Repetition / 장기기억 연구소
- 홈 대시보드 실데이터 연결

---

## 참고 정보

- **이전 스프린트**: Sprint 05 완료
- **학습 8단계**: 단어 소개 → 뜻 익히기 → 써보기 → 단어 가족 만나기 → 맥락 읽기 → 말문 트기 → 문장 만들기 → 심화 훈련
- **세점 메뉴 패턴**: 목록과 상세에서 동일한 메뉴 항목 제공
- **WordSetNameScreen 재사용**: 생성 모드(새 세트) + 편집 모드(이름 수정) 분기
