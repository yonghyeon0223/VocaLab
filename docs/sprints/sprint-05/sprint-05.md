# Sprint 05 — 단어 세트 생성 고도화 + AI 데이터 파이프라인

**기간**: Sprint 05
**목표**: AI 기반 단어 추출·분류 파이프라인을 구축하고, 사진 촬영 입력 방식과 레벨별 단어 선택 UI를 추가한다.

---

## 요약

Sprint 04에서는 영단어 spelling만 저장하는 단순 구조였다. Sprint 05에서는 AI(Claude API)를 활용하여 텍스트 또는 사진에서 영단어/숙어를 추출하고, 유저의 레벨에 따라 3개 카테고리(쉬움/적절/심화)로 분류한다. 유저는 분류된 단어 중 원하는 것을 선택하여 세트를 생성한다. 선택된 단어에 대해 AI가 한국어 뜻과 품사를 생성한다. 단어 데이터는 유저별 독립 관리하며 wordSets 문서에 내장(embed)한다.

---

## DB 모델 변경

### `words` 컬렉션 → 삭제

기존 별도 컬렉션을 제거하고 `wordSets` 문서에 내장한다.

### `wordSets` 컬렉션 (변경)

```typescript
type Word = {
  spelling: string;           // 영단어 원형 (소문자 정규화)
  meaning: string;            // 한국어 뜻 그룹 (예: "옳은, 정확한")
  partOfSpeech: string;       // 품사 (noun, verb, adj, adv 등)
}

type WordSet = {
  _id: ObjectId;
  userId: ObjectId;
  name: string;               // 1~30자
  source: 'manual' | 'photo'; // 생성 방식
  words: Word[];              // 내장 단어 배열
  createdAt: Date;
  updatedAt: Date;
}
```

인덱스: `{ userId: 1, createdAt: -1 }`

> **문서 크기**: 단어 1,000개 × 다의어 평균 1.5 = 1,500 Word 객체 × ~200 bytes ≈ 300 KB. MongoDB 16 MB 제한에 여유 있음.

### 마이그레이션

기존 `words`, `wordSets` 컬렉션 데이터를 모두 삭제하고 새 구조로 시작한다. (초기 단계이므로 데이터 보존 불필요)

### 단어 식별 규칙

- 같은 spelling이라도 뜻이 다르면 **별도 Word 객체**로 words 배열에 포함
- 같은 맥락에서 쓰이는 한국어 뜻들은 쉼표로 결합하여 하나의 meaning
  ```
  correct → words 배열에 2개 객체:
    { spelling: "correct", meaning: "옳은, 정확한", partOfSpeech: "adj" }
    { spelling: "correct", meaning: "고치다, 바로잡다", partOfSpeech: "verb" }
  ```
- 유저별 독립 — 유저 A와 B가 같은 단어를 배워도 각자의 wordSet 문서에 독립 저장

---

## 단어 세트 생성 플로우

```
[홈 화면 "새 단어 세트 만들기"]
        ↓
[1] 입력 방식 선택 (텍스트 or 사진, 택일)
        ↓
[2] 입력 (텍스트 입력 or 사진 촬영)
        ↓
[3] AI 추출 + 레벨 분류 → 단어 선택
        ↓
[4] 다의어 뜻 선택
        ↓
[5] 세트 이름 입력
        ↓
[6] 저장 → 홈 복귀
```

---

### 화면 1 — 입력 방식 선택 (WordSetInputMethodScreen)

```
┌──────────────┐  ┌──────────────┐
│  직접 입력    │  │  사진 촬영    │
│  (텍스트)     │  │  (카메라)     │
└──────────────┘  └──────────────┘
```

- 둘 중 택일 (혼합 입력 불가)

---

### 화면 2A — 텍스트 입력 (WordSetTextInputScreen)

**UI**
- 타이틀: "텍스트를 입력하세요"
- 부제목: "단어 리스트, 영어 가사, 교과서 지문 등을 붙여넣거나 직접 입력하세요."
- 멀티라인 TextInput (최대 50,000자)
- 글자 수 카운터: "N / 50,000자"
- [단어 추출하기] 버튼

**룰**
- 최소 1자 이상 입력 시 버튼 활성
- 최대 50,000자
- 줄바꿈/쉼표 구분뿐 아니라 문장, 가사 등 자유 형식 텍스트도 허용 (AI가 단어 추출)

---

