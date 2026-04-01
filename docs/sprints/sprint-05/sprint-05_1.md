# Sprint 05-1 — AI 파이프라인 단순화 + 프롬프트 재설계

**기간**: Sprint 05-1
**목표**: 카테고리 분류 시스템을 제거하고, 단일 AI 호출로 단어 + 뜻 + 품사를 한 번에 추출하는 구조로 전환한다.

---

## 요약

Sprint 05 초기 구현에서 카테고리 분류(easy/appropriate/hard)의 경계 계산이 복잡하고 edge case가 많았다. AI 호출도 2번(단어 추출 → 뜻 추출)으로 나뉘어 UX 지연과 비용이 증가했다. Sprint 05-1에서는 카테고리를 완전히 제거하고, AI가 유저 레벨을 참고해 "외울 가치 있는 단어"를 자율 판단하는 단일 프롬프트 구조로 전환한다. 유저는 AI가 추출한 단어 + 뜻 목록에서 원하는 것만 선택해 세트를 생성한다.

---

## 단어 세트 생성 플로우

```
[홈 화면 "새 단어 세트 만들기"]
        ↓
[1] 입력 방식 선택 (텍스트 or 사진)
        ↓
[2] 입력 (텍스트 입력 or 사진 촬영)
        ↓
[3] AI 추출 (1회) → 단어 + 뜻 선택
        ↓
[4] 세트 이름 입력
        ↓
[5] 저장 → 홈 복귀
```

---

### 화면 1 — 입력 방식 선택 (WordSetInputMethodScreen)

기존과 동일. 텍스트 / 사진 택일.

---

### 화면 2A — 텍스트 입력 (WordSetTextInputScreen)

기존과 동일. 최대 50,000자, "단어 추출하기" 버튼.

---

### 화면 2B — 사진 촬영/선택 (WordSetPhotoInputScreen)

기존과 동일. 최대 10장, 카메라/갤러리, "단어 추출하기" 버튼.

---

### 화면 3 — 단어 + 뜻 선택 (WordSelectionScreen)

AI가 추출한 단어를 뜻과 함께 flat 리스트로 표시한다. 카테고리 분류 없음.

**UI**
```
┌─────────────────────────────────────┐
│  "42개의 단어가 추출되었어요"         │
│  20~30개가 학습에 적합해요            │
│                                     │
│  ☑ determine                        │
│    · 결정하다, 판단하다 (verb)        │
│                                     │
│  ☑ correct                          │
│    · 옳은, 정확한 (adj)              │
│    · 고치다, 바로잡다 (verb)          │
│                                     │
│  ☑ look for                         │
│    · 찾다, 구하다 (phrase)           │
│                                     │
│  ☐ happy                            │
│    · 행복한, 기쁜 (adj)              │
│                                     │
│  선택된 단어: 38개                    │
│  [전체 선택] [전체 해제]              │
│  [다음]                              │
└─────────────────────────────────────┘
```

**룰**
- 기본 전체 선택 상태
- 개별 단어 선택/해제 가능
- 각 단어 아래에 뜻 + 품사 표시 (유저가 "이 뜻은 알아" 판단 가능)
- 다의어는 뜻별로 체크/해제 가능 (단어당 최소 1개 뜻 필수)
- 최소 1개, 최대 1,000개
- 선택된 단어 수 실시간 표시
- "20~30개가 학습에 적합해요" 권장 안내

---

### 화면 4 — 세트 이름 입력 (WordSetNameScreen)

기존과 동일. 1~30자, 공백만 불가. 저장 → 홈 복귀.

---

## AI 프롬프트

### 단일 프롬프트 (단어 추출 + 뜻 + 품사 통합)

