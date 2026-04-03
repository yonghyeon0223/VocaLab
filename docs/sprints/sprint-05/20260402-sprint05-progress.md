# Sprint 05 — 진행 리포트

**날짜**: 2026-04-03
**스프린트**: Sprint 05
**상태**: ⚠️ 진행 중

---

## 한줄 요약

AI로 영어 텍스트/사진에서 핵심 단어를 추출하고, 뜻과 품사를 붙여 단어 세트를 만드는 기능을 구현했다. 4번의 아키텍처 변경을 거쳐 현재 구조에 도달했다.

---

## 아키텍처 변경 과정 (시행착오 포함)

### v1 — 카테고리 분류 (최초 구현)
```
AI #1: 단어 추출 + easy/appropriate/hard 3개 카테고리 분류
AI #2: 선택된 단어의 한국어 뜻 추출
```
**무엇이 문제였나**: 카테고리 경계를 계산하는 로직이 복잡해서 edge case가 계속 나왔다. 유저의 레벨이 전부 lv.1이면 심화 카테고리가 사라지는 등 예측 불가능한 동작이 발생했다.

### v2 — 카테고리 제거 + 프롬프트 통합
```
AI 1회: 단어 추출 + 뜻 + 품사를 한 번에
```
**무엇이 문제였나**: AI에게 "단어를 골라내면서 동시에 뜻도 만들어줘"라고 시키니 둘 다 중간 품질이 나왔다. 특히 다의어 분리가 안 됐다 — "감각"과 "의미"를 하나로 합치거나, 품사가 다른 뜻(doubt: 의심하다/의심)을 빼먹었다.

### v3 — Free Dictionary API 도입
```
AI #1: 단어 추출 (spelling만)
Free Dictionary API: 영영 뜻 조회
AI #2: 영영 뜻 → 한국어 번역
```
**무엇이 문제였나**: Free Dictionary API의 rate limit에 걸려서 130개 단어 중 24개만 사전에서 찾았다. 딜레이를 넣어도 근본적으로 해결이 안 됐고, 3단계 파이프라인이라 속도도 느렸다.

### v4 — 현재 구조 (AI 단일 호출 + 유저 단어 수 지정)
```
유저가 원하는 단어 수(N) 입력 → AI 1회 호출로 N개 단어 + 뜻 + 품사 추출
```
**왜 이게 맞나**: 유저가 단어 수를 직접 정하니 AI가 "몇 개를 뽑을지" 고민할 필요가 없다. Free Dictionary를 거치지 않으니 속도가 빠르다. 다의어 품질은 프롬프트 튜닝으로 계속 개선 중이다.

---

## 프롬프트 튜닝 과정에서 배운 것

1. **AI에게 여러 역할을 동시에 시키면 다 못한다** — 추출 + 분류 + 뜻 생성을 한 번에 시키면 각각의 품질이 떨어진다
2. **카테고리 규칙이 복잡하면 AI가 핵심에 집중 못한다** — easy/appropriate/hard 경계를 정교하게 지시할수록 정작 단어 추출 품질이 떨어졌다
3. **"쉼표로 결합" 규칙이 모호하면 다의어가 합쳐진다** — "감각, 의미"처럼 AI가 하나로 합쳐버리는 문제. 결국 "쉼표 결합 금지"로 해결
4. **프롬프트는 영어로 쓰는 게 낫다** — 한국어 프롬프트보다 영어 프롬프트의 응답 품질이 더 높았다
5. **정확한 단어 수 지정이 중요하다** — "up to N개"라고 해도 AI는 초과할 수 있다. "exactly N, never exceed"도 완벽하지 않아서 클라이언트에서 100개 이상은 잘라내는 방어 로직을 추가했다
6. **유저의 학습 목적(purposes)을 프롬프트에 넣으면 단어 선택 품질이 올라간다** — "TOEIC 준비 중인 학생"에게는 비즈니스 단어를 더 많이 뽑아준다

---

## 현재 화면 플로우

### AI 기반 (영어 지문 / 사진 촬영)
```
입력 방식 선택 → 텍스트 입력 or 사진 촬영 → 단어 수 입력 → AI 추출 → 단어+뜻 선택 → 세트 이름 → 저장
```

### 수동 입력
```
입력 방식 선택 → 단어/뜻/품사 직접 입력 → 세트 이름 → 저장
```

---

## DB 구조 (최종)

### words 컬렉션 → 삭제
wordSets 문서에 words 배열로 내장(embed).

### 타입
```typescript
type WordMeaning = {
  definition: string;     // 영영 풀이
  meaning: string;        // 한국어 뜻
  partOfSpeech: string;   // 품사
};

type Word = {
  spelling: string;
  meanings: WordMeaning[];
};

type WordSet = {
  _id: string;
  userId: string;
  name: string;
  source: 'manual' | 'photo';
  words: Word[];          // 최대 100개
  createdAt: Date;
  updatedAt: Date;
};
```