### 화면 2B — 사진 촬영/선택 (WordSetPhotoInputScreen)

**UI**
- 큰 카드 형식으로 사진 표시 (수평 스와이프로 넘기기)
- 각 카드에 [✕] 삭제 버튼
- 도트 인디케이터 (현재 사진 위치)
- 사진 수 카운터: "N / 10장"
- [촬영] / [갤러리] 버튼
- [단어 추출하기] 버튼

**룰**
- 카메라 권한 요청
- 갤러리에서 기존 사진 선택 가능
- 최소 1장, 최대 10장
- 개별 사진 삭제 가능
- 1장 이상일 때 추출 버튼 활성

---

### 화면 3 — 단어 선택 (WordSelectionScreen)

AI가 추출한 단어를 유저의 레벨에 따라 3개 카테고리로 분류하여 표시한다.

**카테고리 분류 기준**

유저의 `levelRatings`에서 `appropriate`로 평가한 레벨 범위를 기준으로 카테고리를 결정한다. appropriate 평가가 없는 경우(폴백) `activeLevel` 단일 값을 적정 범위로 사용한다.

```typescript
function calculateClassificationRange(
  levelRatings: Record<string, string>,
  activeLevel: number
) {
  const appropriateLevels = Object.entries(levelRatings)
    .filter(([_, rating]) => rating === 'appropriate')
    .map(([level]) => Number(level));

  const minAppropriate = appropriateLevels.length > 0
    ? Math.min(...appropriateLevels)
    : activeLevel;
  const maxAppropriate = appropriateLevels.length > 0
    ? Math.max(...appropriateLevels)
    : activeLevel;

  return { minAppropriate, maxAppropriate };
}
```

| 카테고리 | 레벨 범위 | 조건 | 기본 상태 |
|---------|----------|------|----------|
| 쉬움 | lv.1 ~ minAppropriate-1 | minAppropriate === 1이면 **카테고리 없음** | 전체 해제 |
| 적절 | minAppropriate ~ maxAppropriate | 항상 존재 | **전체 선택** |
| 심화 | maxAppropriate+1 ~ lv.10 | maxAppropriate === 10이면 **카테고리 없음** | **전체 선택** |

**예시**

```
유저가 lv.4, lv.5, lv.6을 appropriate로 평가:
  적절 = lv.4~6 → "중학 1학년 ~ 고등 1학년"
  쉬움 = lv.3 이하 → "초등 5~6학년 이하"
  심화 = lv.7 이상 → "고등 2학년 이상"
  → 3개 카테고리

유저가 lv.1을 appropriate로 평가:
  적절 = lv.1 → "초등 1~2학년"
  쉬움 = (카테고리 없음)
  심화 = lv.2 이상 → "초등 3~4학년 이상"
  → 2개 카테고리

유저가 lv.10을 appropriate로 평가:
  적절 = lv.10 → "학술 논문"
  쉬움 = lv.9 이하 → "수능 고난도 이하"
  심화 = (카테고리 없음)
  → 2개 카테고리

유저가 lv.1~10 전부 appropriate로 평가:
  적절 = lv.1~10
  쉬움 = (카테고리 없음)
  심화 = (카테고리 없음)
  → 1개 카테고리
```

AI에게 레벨 번호가 아닌 **교육 수준 설명**으로 분류를 요청한다. 서버에서 유저 레벨 범위를 교육 수준 레이블로 변환하여 프롬프트에 전달한다.

**프롬프트 예시** (lv.4~6이 appropriate인 유저)

```
다음 텍스트에서 영단어와 숙어/구를 추출하고,
각 단어를 가장 적합한 카테고리에 분류해줘.
관사, 전치사 등 기능어는 제외.

난이도 기준 (쉬운 순서):
  lv.1  초등 1~2학년
  lv.2  초등 3~4학년
  lv.3  초등 5~6학년
  lv.4  중학 1학년
  lv.5  중학 2~3학년
  lv.6  고등 1학년
  lv.7  고등 2학년
  lv.8  고등 3학년 / 수능
  lv.9  수능 고난도
  lv.10 학술 논문

카테고리:
1. 초등 5~6학년 이하 (lv.1~3)
2. 중학 1학년 ~ 고등 1학년 (lv.4~6)
3. 고등 2학년 이상 (lv.7~10)

JSON으로 반환:
{
  "easy": ["apple", "run", ...],
  "appropriate": ["determine", "circumstance", ...],
  "hard": ["elaborate", "ambiguous", ...]
}
```