```
너는 한국인 영어 학습자를 위한 단어 추출기야.
유저가 입력한 내용에서 "외울 가치가 있는 영단어, 숙어, 표현"을 골라내고
한국어 뜻과 품사까지 한 번에 제공하는 것이 목표야.

[1단계] 입력 유형 판단
먼저 입력이 무엇인지 파악하고, 유형에 맞게 추출 전략을 적용해:

- 단어 나열: apple, banana 등 단어만 나열된 입력
  → 나열된 단어를 그대로 수집

- 단어장/어휘집: 단어와 함께 뜻, 동의어, 반의어, 예문 등이 정리된 형태
  → 학습 대상 단어를 추출. 뜻이나 예문 속 부수적인 단어는 제외

- 시험지/교재/워크시트: 문제, 보기, 빈칸 채우기 등의 형태
  → 출제된 핵심 단어와 보기의 학습 대상만 추출.
    문제 번호, 지시문("다음 중", "빈칸에", "고르시오") 속 단어는 제외

- 영어 지문/기사/에세이: 연속된 영어 산문
  → 핵심 어휘만 추출. 글의 내용을 이해하는 데 중요한 단어 위주

- 가사/대본/대화문: 노래 가사, 영화 대본, 회화 등
  → 실생활에서 쓸 수 있는 표현과 어휘 위주로 추출

- 혼합 형태: 위 유형이 섞여 있는 경우
  → 각 부분의 유형을 판단해 적절한 전략을 적용

- 영어가 아닌 내용, 판독 불가, 학습과 무관한 내용
  → 빈 배열 반환

[2단계] 추출 규칙
- 단어보다 표현 단위로 외우는 것이 효과적인 경우, 표현 그대로 추출.
  예: look for, at all, in fact, take place, break down 등 (개별 단어로 쪼개지 않음)
- 기능어 제외: 관사, 전치사, 대명사, 접속사, 조동사
  (단, 숙어의 일부인 경우는 포함)
- 초기본 단어 제외: be, have, do, go, come, get, make, take, give,
  say, know, see, want, think, tell
  (단, 특수한 뜻이나 숙어의 일부인 경우는 포함)
- 원형(lemma) 정규화: 복수→단수, 과거→현재, 진행→원형 등
- 고유명사 제외
- 중복 제거, 소문자 통일

[3단계] 뜻 추출
- 각 단어/표현의 한국어 뜻과 품사를 함께 제공
- 품사나 의미가 다르면 meanings 배열에 별도 객체로 분리
- 같은 맥락의 유의어 뜻은 쉼표로 결합 (예: "옳은, 정확한")
- 자연스러운 한국어로, 학습자가 바로 이해할 수 있게
- 주요 뜻 2~3개까지. 단, 입력된 텍스트에서 실제로 사용된 뜻이라면
  드문 뜻이라도 반드시 포함
- 품사: noun, verb, adj, adv, phrase 중 하나

[참고] 이 학습자의 영어 수준
아래는 한국 교과서 기준 난이도 체계와 각 레벨의 예문이야.
이 학습자가 현재 어느 수준인지 참고해서, 외울 가치가 있는 단어를 판단해줘.

난이도 체계:
  lv.1  초등 1~2학년  — "I have a cat. It is cute."
  lv.2  초등 3~4학년  — "I usually wake up at seven and eat breakfast with my family."
  lv.3  초등 5~6학년  — "If you want to stay healthy, you should exercise regularly and eat balanced meals."
  lv.4  중학 1학년    — "The invention of the smartphone has changed the way people communicate, work, and spend their leisure time."
  lv.5  중학 2~3학년  — "Despite the rapid development of technology, many people argue that face-to-face communication remains irreplaceable in building meaningful relationships."
  lv.6  고등 1학년    — "While globalization has created unprecedented opportunities for economic growth, it has simultaneously widened the gap between the wealthy and the poor in many regions."
  lv.7  고등 2학년    — "The paradox of choice suggests that an abundance of options, rather than enhancing our sense of freedom, can ultimately lead to greater anxiety and dissatisfaction."
  lv.8  수능          — "The assumption that scientific progress is inherently linear and cumulative has been challenged by historians of science."
  lv.9  수능 고난도   — "The epistemological tension between universalist claims in moral philosophy and the particularist commitments of cultural relativism cannot be resolved through empirical inquiry alone."
  lv.10 학술 논문     — "The proliferation of algorithmic decision-making systems across institutional domains has engendered significant normative concerns regarding accountability and transparency."

이 학습자의 현재 수준:
- 쉬움 구간: lv.${easyLevel} (${easyLevelLabel})
- 학습 구간: lv.${activeLevel} (${activeLevelLabel})
- 심화 구간: lv.${hardLevel} (${hardLevelLabel})

JSON만 반환 (설명 없이 JSON만):
{
  "words": [
    { "spelling": "단어", "meanings": [{ "meaning": "뜻", "partOfSpeech": "품사" }] },
    ...
  ]
}
```

