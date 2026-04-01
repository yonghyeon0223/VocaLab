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

// 여러 단어를 병렬로 조회한다. 사전에 없는 단어는 빈 배열로 반환한다.
export async function lookupWords(words: string[]): Promise<DictionaryResult[]> {
  const results = await Promise.all(
    words.map(async (spelling) => {
      const meanings = await lookupWord(spelling);
      return { spelling, meanings };
    }),
  );
  return results;
}
