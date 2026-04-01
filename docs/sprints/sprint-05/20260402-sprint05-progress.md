# Sprint 05 — 진행 리포트

**날짜**: 2026-04-02
**스프린트**: Sprint 05
**상태**: ⚠️ 진행 중

---

## 무엇을 했는가

AI 기반 단어 추출 파이프라인을 구축하고, 3차례의 대규모 아키텍처 변경을 거쳐 현재 구조에 도달했다. 초기 설계에서 발견된 문제들을 실사용 테스트를 통해 반복적으로 개선했다.

---

## 아키텍처 변경 이력

### v1 — 초기 구현 (Sprint 05)
```
AI 호출 #1: 단어 추출 + 카테고리(easy/appropriate/hard) 분류
AI 호출 #2: 선택된 단어의 한국어 뜻 추출
```
**문제**: 카테고리 경계 계산 복잡, edge case 많음, AI 뜻 생성 부정확

### v2 — 카테고리 제거 + 프롬프트 통합 (Sprint 05-1)
```
AI 호출 1회: 단어 추출 + 뜻 + 품사 한 번에
```
**문제**: AI가 단어 추출과 뜻 생성을 동시에 하니 둘 다 중간 품질. 다의어 분리 부정확, 품사별 뜻 누락

### v3 — Free Dictionary API 도입 (현재)
```
AI 호출 #1: 단어 추출 (spelling만)
Dictionary API: 영영 뜻 + 품사 조회 (Free Dictionary)
AI 호출 #2: 영영 뜻 → 한국어 번역
```
**장점**: AI는 각 역할에 집중, 뜻은 사전 기반으로 정확, 다의어/품사 분리 완벽

---

## DB 구조 변경

### words 컬렉션 → 삭제
기존 별도 컬렉션 제거, wordSets 문서에 내장.

### Word 타입 변경 이력
```
v1: { spelling, meaning, partOfSpeech }         ← 다의어는 별도 객체
v3: { spelling, meanings: WordMeaning[] }        ← 하나의 단어에 모든 뜻 포함
```

### WordMeaning (신규)
```typescript
type WordMeaning = {
  definition: string;     // 영영 풀이 (Free Dictionary 원본)
  meaning: string;        // 한국어 뜻 (AI 번역)
  partOfSpeech: string;   // 품사
};
```

### WordSet 타입
```typescript
type WordSet = {
  _id: string;
  userId: string;
  name: string;
  source: 'manual' | 'photo';
  words: Word[];           // 내장 배열
  createdAt: Date;
  updatedAt: Date;
};
```

---

## AI 프롬프트 변경 이력

### 단어 추출 프롬프트 (최종)
- 7가지 입력 유형 자동 판단 (단어 나열, 단어장, 시험지, 지문, 가사, 혼합, 판독불가)
- 숙어/표현 통째로 추출
- 학습자 수준(activeLevel) 기반 필터링 — 같거나 어려운 단어만
- spelling만 반환 (뜻 생성은 사전 + AI 번역으로 분리)

### 한국어 번역 프롬프트
- Free Dictionary 영영 풀이를 자연스러운 한국어로 번역
- 영영 원문(definition) 보존 + 한국어 번역(meaning) 추가

### 프롬프트 튜닝 과정에서 발견한 교훈
- AI에게 단어 추출 + 뜻 생성을 동시에 시키면 둘 다 품질 저하
- 카테고리 분류 규칙이 복잡하면 AI가 핵심(단어 추출)에 집중 못함
- 뜻 결합(쉼표) 규칙이 모호하면 다의어가 하나로 합쳐짐
- "감각"과 "의미"처럼 대체 불가한 뜻도 AI가 같은 맥락으로 판단하는 경우 존재
- → 결론: 뜻은 사전 API를 쓰는 게 정확도가 보장됨

---

## 화면 플로우 변경

### 초기 (6단계)
```
입력방식 → 입력 → AI#1(추출+분류) → 카테고리별 단어 선택 → AI#2(뜻) → 뜻 선택 → 이름 → 저장
```

### 최종 (5단계)
```
입력방식 → 입력 → AI+Dictionary(추출+뜻) → 단어+뜻 선택 → 이름 → 저장
```

---

## API 엔드포인트 변경

| 엔드포인트 | 변경 |
|-----------|------|
| `POST /api/word-sets/extract` | 신규 — AI 추출 + Dictionary + AI 번역 통합 |
| `POST /api/word-sets/extract-words` | 삭제 (extract로 통합) |
| `POST /api/word-sets/extract-meanings` | 삭제 (Dictionary로 대체) |
| `POST /api/word-sets` | 수정 — words 구조 변경 (meanings 배열 내장) |

---

## 변경된 파일

### 신규
| 파일 | 설명 |
|------|------|
| `server/src/services/dictionaryService.ts` | Free Dictionary API 래퍼 |
| `server/src/services/levelLabels.ts` | 서버용 레벨 레이블 |
| `app/src/screens/WordSetInputMethodScreen.tsx` | 입력 방식 선택 |
| `app/src/screens/WordSetTextInputScreen.tsx` | 텍스트 입력 |
| `app/src/screens/WordSetPhotoInputScreen.tsx` | 사진 촬영/선택 |
| `app/src/screens/WordSelectionScreen.tsx` | 단어 + 뜻 선택 |
| `docs/sprints/sprint-05/sprint-05_1.md` | Sprint 05-1 계획 문서 |

### 삭제
| 파일 | 이유 |
|------|------|
| `server/src/repositories/wordRepository.ts` | words 컬렉션 제거 (embed) |
| `app/src/screens/WordSetWordsScreen.tsx` | 새 플로우로 대체 |
| `app/src/screens/MeaningSelectionScreen.tsx` | WordSelectionScreen에 통합 |

### 수정
| 파일 | 설명 |
|------|------|
| `shared/types.ts` | Word/WordMeaning/WordSet 타입 변경 |
| `server/src/services/aiService.ts` | 3차례 전면 재작성 (추출+번역 분리) |
| `server/src/services/wordSetService.ts` | 3단계 파이프라인 통합 |
| `server/src/controllers/wordSetController.ts` | extractMeanings 삭제, extract 변경 |
| `server/src/routes/wordSets.ts` | 라우트 정리 |
| `server/src/validators/wordSetValidator.ts` | 스키마 변경 |
| `server/src/repositories/wordSetRepository.ts` | embed 구조 반영 |
| `server/src/index.ts` | words 인덱스 제거, body limit 50MB |
| `server/src/utils/env.ts` | ANTHROPIC_API_KEY 추가 |
| `app/src/services/wordSetService.ts` | API 구조 변경 반영 |
| `app/src/navigation/MainTabNavigator.tsx` | 화면 추가/삭제, 파라미터 변경 |
| `app/src/screens/HomeScreen.tsx` | 세트 카드 words.length, navigate 변경 |
| `app/src/screens/WordSetNameScreen.tsx` | 파라미터 구조 변경 |

---

## 다음 작업에서 고려할 것

- Free Dictionary API에 없는 단어(숙어, 전문용어 등) 처리 방안
- AI 번역 품질 모니터링 및 프롬프트 튜닝 지속
- 단어 세트 상세 화면 (단어 목록 + 뜻 표시)
- CLAUDE.md Sprint 05 도메인 지식 업데이트
- 학습 기능 구현 (Sprint 06~)
