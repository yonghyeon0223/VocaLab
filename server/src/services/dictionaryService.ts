// Free Dictionary API에서 영영 뜻과 품사를 가져온다.
// https://dictionaryapi.dev/

type DictionaryMeaning = {
  definition: string;
  partOfSpeech: string;
};

type DictionaryResult = {
  spelling: string;
  meanings: DictionaryMeaning[];
};

// 단어 하나의 영영 뜻을 조회한다.
async function lookupWord(word: string): Promise<DictionaryMeaning[]> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return [];

    const data = await res.json() as Array<{
      meanings?: Array<{
        partOfSpeech?: string;
        definitions?: Array<{ definition?: string }>;
      }>;
    }>;

    const meanings: DictionaryMeaning[] = [];
    for (const entry of data) {
      for (const m of entry.meanings ?? []) {
        const pos = m.partOfSpeech ?? 'noun';
        for (const def of m.definitions ?? []) {
          if (def.definition) {
            meanings.push({ definition: def.definition, partOfSpeech: pos });
          }
        }
      }
    }
    return meanings;
  } catch {
    return [];
  }
}

// 여러 단어를 조회한다. rate limit 방지를 위해 동시 5개씩 배치로 처리한다.
export async function lookupWords(words: string[]): Promise<DictionaryResult[]> {
  const BATCH_SIZE = 5;
  const results: DictionaryResult[] = [];

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (spelling) => {
        const meanings = await lookupWord(spelling);
        return { spelling, meanings };
      }),
    );
    results.push(...batchResults);
  }

  return results;
}