**UI**
```
┌─────────────────────────────────────────┐
│  "156개의 단어가 추출되었어요"             │
│                                         │
│  ▶ 쉬움 (32개)                 [전체 선택] │
│                                         │
│  ▼ 적절 (45개) ✓               [전체 해제] │
│    ☑ determine                          │
│    ☑ experiment                         │
│    ☑ circumstance                       │
│    ☑ ...                                │
│                                         │
│  ▼ 심화 (79개) ✓               [전체 해제] │
│    ☑ elaborate                          │
│    ☑ ambiguous                          │
│    ☑ ...                                │
│                                         │
│  선택된 단어: 124개                        │
│  [다음]                                  │
└─────────────────────────────────────────┘
```

**룰**
- 적절/심화 카테고리는 기본 펼침 + 전체 선택 상태
- 쉬움 카테고리는 기본 접힘 + 전체 해제 상태
- 각 카테고리 헤더에 [전체 선택] / [전체 해제] 토글 버튼
- 개별 단어 선택/해제 가능
- 선택된 단어 수 실시간 표시
- 최소 1개 (0개: 다음 버튼 비활성)
- 최대 1,000개 (초과 시 추가 선택 불가 + 안내 메시지)
- 선택된 단어 수 옆에 권장 안내: "20~30개가 학습에 적합해요"
- 기능어(관사, 전치사 등), 식별 불가능한 단어는 AI 추출 단계에서 제외
- 추출된 총 단어 수가 1개 미만: 에러 메시지 표시 → 입력 화면으로 복귀
- 최대 1,000개 (초과 시 추가 선택 불가)

---

### 화면 4 — 다의어 뜻 선택 (MeaningSelectionScreen)

**UI**
```
┌─────────────────────────────────────┐
│  "학습할 뜻을 선택하세요"              │
│                                     │
│  correct (2개의 뜻)                  │
│  ┌─────────────────────────────┐    │
│  │ ☑ 옳은, 정확한 (adj)        │    │
│  │ ☑ 고치다, 바로잡다 (verb)    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ambiguous (1개의 뜻)               │
│  ┌─────────────────────────────┐    │
│  │ ☑ 모호한, 애매한 (adj)       │    │
│  └─────────────────────────────┘    │
│                                     │
│  elaborate (2개의 뜻)               │
│  ┌─────────────────────────────┐    │
│  │ ☑ 정교한, 정밀한 (adj)       │    │
│  │ ☐ 자세히 설명하다 (verb)      │    │
│  └─────────────────────────────┘    │
│                                     │
│  [다음]                              │
└─────────────────────────────────────┘
```

**룰**
- AI가 각 단어의 한국어 뜻 그룹 + 품사를 추출하여 표시
- 기본적으로 모든 뜻이 선택된 상태
- 유저가 불필요한 뜻을 해제 가능
- 단어당 최소 1개 뜻은 선택 필수
- 뜻이 1개뿐인 단어는 해제 불가 (자동 선택 고정)

---

### 화면 5 — 세트 이름 입력

기존 WordSetNameScreen과 동일 (1~30자, 공백만 불가)

---

### 화면 6 — 저장 + 홈 복귀

- wordSet 문서 생성 (words 배열 내장)
- 저장 완료 시 홈 화면 복귀
- 에러 발생 시 재시도 옵션

---

## AI 파이프라인

### 호출 #1 — 단어 추출 + 카테고리 분류 (화면 3 진입 시)

1회 호출로 추출과 분류를 동시에 처리한다.

```
텍스트 입력:
  모델:   Claude Haiku
  Input:  텍스트 (최대 50,000자 ≈ 12,500 tokens) + 분류 프롬프트
  Output: { easy: string[], appropriate: string[], hard: string[] }
  비용:   ~$0.01
  시간:   3~8초

사진 입력:
  모델:   Claude Sonnet (Vision)
  Input:  이미지 최대 10장 (≈ 16,000 tokens) + 분류 프롬프트
  Output: { easy: string[], appropriate: string[], hard: string[] }
  비용:   ~$0.06
  시간:   5~10초
```

서버에서 유저 레벨을 교육 수준 레이블로 변환한 뒤 프롬프트에 주입한다. AI에게 lv.1~10 번호 체계를 가르칠 필요 없이, 교육 수준 설명으로 자연스럽게 분류하게 한다.