---

## API 엔드포인트

### POST /api/word-sets/extract (변경)
```
미들웨어: authenticate
요청: {
  type: 'text' | 'photo',
  text?: string,
  images?: string[],
}
처리:
  1. 유저 프로필에서 easyLevel/activeLevel/hardLevel 조회
  2. 단일 Claude API 호출 (단어 + 뜻 + 품사 한 번에)
성공: 200 {
  success: true,
  data: {
    words: Array<{
      spelling: string,
      meanings: Array<{ meaning: string, partOfSpeech: string }>
    }>
  }
}
```

### POST /api/word-sets/extract-meanings — 삭제

### POST /api/word-sets (유지)
```
미들웨어: authenticate
요청: {
  name: string,
  source: 'manual' | 'photo',
  words: Array<{ spelling: string, meaning: string, partOfSpeech: string }>
}
```

### GET /api/word-sets (유지)
### GET /api/word-sets/:id (유지)
### DELETE /api/word-sets/:id (유지)

---

## 코드 변경 목록

### 서버

| 파일 | 변경 | 내용 |
|------|------|------|
| `services/aiService.ts` | 전면 수정 | 프롬프트 교체, extractMeanings 삭제, 카테고리 분류 로직 삭제 |
| `services/wordSetService.ts` | 수정 | extractMeanings 삭제, extractWords 응답 flat 구조 |
| `controllers/wordSetController.ts` | 수정 | extractMeanings 핸들러 삭제 |
| `routes/wordSets.ts` | 수정 | extract-meanings 라우트 삭제, extract-words → extract |
| `validators/wordSetValidator.ts` | 수정 | extractMeaningsSchema 삭제 |

### 클라이언트

| 파일 | 변경 | 내용 |
|------|------|------|
| `screens/MeaningSelectionScreen.tsx` | 삭제 | WordSelectionScreen에 통합 |
| `screens/WordSelectionScreen.tsx` | 전면 수정 | 카테고리 UI 제거, flat 리스트 + 뜻 표시 + 뜻별 체크 |
| `screens/WordSetTextInputScreen.tsx` | 수정 | navigate 파라미터 변경 |
| `screens/WordSetPhotoInputScreen.tsx` | 수정 | navigate 파라미터 변경 |
| `services/wordSetService.ts` | 수정 | extractMeanings 삭제, extractWords 응답 타입 변경 |
| `navigation/MainTabNavigator.tsx` | 수정 | MeaningSelection 화면 제거, 파라미터 타입 변경 |

---

## 완료 조건 (Definition of Done)

- AI 단일 호출로 단어 + 뜻 + 품사 추출 확인
- 카테고리 분류 코드 완전 제거 확인
- MeaningSelectionScreen 삭제 확인
- WordSelectionScreen에서 단어 + 뜻 표시 확인
- 다의어 뜻별 체크/해제 확인 (단어당 최소 1개)
- 전체 선택/해제 확인
- 텍스트 입력 → 추출 → 선택 → 이름 → 저장 플로우 확인
- 사진 입력 → 추출 → 선택 → 이름 → 저장 플로우 확인
- mock 모드 정상 동작 확인
- TypeScript 에러 없음

---

## 이번 작업에서 하지 않는 것

- 실제 Claude API 연결 후 프롬프트 튜닝 (API 키 연결 후 별도 진행)
- 홈 화면 세트 카드 디자인 변경
- 학습 기능 구현
- 단어 세트 수정 기능
