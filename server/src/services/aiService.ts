import { ENV } from '../utils/env';
import { LEVEL_LABELS } from './levelLabels';

const USE_MOCK = !ENV.ANTHROPIC_API_KEY;

// --- 타입 ---

type ClassifiedWords = {
  easy: string[];
  appropriate: string[];
  hard: string[];
};

type MeaningEntry = {
  meaning: string;
  partOfSpeech: string;
};

type MeaningsMap = Record<string, MeaningEntry[]>;

// --- Mock 데이터 ---

const MOCK_CLASSIFIED: ClassifiedWords = {
  easy: [
    'happy', 'school', 'friend', 'water', 'family',
    'garden', 'travel', 'simple', 'bright', 'gentle',
  ],
  appropriate: [
    'determine', 'experiment', 'circumstance', 'perspective',
    'contribute', 'significant', 'demonstrate', 'opportunity',
    'consequence', 'emphasize',
  ],
  hard: [
    'ambiguous', 'elaborate', 'unprecedented', 'comprehensive',
    'deteriorate', 'contemplate', 'inevitable', 'scrutinize',
    'paradox', 'fluctuate',
  ],
};

const MOCK_MEANINGS: MeaningsMap = {
  'happy': [{ meaning: '행복한, 기쁜', partOfSpeech: 'adj' }],
  'school': [{ meaning: '학교', partOfSpeech: 'noun' }],
  'friend': [{ meaning: '친구', partOfSpeech: 'noun' }],
  'water': [{ meaning: '물', partOfSpeech: 'noun' }, { meaning: '물을 주다', partOfSpeech: 'verb' }],
  'family': [{ meaning: '가족', partOfSpeech: 'noun' }],
  'garden': [{ meaning: '정원', partOfSpeech: 'noun' }],
  'travel': [{ meaning: '여행하다', partOfSpeech: 'verb' }, { meaning: '여행', partOfSpeech: 'noun' }],
  'simple': [{ meaning: '간단한, 단순한', partOfSpeech: 'adj' }],
  'bright': [{ meaning: '밝은, 빛나는', partOfSpeech: 'adj' }, { meaning: '똑똑한, 영리한', partOfSpeech: 'adj' }],
  'gentle': [{ meaning: '부드러운, 온화한', partOfSpeech: 'adj' }],
  'determine': [{ meaning: '결정하다, 판단하다', partOfSpeech: 'verb' }],
  'experiment': [{ meaning: '실험', partOfSpeech: 'noun' }, { meaning: '실험하다', partOfSpeech: 'verb' }],
  'circumstance': [{ meaning: '상황, 환경', partOfSpeech: 'noun' }],
  'perspective': [{ meaning: '관점, 시각', partOfSpeech: 'noun' }],
  'contribute': [{ meaning: '기여하다, 공헌하다', partOfSpeech: 'verb' }],
  'significant': [{ meaning: '중요한, 의미 있는', partOfSpeech: 'adj' }],
  'demonstrate': [{ meaning: '보여주다, 입증하다', partOfSpeech: 'verb' }],
  'opportunity': [{ meaning: '기회', partOfSpeech: 'noun' }],
  'consequence': [{ meaning: '결과, 영향', partOfSpeech: 'noun' }],
  'emphasize': [{ meaning: '강조하다', partOfSpeech: 'verb' }],
  'ambiguous': [{ meaning: '모호한, 애매한', partOfSpeech: 'adj' }],
  'elaborate': [{ meaning: '정교한, 정밀한', partOfSpeech: 'adj' }, { meaning: '자세히 설명하다', partOfSpeech: 'verb' }],
  'unprecedented': [{ meaning: '전례 없는', partOfSpeech: 'adj' }],
  'comprehensive': [{ meaning: '포괄적인, 종합적인', partOfSpeech: 'adj' }],
  'deteriorate': [{ meaning: '악화되다, 나빠지다', partOfSpeech: 'verb' }],
  'contemplate': [{ meaning: '숙고하다, 깊이 생각하다', partOfSpeech: 'verb' }],
  'inevitable': [{ meaning: '불가피한, 피할 수 없는', partOfSpeech: 'adj' }],
  'scrutinize': [{ meaning: '면밀히 조사하다, 꼼꼼히 살피다', partOfSpeech: 'verb' }],
  'paradox': [{ meaning: '역설, 모순', partOfSpeech: 'noun' }],
  'fluctuate': [{ meaning: '변동하다, 오르내리다', partOfSpeech: 'verb' }],
};

// --- 분류 범위 계산 ---

// 유저의 easyLevel/activeLevel/hardLevel로 카테고리 레이블을 생성한다.
// 같은 값이면 해당 카테고리를 프롬프트에서 제외한다.
function buildCategoryLabels(easyLv: number, activeLv: number, hardLv: number) {
  const labels: string[] = [];

  // 쉬움: easyLevel과 activeLevel이 다를 때만 존재
  if (easyLv !== activeLv) {
    labels.push(`- easy (쉬움): ${LEVEL_LABELS[easyLv]} 이하 (lv.1~${easyLv})`);
  }

  // 적절: 항상 존재
  labels.push(
    `- appropriate (적절): ${LEVEL_LABELS[activeLv]} (lv.${activeLv})`,
  );

  // 심화: activeLevel과 hardLevel이 다를 때만 존재
  if (activeLv !== hardLv) {
    labels.push(`- hard (심화): ${LEVEL_LABELS[hardLv]} 이상 (lv.${hardLv}~10)`);
  }

  return labels.join('\n');
}

// --- Claude API 호출 ---