### 호출 #2 — 뜻 추출 (화면 4 진입 시)

선택된 단어를 한 번의 Claude Haiku 호출로 처리한다.

```
Input:  선택된 영단어 목록
Output: 각 단어의 { meaning, partOfSpeech }[]
시간:   3~15초 (단어 수에 따라)
```

### 에러 처리

- 호출 #1 실패: 재시도 버튼 표시
- 호출 #2 실패: 재시도 버튼 표시

### 클라이언트 UX

```
[단어 추출 중...]           ← 호출 #1 (3~10초)
  로딩 스피너 + "단어를 분석하고 있어요"

[단어 선택 화면]            ← 유저 인터랙션 (시간 제한 없음)

[뜻을 분석하고 있어요...]    ← 호출 #2 (3~15초)
  로딩 스피너

[뜻 선택 화면]              ← 유저 인터랙션
```

---

## API 엔드포인트

### POST /api/word-sets/extract-words (신규)
```
미들웨어: authenticate
요청: {
  type: 'text' | 'photo',
  text?: string,              // type === 'text'일 때
  images?: string[],          // type === 'photo'일 때 (base64 배열)
}
처리:
  1. 유저 프로필에서 easyLevel/activeLevel/hardLevel 조회
  2. 레벨 보정 (calculateClassificationLevels) → 교육 수준 레이블 변환
  3. Claude API로 영단어/숙어 추출 + 3개 카테고리 분류
     (텍스트 → Haiku / 사진 → Sonnet Vision)
  4. 기능어/식별 불가 단어 제외, 중복 제거
성공: 200 {
  success: true,
  data: {
    categories: {
      easy: string[],
      appropriate: string[],
      hard: string[]
    },
    totalCount: number
  }
}
```

### POST /api/word-sets/extract-meanings (신규)
```
미들웨어: authenticate
요청: { words: string[] }
처리:
  1. Claude Haiku 호출로 각 단어의 한국어 뜻 그룹 + 품사 추출
성공: 200 {
  success: true,
  data: {
    meanings: {
      [spelling: string]: Array<{
        meaning: string,
        partOfSpeech: string
      }>
    }
  }
}
```

### POST /api/word-sets (변경)
```
미들웨어: authenticate
요청: {
  name: string,
  source: 'manual' | 'photo',
  words: Array<{
    spelling: string,
    meanings: Array<{
      meaning: string,
      partOfSpeech: string
    }>
  }>
}
처리:
  1. name 검증 (1~30자)
  2. words 검증 (1~1,000개 — 다의어 선택 합산 기준)
  3. wordSets 문서 생성 (words 배열 내장)
성공: 201 { success: true, data: { wordSet } }
```

### GET /api/word-sets (기존 유지)

### GET /api/word-sets/:id (단순화)
```
미들웨어: authenticate
처리: wordSet 문서 하나 조회 (words 내장이므로 join 불필요)
성공: 200 { success: true, data: { wordSet } }
```

### DELETE /api/word-sets/:id (단순화)
```
미들웨어: authenticate
처리: wordSet 문서 하나 삭제
성공: 200 { success: true }
```

---

## 기존 코드 변경 사항

### 삭제
- `server/src/repositories/wordRepository.ts` — words 컬렉션 제거
- `app/src/screens/WordSetWordsScreen.tsx` — 새 플로우로 대체

### 신규
- `server/src/services/aiService.ts` — Claude API 호출 래퍼
- `app/src/screens/WordSetInputMethodScreen.tsx` — 입력 방식 선택
- `app/src/screens/WordSetTextInputScreen.tsx` — 텍스트 입력
- `app/src/screens/WordSetPhotoInputScreen.tsx` — 사진 촬영
- `app/src/screens/WordSelectionScreen.tsx` — 레벨별 단어 선택
- `app/src/screens/MeaningSelectionScreen.tsx` — 다의어 뜻 선택

### 수정
- `shared/types.ts` — WordSet 타입에 words 배열 내장, Word 타입 변경
- `server/src/repositories/wordSetRepository.ts` — words 내장 구조 반영
- `server/src/services/wordSetService.ts` — AI 파이프라인 통합
- `server/src/controllers/wordSetController.ts` — 새 엔드포인트 핸들러
- `server/src/routes/wordSets.ts` — 새 라우트 추가
- `server/src/validators/wordSetValidator.ts` — 새 스키마
- `server/src/index.ts` — words 컬렉션 인덱스 제거
- `app/src/services/wordSetService.ts` — 새 API 호출
- `app/src/stores/wordSetStore.ts` — 새 구조 반영
- `app/src/navigation/MainTabNavigator.tsx` — 새 화면 등록
- `app/src/screens/HomeScreen.tsx` — 세트 카드 업데이트

