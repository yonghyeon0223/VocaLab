import { ObjectId } from 'mongodb';
import * as wordSetRepository from '../repositories/wordSetRepository';
import * as aiService from './aiService';
import * as dictionaryService from './dictionaryService';
import * as userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';

type WordInput = {
  spelling: string;
  meanings: Array<{
    definition: string;
    meaning: string;
    partOfSpeech: string;
  }>;
};

// 단어 세트를 생성한다. words 배열을 문서에 내장한다.
export async function createWordSet(
  userId: string,
  name: string,
  source: 'manual' | 'photo',
  words: WordInput[],
) {
  if (words.length < 1) {
    throw new AppError('INVALID_WORD_COUNT', 400, '최소 1개의 단어가 필요합니다');
  }
  if (words.length > 1000) {
    throw new AppError('INVALID_WORD_COUNT', 400, '최대 1,000개까지 가능합니다');
  }

  return wordSetRepository.insertWordSet({
    userId: new ObjectId(userId),
    name,
    source,
    words,
  });
}

export async function getWordSets(userId: string) {
  return wordSetRepository.findByUserId(new ObjectId(userId));
}

export async function getWordSetDetail(userId: string, setId: string) {
  const wordSet = await wordSetRepository.findByIdAndUserId(
    new ObjectId(setId),
    new ObjectId(userId),
  );
  if (!wordSet) {
    throw new AppError('WORD_SET_NOT_FOUND', 404, '단어 세트를 찾을 수 없습니다');
  }
  return wordSet;
}

export async function deleteWordSet(userId: string, setId: string) {
  const wordSet = await wordSetRepository.findByIdAndUserId(
    new ObjectId(setId),
    new ObjectId(userId),
  );
  if (!wordSet) {
    throw new AppError('WORD_SET_NOT_FOUND', 404, '단어 세트를 찾을 수 없습니다');
  }
  await wordSetRepository.deleteById(new ObjectId(setId));
}

// AI 단어 추출 → Free Dictionary 영영 뜻 → AI 한국어 번역
export async function extractWords(
  userId: string,
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
) {
  const user = await userRepository.findById(new ObjectId(userId));
  if (!user) throw new AppError('USER_NOT_FOUND', 404, '유저를 찾을 수 없습니다');

  const activeLevel = (user.activeLevel as number) ?? 5;

  // 1단계: AI가 spelling만 추출
  const spellings = await aiService.extractSpellings(input, activeLevel);
  if (spellings.length === 0) {
    return { words: [] };
  }

  // 2단계: Free Dictionary API로 영영 뜻 조회
  const dictionaryResults = await dictionaryService.lookupWords(spellings);

  // 3단계: AI가 영영 뜻을 한국어로 번역
  const translated = await aiService.translateMeanings(dictionaryResults);

  return { words: translated };
}