async function callClaude(model: string, systemPrompt: string, userContent: unknown[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ENV.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = await res.json() as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text ?? '';

  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('Claude 응답에서 JSON을 파싱할 수 없습니다');

  return JSON.parse(jsonMatch[1]);
}

// --- 공개 API ---

// 텍스트 또는 사진에서 영단어를 추출하고 3개 카테고리로 분류한다.
export async function extractAndClassifyWords(
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  easyLevel: number,
  activeLevel: number,
  hardLevel: number,
): Promise<{ categories: ClassifiedWords; totalCount: number }> {
  if (USE_MOCK) {
    return { categories: MOCK_CLASSIFIED, totalCount: 30 };
  }

  const levelTable = Object.entries(LEVEL_LABELS)
    .map(([lv, label]) => `  lv.${lv}  ${label}`)
    .join('\n');

  const categoryLabels = buildCategoryLabels(easyLevel, activeLevel, hardLevel);

  const systemPrompt = `너는 한국인 영어 학습자를 위한 단어 추출기야.
유저가 입력한 내용에서 "외울 가치가 있는 영단어와 숙어"만 골라내는 것이 목표야.

[1단계] 입력 유형 판단
먼저 입력이 무엇인지 판단해:
- 단어 리스트 (apple, banana 등 나열) → 나열된 단어를 그대로 수집
- 시험지/교재/워크시트 → 출제된 핵심 단어와 보기에 등장하는 학습 대상 단어만 추출. 문제 번호, 지시문("다음 중", "빈칸에") 속 단어는 제외
- 영어 지문/기사/가사/대본 → 해당 글의 핵심 어휘만 추출. 내용을 이해하는 데 중요한 단어 위주
- 영어가 아닌 내용, 판독 불가, 학습과 무관한 내용 → 빈 배열 반환

[2단계] 필터링 규칙
- 기능어 제외: 관사(a, an, the), 전치사(in, on, at 등), 대명사(I, you, he 등), 접속사(and, but, or 등), 조동사(can, will, should 등)
- 초기본 단어 제외: be, have, do, go, come, get, make, take, give, say, know, see, want, think, tell 등 누구나 아는 최기초 동사
- 원형(lemma) 정규화: 복수→단수(genes→gene), 과거→현재(determined→determine), 진행→원형(running→run), 3인칭→원형(makes→make), 비교급/최상급→원형(bigger→big)
- 같은 원형이 여러 번 등장하면 1번만 포함
- 모든 단어는 소문자
- 고유명사(사람 이름, 지명, 브랜드)는 제외

[3단계] 난이도 분류
추출된 단어를 아래 카테고리에 분류해. 한 단어는 하나의 카테고리에만 배치해.

난이도 기준:
${levelTable}

카테고리:
${categoryLabels}

JSON만 반환 (설명 없이 JSON만):
{ "easy": [...], "appropriate": [...], "hard": [...] }
해당 카테고리가 없으면 빈 배열.`;

  let userContent: unknown[];
  let model: string;

  if (input.type === 'text') {
    model = 'claude-haiku-4-5-20241022';
    userContent = [{ type: 'text', text: input.text }];
  } else {
    model = 'claude-sonnet-4-20250514';
    userContent = input.images.map((img) => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: img },
    }));
    userContent.push({ type: 'text', text: '이 이미지에서 학습할 영단어를 추출해줘.' });
  }

  const result = await callClaude(model, systemPrompt, userContent);

  const categories: ClassifiedWords = {
    easy: Array.isArray(result.easy) ? result.easy : [],
    appropriate: Array.isArray(result.appropriate) ? result.appropriate : [],
    hard: Array.isArray(result.hard) ? result.hard : [],
  };

  const totalCount = categories.easy.length + categories.appropriate.length + categories.hard.length;

  return { categories, totalCount };
}

// 선택된 단어들의 한국어 뜻 + 품사를 추출한다.
export async function extractMeanings(words: string[]): Promise<MeaningsMap> {
  if (USE_MOCK) {
    const result: MeaningsMap = {};
    for (const w of words) {
      result[w] = MOCK_MEANINGS[w] ?? [{ meaning: '(뜻 생성 중)', partOfSpeech: 'noun' }];
    }
    return result;
  }

  const systemPrompt = `너는 한국인 영어 학습자를 위한 사전이야.
주어진 영단어 목록의 한국어 뜻과 품사를 추출해.

규칙:
- 같은 단어라도 품사나 의미가 다르면 별도 객체로 분리 (예: "run" → 달리다(verb), 운영(noun))
- 같은 맥락에서 쓰이는 유의어 뜻은 쉼표로 결합 (예: "옳은, 정확한")
- 뜻은 자연스러운 한국어로 작성. 학습자가 바로 이해할 수 있게
- 숙어/구(phrasal verb 등)는 phrase로 표기
- 주요 뜻 위주로 2~3개까지만. 너무 드문 뜻은 제외

품사: noun, verb, adj, adv, phrase 중 하나

JSON만 반환 (설명 없이 JSON만):
{ "단어": [{ "meaning": "한국어 뜻", "partOfSpeech": "품사" }], ... }`;

  const userContent = [{ type: 'text', text: words.join(', ') }];
  const result = await callClaude('claude-haiku-4-5-20241022', systemPrompt, userContent);

  // 결과 정규화: 누락된 단어는 폴백
  const meanings: MeaningsMap = {};
  for (const w of words) {
    meanings[w] = Array.isArray(result[w]) && result[w].length > 0
      ? result[w]
      : [{ meaning: '(뜻 생성 중)', partOfSpeech: 'noun' }];
  }

  return meanings;
}