---

## 환경변수 추가

```
# server/.env
ANTHROPIC_API_KEY=          # Claude API 키 (없으면 mock 모드로 동작)
```

### Mock 모드

`ANTHROPIC_API_KEY`가 없으면 AI 호출 대신 mock 응답을 반환한다. 전체 플로우(UI, 네비게이션, DB 저장)를 API 키 없이 개발·테스트할 수 있다.

```typescript
// server/src/services/aiService.ts
const USE_MOCK = !ENV.ANTHROPIC_API_KEY;
```

- mock으로 전체 플로우 구현 → API 키 추가 시 실제 Claude 호출로 자동 전환
- 프롬프트 튜닝은 실제 API 연결 후 진행

### Mock 데이터 (30개 단어)

**extractAndClassifyWords 응답**

```typescript
const MOCK_CLASSIFIED = {
  easy: [
    "happy", "school", "friend", "water", "family",
    "garden", "travel", "simple", "bright", "gentle"
  ],
  appropriate: [
    "determine", "experiment", "circumstance", "perspective",
    "contribute", "significant", "demonstrate", "opportunity",
    "consequence", "emphasize"
  ],
  hard: [
    "ambiguous", "elaborate", "unprecedented", "comprehensive",
    "deteriorate", "contemplate", "inevitable", "scrutinize",
    "paradox", "fluctuate"
  ]
};
```

**extractMeanings 응답**

```typescript
const MOCK_MEANINGS = {
  // --- 쉬움 ---
  "happy":   [{ meaning: "행복한, 기쁜", partOfSpeech: "adj" }],
  "school":  [{ meaning: "학교", partOfSpeech: "noun" }],
  "friend":  [{ meaning: "친구", partOfSpeech: "noun" }],
  "water":   [{ meaning: "물", partOfSpeech: "noun" },
              { meaning: "물을 주다", partOfSpeech: "verb" }],
  "family":  [{ meaning: "가족", partOfSpeech: "noun" }],
  "garden":  [{ meaning: "정원", partOfSpeech: "noun" }],
  "travel":  [{ meaning: "여행하다", partOfSpeech: "verb" },
              { meaning: "여행", partOfSpeech: "noun" }],
  "simple":  [{ meaning: "간단한, 단순한", partOfSpeech: "adj" }],
  "bright":  [{ meaning: "밝은, 빛나는", partOfSpeech: "adj" },
              { meaning: "똑똑한, 영리한", partOfSpeech: "adj" }],
  "gentle":  [{ meaning: "부드러운, 온화한", partOfSpeech: "adj" }],

  // --- 적절 ---
  "determine":    [{ meaning: "결정하다, 판단하다", partOfSpeech: "verb" }],
  "experiment":   [{ meaning: "실험", partOfSpeech: "noun" },
                   { meaning: "실험하다", partOfSpeech: "verb" }],
  "circumstance": [{ meaning: "상황, 환경", partOfSpeech: "noun" }],
  "perspective":  [{ meaning: "관점, 시각", partOfSpeech: "noun" }],
  "contribute":   [{ meaning: "기여하다, 공헌하다", partOfSpeech: "verb" }],
  "significant":  [{ meaning: "중요한, 의미 있는", partOfSpeech: "adj" }],
  "demonstrate":  [{ meaning: "보여주다, 입증하다", partOfSpeech: "verb" }],
  "opportunity":  [{ meaning: "기회", partOfSpeech: "noun" }],
  "consequence":  [{ meaning: "결과, 영향", partOfSpeech: "noun" }],
  "emphasize":    [{ meaning: "강조하다", partOfSpeech: "verb" }],

  // --- 심화 ---
  "ambiguous":     [{ meaning: "모호한, 애매한", partOfSpeech: "adj" }],
  "elaborate":     [{ meaning: "정교한, 정밀한", partOfSpeech: "adj" },
                    { meaning: "자세히 설명하다", partOfSpeech: "verb" }],
  "unprecedented": [{ meaning: "전례 없는", partOfSpeech: "adj" }],
  "comprehensive": [{ meaning: "포괄적인, 종합적인", partOfSpeech: "adj" }],
  "deteriorate":   [{ meaning: "악화되다, 나빠지다", partOfSpeech: "verb" }],
  "contemplate":   [{ meaning: "숙고하다, 깊이 생각하다", partOfSpeech: "verb" }],
  "inevitable":    [{ meaning: "불가피한, 피할 수 없는", partOfSpeech: "adj" }],
  "scrutinize":    [{ meaning: "면밀히 조사하다, 꼼꼼히 살피다", partOfSpeech: "verb" }],
  "paradox":       [{ meaning: "역설, 모순", partOfSpeech: "noun" }],
  "fluctuate":     [{ meaning: "변동하다, 오르내리다", partOfSpeech: "verb" }]
};

// 사전에 없는 단어는 폴백: { meaning: "(뜻 생성 중)", partOfSpeech: "noun" }
```

