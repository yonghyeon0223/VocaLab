# Sprint 05 — 최종 리포트

**날짜**: 2026-04-06
**스프린트**: Sprint 05
**상태**: ✅ 완료

---

## 한줄 요약

AI 기반 단어 추출 파이프라인을 구축했다. 텍스트/사진 입력 → AI가 핵심 단어 추출 → AI가 뜻 생성 → 유저가 선택 → 단어 세트 저장. 4차례의 아키텍처 변경과 프롬프트 튜닝을 거쳐 최종 구조에 도달했다.

---

## 최종 아키텍처

```
유저: 텍스트/사진 입력 + 원하는 단어 수(N) 지정
        ↓
호출 #1 (Haiku): N개 단어 spelling 추출 + 세트 제목 추천
        ↓
호출 #2 (Haiku): 원본 텍스트 + spelling → 단어당 최대 3개 뜻 생성
  (50개 이상이면 반으로 나눠 병렬 호출 — output 8192 한도 방지)
        ↓
유저: 단어+뜻 선택 → 세트 이름(AI 추천 프리필) → 저장
```

---

## 아키텍처 변경 이력 (v1~v4)

| 버전 | 구조 | 폐기 이유 |
|------|------|----------|
| v1 | AI #1(추출+카테고리 분류) + AI #2(뜻) | 카테고리 경계 edge case 과다 |
| v2 | AI 1회(추출+뜻 통합) | 다의어 분리 부정확, 품사 누락 |
| v3 | AI #1(spelling) + Free Dictionary + AI #2(번역) | API rate limit, 커버리지 부족 |
| v4 | AI #1(spelling+제목) + AI #2(뜻, 배치) | **최종 채택** |

---

## 프롬프트 설계 교훈

1. AI에게 여러 역할을 동시에 시키면 각각의 품질이 떨어진다
2. 프롬프트는 영어로 쓰는 게 응답 품질이 높다
3. "exactly N개"라고 해도 AI는 초과할 수 있다 → 클라이언트에서 100개 자름
4. 한국어 뜻은 "외우기 쉬운 것"을 1차 목표로 명시해야 간결해진다
5. 원본 텍스트를 2차 호출에 포함해야 지문 맥락에 맞는 뜻을 생성한다
6. Haiku 4.5의 output 한도는 8192 tokens — 단어 50개 이상이면 배치 분할 필요

---

## 최종 화면 플로우

### AI 기반 (영어 지문 / 사진 촬영)
```
입력 방식 선택 → 텍스트 or 사진 → 단어 수 입력
→ 로딩 화면 (서버 전송 → 단어 추출 → 추출된 단어 표시 → 뜻 분석)
→ 단어+뜻 선택 → 세트 이름 (AI 추천 프리필) → 저장
```

---

## DB 구조 (최종)

```typescript
type WordMeaning = {
  definition: string;     // 영영 풀이
  meaning: string;        // 한국어 뜻
  partOfSpeech: string;   // 품사
};

type Word = {
  spelling: string;
  meanings: WordMeaning[];  // 최대 3개
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

## API 엔드포인트 (최종)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/word-sets/extract-spellings` | AI 단어 추출 (spelling + 제목) |
| POST | `/api/word-sets/generate-meanings` | AI 뜻 생성 (원본 텍스트 + spelling) |
| POST | `/api/word-sets` | 세트 생성 |
| GET | `/api/word-sets` | 목록 조회 (wordCount aggregation) |
| GET | `/api/word-sets/:id` | 상세 조회 |
| DELETE | `/api/word-sets/:id` | 삭제 |

---

## 주요 UX 결정

| 결정 | 이유 |
|------|------|
| 유저가 단어 수 직접 입력 (1~100) | AI에게 맡기면 과다/과소 추출 |
| 로딩 화면에 실제 단계 표시 | "멈춘 거 아닌가" 불안 해소 |
| 추출된 단어를 칩으로 중간 표시 | 기다리는 동안 피드백 |
| 카드 탭으로 선택/해제 (체크박스 X) | 터치 영역 넓어 편리 |
| AI 추천 제목을 이름 입력에 프리필 | 유저 편의성 |
| 삭제 시 확인 다이얼로그 | 실수 방지 |

---

## 변경된 파일 (최종)

### 신규
| 파일 | 설명 |
|------|------|
| `app/src/screens/WordSetInputMethodScreen.tsx` | 입력 방식 선택 (2가지) |
| `app/src/screens/WordSetTextInputScreen.tsx` | 영어 지문 입력 |
| `app/src/screens/WordSetPhotoInputScreen.tsx` | 사진 촬영/갤러리 |
| `app/src/screens/WordSetWordCountScreen.tsx` | 단어 수 입력 |
| `app/src/screens/WordSetExtractingScreen.tsx` | AI 추출 로딩 (단계별) |
| `app/src/screens/WordSelectionScreen.tsx` | 단어+뜻 선택 |
| `app/src/constants/pos.ts` | 품사 한국어 레이블 |
| `server/src/services/aiService.ts` | Claude API (2단계 호출) |
| `server/src/services/levelLabels.ts` | 서버용 레벨 레이블 |

### 삭제
| 파일 | 이유 |
|------|------|
| `server/src/repositories/wordRepository.ts` | words 컬렉션 제거 |
| `server/src/services/dictionaryService.ts` | Free Dictionary 제거 |
| `app/src/screens/WordSetWordsScreen.tsx` | 새 플로우로 대체 |
| `app/src/screens/MeaningSelectionScreen.tsx` | WordSelection에 통합 |
| `app/src/screens/WordSetManualEntryScreen.tsx` | 기능 비활성화 |

### 수정
| 파일 | 설명 |
|------|------|
| `shared/types.ts` | Word/WordMeaning/WordSet 타입 |
| `server/src/services/wordSetService.ts` | 2단계 파이프라인 |
| `server/src/controllers/wordSetController.ts` | extract-spellings, generate-meanings |
| `server/src/routes/wordSets.ts` | 라우트 분리 |
| `server/src/validators/wordSetValidator.ts` | 스키마 분리 |
| `server/src/repositories/wordSetRepository.ts` | embed + wordCount aggregation |
| `server/src/index.ts` | body limit 50MB |
| `server/src/utils/env.ts` | ANTHROPIC_API_KEY |
| `app/src/services/wordSetService.ts` | 2단계 API |
| `app/src/navigation/MainTabNavigator.tsx` | 화면 등록 |
| `app/src/screens/HomeScreen.tsx` | 3개 메뉴 카드 |
| `app/src/screens/LearningScreen.tsx` | 단어 세트 목록 + 삭제 확인 |
| `app/src/screens/WordSetNameScreen.tsx` | 추천 제목 프리필 |
