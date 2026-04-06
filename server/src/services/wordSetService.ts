import { ObjectId } from 'mongodb';
import * as wordSetRepository from '../repositories/wordSetRepository';
import * as aiService from './aiService';
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

export async function createWordSet(
  userId: string,
  name: string,
  source: 'manual' | 'photo',
  words: WordInput[],
) {
  if (words.length < 1) {
    throw new AppError('INVALID_WORD_COUNT', 400, '최소 1개의 단어가 필요합니다');
  }
  if (words.length > 100) {
    throw new AppError('INVALID_WORD_COUNT', 400, '최대 100개까지 가능합니다');
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

// 호출 #1: 단어 추출 (spelling만)
export async function extractSpellings(
  userId: string,
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
  wordCount: number,
) {
  const user = await userRepository.findById(new ObjectId(userId));
  if (!user) throw new AppError('USER_NOT_FOUND', 404, '유저를 찾을 수 없습니다');

  const activeLevel = (user.activeLevel as number) ?? 5;

  const spellings = await aiService.extractSpellings(input, activeLevel, wordCount);
  return { spellings };
}

// 호출 #2: 뜻 생성 (원본 텍스트 + spelling 목록)
export async function generateMeanings(
  originalText: string,
  spellings: string[],
) {
  const words = await aiService.generateMeanings(originalText, spellings);
  return { words };
}
