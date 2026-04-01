import { ENV } from '../utils/env';
import { LEVEL_LABELS } from './levelLabels';

// --- 타입 ---

type ExtractedWord = {
  spelling: string;
  meanings: Array<{ meaning: string; partOfSpeech: string }>;
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

  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('Claude 응답에서 JSON을 파싱할 수 없습니다');

  return JSON.parse(jsonMatch[1]);
}

// --- 프롬프트 생성 ---

function buildSystemPrompt(easyLevel: number, activeLevel: number, hardLevel: number) {
  return `너는 한국인 영어 학습자를 위한 단어 추출기야.
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
- 쉬움 구간: lv.${easyLevel} (${LEVEL_LABELS[easyLevel]})
- 학습 구간: lv.${activeLevel} (${LEVEL_LABELS[activeLevel]})
- 심화 구간: lv.${hardLevel} (${LEVEL_LABELS[hardLevel]})

JSON만 반환 (설명 없이 JSON만):
{
  "words": [
    { "spelling": "단어", "meanings": [{ "meaning": "뜻", "partOfSpeech": "품사" }] },
    ...
  ]
}`;
}

// --- 공개 API ---

// 텍스트 또는 사진에서 영단어를 추출하고 뜻 + 품사를 한 번에 반환한다.
export async function extractWords(
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  easyLevel: number,
  activeLevel: number,
  hardLevel: number,
): Promise<{ words: ExtractedWord[] }> {
  const systemPrompt = buildSystemPrompt(easyLevel, activeLevel, hardLevel);

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

  const words: ExtractedWord[] = Array.isArray(result.words) ? result.words : [];

  return { words };
}