---

## 3가지 입력 방식

| 방식 | 설명 | AI 사용 |
|------|------|---------|
| 영어 지문 입력 | 교과서 지문, 단어 리스트, 가사 등 텍스트 (최대 5,000자) | O |
| 사진 촬영 | 교재, 단어장, 시험지 촬영 (최대 5장, 다중 선택 가능) | O |
| 단어 직접 입력 | 단어/뜻/품사를 하나씩 수동 입력 (최대 100개) | X |

---

## 현재 프롬프트 (영어)

- 유저 레벨(activeLevel) + 학습 목적(purposes) 주입
- 7가지 입력 유형 자동 판단
- 숙어/표현 통째로 추출
- 정확히 N개 단어 추출 (초과 시 클라이언트에서 100개로 자름)
- 각 단어에 2~3개 한국어 뜻 + 영영 풀이 + 품사
- 한국어 뜻은 영영 풀이의 뉘앙스를 최대한 반영

---

## 디자인/UX 결정

| 결정 | 이유 |
|------|------|
| 카테고리 분류 제거 | edge case 많고 AI 품질 저하 |
| 단어 수 유저 입력 | AI에게 맡기면 너무 많이/적게 뽑음 |
| 사진 세로 스크롤 | 가로 슬라이더보다 직관적 |
| 품사 줄임말 칩 (명사/동사/형용사/부사/숙어/그 외) | 드롭다운은 번거롭고, 풀네임 칩은 넘침 |
| 단어 선택: 카드 탭 + accent 바 | 체크박스가 너무 작아서 터치 불편 |
| Free Dictionary API 제거 | rate limit + 커버리지 부족 |

---

## 변경된 파일 (전체)

### 신규
| 파일 | 설명 |
|------|------|
| `app/src/screens/WordSetInputMethodScreen.tsx` | 3가지 입력 방식 선택 |
| `app/src/screens/WordSetTextInputScreen.tsx` | 영어 지문 입력 |
| `app/src/screens/WordSetPhotoInputScreen.tsx` | 사진 촬영/갤러리 |
| `app/src/screens/WordSetWordCountScreen.tsx` | 추출할 단어 수 입력 |
| `app/src/screens/WordSetManualEntryScreen.tsx` | 단어/뜻/품사 수동 입력 |
| `app/src/screens/WordSelectionScreen.tsx` | 단어+뜻 선택 |
| `app/src/constants/pos.ts` | 품사 한국어 레이블 + 줄임말 |
| `server/src/services/aiService.ts` | Claude API 호출 (4차 재작성) |
| `server/src/services/levelLabels.ts` | 서버용 레벨 레이블 |

### 삭제
| 파일 | 이유 |
|------|------|
| `server/src/repositories/wordRepository.ts` | words 컬렉션 제거 |
| `server/src/services/dictionaryService.ts` | Free Dictionary API 제거 |
| `app/src/screens/WordSetWordsScreen.tsx` | 새 플로우로 대체 |
| `app/src/screens/MeaningSelectionScreen.tsx` | WordSelectionScreen에 통합 |

### 수정
| 파일 | 설명 |
|------|------|
| `shared/types.ts` | Word → { spelling, meanings: WordMeaning[] } |
| `server/src/services/wordSetService.ts` | AI 단일 호출 파이프라인 |
| `server/src/controllers/wordSetController.ts` | extract 엔드포인트 |
| `server/src/routes/wordSets.ts` | extract 라우트 |
| `server/src/validators/wordSetValidator.ts` | wordCount 필드, 100개 제한 |
| `server/src/repositories/wordSetRepository.ts` | embed 구조 |
| `server/src/index.ts` | words 인덱스 제거, body limit 50MB |
| `server/src/utils/env.ts` | ANTHROPIC_API_KEY |
| `app/src/services/wordSetService.ts` | extractWords API |
| `app/src/navigation/MainTabNavigator.tsx` | 새 화면 등록 |
| `app/src/screens/HomeScreen.tsx` | 세트 카드, navigate 변경 |
| `app/src/screens/WordSetNameScreen.tsx` | 파라미터 구조 변경 |

---

## 다음에 할 것

- 단어 선택 화면 UI 개선 (현재 커밋 대기 중)
- 프롬프트 튜닝 지속 (실제 사용 피드백 기반)
- CLAUDE.md Sprint 05 도메인 지식 업데이트
- 홈 화면 단어 세트 카드 디자인 (단어 수 표시 등)
- 학습 기능 구현 (Sprint 06~)