---

## 완료 조건 (Definition of Done)

### 텍스트 입력 플로우
- 자유 형식 텍스트 입력 (최대 50,000자) 확인
- AI 단어 추출 + 3개 카테고리 분류 확인

### 사진 촬영 플로우
- 카메라 권한 요청 + 촬영 + 썸네일 표시 확인
- 최대 10장, 개별 삭제 확인
- AI 단어 추출 + 3개 카테고리 분류 확인

### 단어 선택 화면
- 적절/심화 카테고리 기본 전체 선택 확인
- 쉬움 카테고리 기본 전체 해제 확인
- 카테고리 접기/펼치기 확인
- 전체 선택/해제 토글 확인
- 개별 단어 선택/해제 확인
- 선택 단어 수 실시간 카운터 확인
- 최소 1개, 최대 1,000개 범위 강제 확인
- 기능어 제외 확인
- 카테고리 동적 생성 확인 (minAppropriate=1이면 쉬움 없음, maxAppropriate=10이면 심화 없음)

### 뜻 추출
- AI 호출 성공 시 뜻 선택 화면 표시 확인
- 실패 시 재시도 버튼 확인

### 다의어 뜻 선택
- AI 뜻/품사 추출 표시 확인
- 기본 전체 선택, 해제 가능, 단어당 최소 1개 필수 확인

### DB
- words 컬렉션 삭제, wordSets에 words 배열 내장 확인
- 기존 데이터 삭제 + 새 구조 동작 확인
- 다의어가 words 배열에 별도 객체로 저장 확인

### 공통
- 저장 완료 후 홈 화면 복귀 + 세트 목록 업데이트 확인
- TypeScript 에러 없음

---

## 이번 스프린트에서 하지 않는 것

- 파생어 생성 (→ 학습 UI 스프린트)
- 예문 생성 (→ 학습 UI 스프린트에서 학습 시작 전 lazy 생성)
- 8단계 학습 UI (→ Sprint 06~)
- 장기기억 연구소 (→ 이후 스프린트)
- 텍스트 + 사진 혼합 입력 (택일만 가능)
- 갤러리에서 여러 장 동시 선택 (1장씩만 가능)
- 파일 업로드 (PDF, 텍스트 파일 등)
- 단어 세트 수정 (단어 추가/삭제/이름 변경)
- 음성 데이터 (TTS)
- 홈 대시보드 실데이터 연결
- 공유 단어 풀 / 캐싱 (유저별 독립 구조로 운영, 스케일링 시 재검토)

---

## 참고 정보

- **이전 스프린트**: Sprint 04 완료
- **AI 서비스**: Anthropic Claude API
  - Vision (Sonnet): 사진 OCR + 단어 추출
  - Text (Haiku): 텍스트 단어 추출, 뜻 추출
- **비용 추정**: 단어 30개 세트 1개 ≈ $0.02~0.05 (Haiku 기준)
- **설계 결정**
  - Embed 구조 채택: 단어를 wordSets 문서에 내장. join 없이 단일 쿼리로 세트+단어 조회 가능. 세트 삭제 시 문서 1개 삭제로 완료.
  - 유저별 독립 구조 채택: 공유 풀 대비 코드 복잡도 낮고 초기 비용 차이 미미. 스케일링 시 공유 풀로 전환 검토.
  - 입력 방식 택일: 텍스트 또는 사진 중 하나만 선택. 구현 복잡도 감소.
  - 단어 수 제한: 최소 1개, 최대 1,000개.
