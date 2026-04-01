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

// 유저의 levelRatings에서 appropriate 범위를 구해 카테고리 경계를 결정한다.
export function calculateClassificationRange(
  levelRatings: Record<string, string>,
  activeLevel: number,
) {
  const appropriateLevels = Object.entries(levelRatings)
    .filter(([, rating]) => rating === 'appropriate')
    .map(([level]) => Number(level));

  const minAppropriate = appropriateLevels.length > 0
    ? Math.min(...appropriateLevels)
    : activeLevel;
  const maxAppropriate = appropriateLevels.length > 0
    ? Math.max(...appropriateLevels)
    : activeLevel;

  return { minAppropriate, maxAppropriate };
}

// 레벨 범위를 교육 수준 레이블 문자열로 변환한다.
function buildCategoryLabels(minApp: number, maxApp: number) {
  const labels: string[] = [];

  // 쉬움 카테고리 (minApp > 1인 경우만)
  if (minApp > 1) {
    const easyMax = minApp - 1;
    labels.push(`1. ${LEVEL_LABELS[easyMax]} 이하 (lv.1~${easyMax})`);
  }

  // 적절 카테고리 (항상 존재)
  labels.push(
    `${labels.length + 1}. ${LEVEL_LABELS[minApp]} ~ ${LEVEL_LABELS[maxApp]} (lv.${minApp}~${maxApp})`,
  );

  // 심화 카테고리 (maxApp < 10인 경우만)
  if (maxApp < 10) {
    const hardMin = maxApp + 1;
    labels.push(`${labels.length + 1}. ${LEVEL_LABELS[hardMin]} 이상 (lv.${hardMin}~10)`);
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
  levelRatings: Record<string, string>,
  activeLevel: number,
): Promise<{ categories: ClassifiedWords; totalCount: number }> {
  if (USE_MOCK) {
    return { categories: MOCK_CLASSIFIED, totalCount: 30 };
  }

  const { minAppropriate, maxAppropriate } = calculateClassificationRange(levelRatings, activeLevel);

  const levelTable = Object.entries(LEVEL_LABELS)
    .map(([lv, label]) => `  lv.${lv}  ${label}`)
    .join('\n');

  const categoryLabels = buildCategoryLabels(minAppropriate, maxAppropriate);

  const systemPrompt = `다음 텍스트에서 영단어와 숙어/구를 추출하고, 각 단어를 가장 적합한 카테고리에 분류해줘.

규칙:
- 관사(a, an, the), 전치사(in, on, at 등), 대명사(I, you, he 등), 접속사(and, but, or 등) 제외
- 모든 단어는 원형(lemma)으로 정규화: 복수형→단수(genes→gene), 과거형→현재(determined→determine), 진행형→원형(running→run), 3인칭→원형(makes→make), 비교급/최상급→원형(bigger→big)
- 같은 원형이 여러 번 등장하면 1번만 포함
- 모든 단어는 소문자
- 한 단어가 여러 카테고리에 걸치면 하나의 카테고리에만 배치 (적절 우선)

난이도 기준 (쉬운 순서):
${levelTable}

카테고리:
${categoryLabels}

JSON만 반환 (키: easy, appropriate, hard — 해당 카테고리가 없으면 빈 배열):
{ "easy": [...], "appropriate": [...], "hard": [...] }`;

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
    userContent.push({ type: 'text', text: '이 이미지에서 영단어를 추출해줘.' });
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

  const systemPrompt = `다음 영단어 목록의 한국어 뜻과 품사를 추출해줘.
같은 단어라도 뜻이 다르면 별도 객체로.
같은 맥락의 뜻은 쉼표로 결합.

JSON으로 반환:
{
  "word": [{ "meaning": "한국어 뜻", "partOfSpeech": "품사" }, ...]
}

품사는 noun, verb, adj, adv, phrase 중 하나.`;

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
