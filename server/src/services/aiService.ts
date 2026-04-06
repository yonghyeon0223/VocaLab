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
      max_tokens: 16384,
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

function buildPrompt(activeLevel: number, wordCount: number, purposes: string[]) {
  const purposeStr = purposes.length > 0
    ? `This student's learning goals: ${purposes.join(', ')}.`
    : '';

  return `You are a vocabulary extraction assistant for a Korean English learner.

[Task]
Extract exactly ${wordCount} high-priority English words/phrases from the user's input. Not more, not less.
Prioritize words that are most essential to understanding the passage or context.
If the input is simply a word list or lacks clear context, select the top ${wordCount} most valuable words you would recommend for a student aiming to achieve their learning goals.
If fewer than ${wordCount} extractable words exist, return however many you can — but never exceed ${wordCount}.

[Student Profile]
- English level: ${LEVEL_LABELS[activeLevel]} (based on Korean school curriculum)
${purposeStr}
- Extract words appropriate for this level — not too easy, not too difficult.
  Use your judgment based on the level description above.

[Extraction Rules]
- Extract phrases when the words are better memorized together (e.g. "break down", "look for", "at all")
- Normalize to lemma form (e.g. running→run, genes→gene, bigger→big)
- Exclude function words (articles, prepositions, pronouns, conjunctions, auxiliary verbs) unless part of a phrase
- Exclude very basic verbs (be, have, do, go, come, get, make, take, give, say, know, see, want, think, tell) unless they carry a special meaning or are part of a phrase
- Exclude proper nouns, deduplicate, lowercase
- If fewer than ${wordCount} extractable words exist, return however many you can find

[Definition Rules]
- For each word, provide 2-3 Korean definitions in the meanings array
- Each meaning must be a separate object with definition (English), meaning (Korean), and partOfSpeech
- Favor definitions that show different contexts or different parts of speech
  e.g. "doubt" → [{verb: "의심하다"}, {noun: "의심"}]
  e.g. "sense" → [{noun: "감각"}, {noun: "의미"}, {verb: "감지하다"}]
- partOfSpeech must be one of: noun, verb, adj, adv, phrase, prep, conj, pron, det, interj, idiom
- Korean meanings should closely mirror the nuance of the English definition, not over-simplified.
  e.g. "elaborate" → "정교한" is too vague. Better: "세부적으로 정성 들인" for "involving a lot of careful detail"
- Still keep it natural Korean that a student can understand

Return JSON only (no explanation):
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
}

export async function extractWords(
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  activeLevel: number,
  wordCount: number,
  purposes: string[],
): Promise<{ words: ExtractedWord[] }> {
  const systemPrompt = buildPrompt(activeLevel, wordCount, purposes);

  let userContent: unknown[];
  let model: string;

  if (input.type === 'text') {
    model = 'claude-haiku-4-5-20251001';
    userContent = [{ type: 'text', text: input.text }];
  } else {
    model = 'claude-haiku-4-5-20251001';
    userContent = input.images.map((img) => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: img },
    }));
    userContent.push({ type: 'text', text: '이 이미지에서 학습할 영단어를 추출해줘.' });
  }

  const result = await callClaude(model, systemPrompt, userContent);
  const raw: ExtractedWord[] = Array.isArray(result.words) ? result.words : [];

  // AI가 같은 spelling을 여러 번 반환할 수 있으므로 meanings를 병합한다.
  const merged = new Map<string, ExtractedWord>();
  for (const w of raw) {
    const key = w.spelling?.toLowerCase();
    if (!key) continue;
    const existing = merged.get(key);
    if (existing) {
      existing.meanings.push(...(w.meanings ?? []));
    } else {
      merged.set(key, { spelling: key, meanings: w.meanings ?? [] });
    }
  }

  return { words: Array.from(merged.values()) };
}
