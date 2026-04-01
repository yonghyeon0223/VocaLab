import { ENV } from '../utils/env';
import { LEVEL_LABELS } from './levelLabels';

// --- 타입 ---

type ExtractedWord = {
  spelling: string;
  meanings: Array<{ definition: string; meaning: string; partOfSpeech: string }>;
};

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

// --- 단어 추출 (단일 호출) ---

// 프롬프트는 추후 교체 예정. 현재는 플레이스홀더.
function buildPrompt(activeLevel: number, wordCount: number) {
  return `너는 한국인 영어 학습자를 위한 단어 추출기야.
유저가 입력한 내용에서 외울 가치가 있는 핵심 영단어를 정확히 ${wordCount}개 골라내고,
각 단어의 영영 풀이, 한국어 뜻, 품사를 제공해.

[학습자 수준]
이 유저는 한국 영어 교과서 기준 ${LEVEL_LABELS[activeLevel]} 수준이야.
이 수준과 같거나 더 어려운 단어만 추출해.

[추출 규칙]
- 숙어/표현은 통째로 (look for, break down 등)
- 기능어 제외 (관사, 전치사, 대명사, 접속사, 조동사). 숙어 일부는 포함
- 초기본 동사 제외 (be, have, do, go, come, get, make, take, give, say, know, see, want, think, tell). 특수 뜻이나 숙어는 포함
- 원형(lemma) 정규화, 고유명사 제외, 중복 제거, 소문자

[뜻 규칙]
- 각 단어의 meanings 배열에 뜻을 넣어줘
- definition: 영어 풀이
- meaning: 한국어 번역 (학생이 쉽게 이해할 수 있게)
- partOfSpeech: noun, verb, adj, adv, phrase 중 하나
- 품사가 다르면 별도 객체 (예: doubt → 의심하다 verb + 의심 noun)
- 같은 품사라도 뜻이 다르면 별도 객체 (예: sense → 감각 noun + 의미 noun)

JSON만 반환:
{
  "words": [
    {
      "spelling": "단어",
      "meanings": [
        { "definition": "영영 풀이", "meaning": "한국어 뜻", "partOfSpeech": "품사" }
      ]
    }
  ]
}`;
}

export async function extractWords(
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  activeLevel: number,
  wordCount: number,
): Promise<{ words: ExtractedWord[] }> {
  const systemPrompt = buildPrompt(activeLevel, wordCount);

  let userContent: unknown[];
  let model: string;

  if (input.type === 'text') {
    model = 'claude-haiku-4-5-20251001';
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
  const words: ExtractedWord[] = Array.isArray(result.words) ? result.words : [];

  return { words };
}
