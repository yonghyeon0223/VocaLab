import { ENV } from '../utils/env';
import { LEVEL_LABELS } from './levelLabels';

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

  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('Claude 응답에서 JSON을 파싱할 수 없습니다');

  return JSON.parse(jsonMatch[1]);
}

// --- 1차: 단어 추출 (spelling만) ---

function buildExtractionPrompt(activeLevel: number) {
  return `너는 한국인 영어 학습자를 위한 단어 추출기야.
유저가 입력한 내용에서 "외울 가치가 있는 영단어, 숙어, 표현"의 spelling만 추출해.

[학습자 수준]
이 유저는 한국 영어 교과서 기준 ${LEVEL_LABELS[activeLevel]} 수준이야.
이 수준과 같거나 더 어려운 단어만 추출해.

[1단계] 입력 유형 판단
- 단어 나열 → 그대로 수집
- 단어장/어휘집 → 학습 대상 단어만 추출
- 시험지/교재 → 핵심 단어와 보기만. 지시문 속 단어 제외
- 지문/기사/에세이 → 핵심 어휘 위주
- 가사/대본/대화문 → 실생활 표현과 어휘 위주
- 혼합 → 각 부분에 맞는 전략 적용
- 영어 아님 / 판독 불가 → 빈 배열

[2단계] 추출 규칙
- 숙어/표현은 통째로 (look for, break down, in fact 등)
- 기능어 제외 (관사, 전치사, 대명사, 접속사, 조동사). 숙어 일부는 포함
- 초기본 동사 제외 (be, have, do, go, come, get, make, take, give, say, know, see, want, think, tell). 특수 뜻이나 숙어 일부는 포함
- 원형(lemma) 정규화, 고유명사 제외, 중복 제거, 소문자

JSON만 반환:
{ "words": ["단어1", "단어2", ...] }`;
}

export async function extractSpellings(
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  activeLevel: number,
): Promise<string[]> {
  const systemPrompt = buildExtractionPrompt(activeLevel);

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
  return Array.isArray(result.words) ? result.words : [];
}

// --- 2차: 영영 뜻 → 한국어 번역 ---

type DictionaryEntry = {
  spelling: string;
  meanings: Array<{ definition: string; partOfSpeech: string }>;
};

type TranslatedWord = {
  spelling: string;
  meanings: Array<{ definition: string; meaning: string; partOfSpeech: string }>;
};

export async function translateMeanings(entries: DictionaryEntry[]): Promise<TranslatedWord[]> {
  // 사전에서 뜻을 찾지 못한 단어는 제외
  const withMeanings = entries.filter((e) => e.meanings.length > 0);
  if (withMeanings.length === 0) return [];

  const systemPrompt = `아래 영단어들의 영영 풀이를 한국어로 번역해줘.
각 뜻을 학생이 가장 쉽게 이해할 수 있는 자연스러운 한국어 한 단어 또는 짧은 구로 번역해.
영영 풀이 원문은 그대로 유지하고, meaning 필드에 한국어 번역만 추가해.

JSON만 반환:
{
  "words": [
    {
      "spelling": "단어",
      "meanings": [
        { "definition": "영영 원문 그대로", "meaning": "한국어 번역", "partOfSpeech": "품사" }
      ]
    }
  ]
}`;

  const input = withMeanings.map((e) => ({
    spelling: e.spelling,
    meanings: e.meanings.map((m) => ({
      definition: m.definition,
      partOfSpeech: m.partOfSpeech,
    })),
  }));

  const userContent = [{ type: 'text', text: JSON.stringify(input) }];
  const result = await callClaude('claude-haiku-4-5-20241022', systemPrompt, userContent);

  return Array.isArray(result.words) ? result.words : [];
}
