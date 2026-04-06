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

// --- 호출 #1: 단어 추출 (spelling만) ---

function buildExtractionPrompt(activeLevel: number, wordCount: number) {
  return `You are a vocabulary extraction assistant for a Korean English learner.

[Student Profile]
- English level: ${LEVEL_LABELS[activeLevel]} (based on Korean school curriculum)
- Only extract words at or above this level. Exclude words that are too easy for this student.

[Task]
1. Extract exactly ${wordCount} high-priority English words/phrases from the input.
2. Suggest a short, descriptive Korean title for this word set.
   The title should reflect the specific topic or content of the passage when possible.
   (e.g. "인간의 감각 체계" for a passage about human senses,
    "수능 모의고사 3번 지문" for an exam passage,
    "경제 성장과 불평등" for an economics article)

[Extraction Rules]
- Extract phrases when words are better memorized together (e.g. "break down", "look for")
- Normalize to lemma form (running→run, genes→gene)
- Exclude function words, very basic verbs (be, have, do, go, come, get, make, take, give, say, know, see, want, think, tell), proper nouns
- Deduplicate, lowercase
- If fewer than ${wordCount} extractable words exist, return however many you can — but never exceed ${wordCount}

Return JSON only:
{ "title": "추천 제목", "words": ["word1", "word2", ...] }`;
}

export async function extractSpellings(
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  activeLevel: number,
  wordCount: number,
): Promise<{ title: string; spellings: string[] }> {
  const systemPrompt = buildExtractionPrompt(activeLevel, wordCount);

  let userContent: unknown[];

  if (input.type === 'text') {
    userContent = [{ type: 'text', text: input.text }];
  } else {
    userContent = input.images.map((img) => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: img },
    }));
    userContent.push({ type: 'text', text: '이 이미지에서 학습할 영단어를 추출해줘.' });
  }

  const result = await callClaude('claude-haiku-4-5-20251001', systemPrompt, userContent);
  const title: string = result.title ?? '';
  const words: string[] = Array.isArray(result.words) ? result.words : [];
  console.log('[extractSpellings] AI 반환 title:', JSON.stringify(title));

  // 중복 제거 + 소문자 정규화
  const seen = new Set<string>();
  const spellings = words
    .map((w: string) => w?.toLowerCase?.()?.trim())
    .filter((w: string) => {
      if (!w || seen.has(w)) return false;
      seen.add(w);
      return true;
    });

  return { title, spellings };
}

// --- 호출 #2: 뜻 생성 (원본 텍스트 포함, 배치) ---

const MEANINGS_PROMPT = `You are a dictionary assistant for a Korean English learner.

[Original Text]
The student is studying the following passage:
"""
{TEXT}
"""

[Task]
For each word below, provide up to 3 Korean definitions. Each meaning is a separate object.

Priority order for selecting meanings:
1. The meaning actually used in the passage above (most important)
2. Other commonly used meanings
3. Same spelling but different part of speech (e.g. doubt: verb "의심하다" + noun "의심")

[Rules]
- Maximum 3 meanings per word
- Each meaning must be a separate object (never combine with comma)
- definition: English explanation
- meaning: Korean translation — the primary goal is to make it easy to memorize. Keep it short, intuitive, and natural. Refer to the English definition for accuracy but prioritize memorability over precision.
- partOfSpeech: noun, verb, adj, adv, phrase, prep, conj, pron, det, interj, idiom, other

Words: {WORDS}

Return JSON only:
{
  "words": [
    {
      "spelling": "word",
      "meanings": [
        { "definition": "English definition", "meaning": "한국어 뜻", "partOfSpeech": "pos" }
      ]
    }
  ]
}`;

async function fetchMeaningsBatch(
  originalText: string,
  wordsBatch: string[],
): Promise<ExtractedWord[]> {
  const prompt = MEANINGS_PROMPT
    .replace('{TEXT}', originalText)
    .replace('{WORDS}', wordsBatch.join(', '));

  const userContent = [{ type: 'text', text: 'Generate definitions for the words listed in the system prompt.' }];
  const result = await callClaude('claude-haiku-4-5-20251001', prompt, userContent);

  return Array.isArray(result.words) ? result.words : [];
}

// 50개 이상이면 반으로 나눠 병렬 호출한다.
export async function generateMeanings(
  originalText: string,
  spellings: string[],
): Promise<ExtractedWord[]> {
  if (spellings.length <= 50) {
    return fetchMeaningsBatch(originalText, spellings);
  }

  // 반으로 나눠 병렬 호출
  const mid = Math.ceil(spellings.length / 2);
  const [batch1, batch2] = await Promise.all([
    fetchMeaningsBatch(originalText, spellings.slice(0, mid)),
    fetchMeaningsBatch(originalText, spellings.slice(mid)),
  ]);

  return [...batch1, ...batch2];
}
