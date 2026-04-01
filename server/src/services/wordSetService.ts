import { ObjectId } from 'mongodb';
import * as wordSetRepository from '../repositories/wordSetRepository';
import * as aiService from './aiService';
import * as userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';

type WordInput = {
  spelling: string;
  meaning: string;
  partOfSpeech: string;
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

// 유저의 모든 세트를 최신순으로 가져온다 (words 미포함).
export async function getWordSets(userId: string) {
  return wordSetRepository.findByUserId(new ObjectId(userId));
}

// 세트 상세 조회 (words 포함).
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

// 세트 삭제. embed 구조이므로 문서 하나만 삭제하면 된다.
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

// AI 단어 추출. 유저 레벨 정보를 서버에서 조회해 프롬프트에 주입한다.
export async function extractWords(
  userId: string,
  input: { type: 'text'; text: string } | { type: 'photo'; images: string[] },
) {
  const user = await userRepository.findById(new ObjectId(userId));
  if (!user) throw new AppError('USER_NOT_FOUND', 404, '유저를 찾을 수 없습니다');

  const easyLevel = (user.easyLevel as number) ?? 1;
  const activeLevel = (user.activeLevel as number) ?? 5;
  const hardLevel = (user.hardLevel as number) ?? 10;

  return aiService.extractWords(input, easyLevel, activeLevel, hardLevel);
}
