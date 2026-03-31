import { ObjectId } from 'mongodb';
import * as wordSetRepository from '../repositories/wordSetRepository';
import * as wordRepository from '../repositories/wordRepository';
import { AppError } from '../utils/AppError';

// 단어 세트를 생성하고 단어를 일괄 삽입한다.
// words는 이미 trim/소문자/중복제거가 완료된 상태로 들어온다.
export async function createWordSet(userId: string, name: string, words: string[]) {
  const userOid = new ObjectId(userId);

  // 1. 단어를 소문자 정규화하고 중복을 제거한다.
  const normalized = [...new Set(words.map((w) => w.trim().toLowerCase()))].filter(Boolean);

  if (normalized.length < 5) {
    throw new AppError('INVALID_WORD_COUNT', 400, '최소 5개의 단어가 필요해요');
  }
  if (normalized.length > 200) {
    throw new AppError('INVALID_WORD_COUNT', 400, '최대 200개까지 입력할 수 있어요');
  }

  // 2. 세트를 먼저 만든다.
  const wordSet = await wordSetRepository.insertWordSet({
    userId: userOid,
    name,
    wordCount: normalized.length,
  });

  // 3. 단어를 일괄 삽입한다.
  await wordRepository.insertMany({
    wordSetId: wordSet._id,
    userId: userOid,
    spellings: normalized,
  });

  return wordSet;
}

// 유저의 모든 세트를 최신순으로 가져온다.
export async function getWordSets(userId: string) {
  return wordSetRepository.findByUserId(new ObjectId(userId));
}

// 세트 상세 조회: 세트 정보 + 소속 단어 목록.
export async function getWordSetDetail(userId: string, setId: string) {
  const userOid = new ObjectId(userId);
  const setOid = new ObjectId(setId);

  const wordSet = await wordSetRepository.findByIdAndUserId(setOid, userOid);
  if (!wordSet) {
    throw new AppError('WORD_SET_NOT_FOUND', 404, '단어 세트를 찾을 수 없습니다');
  }

  const words = await wordRepository.findByWordSetId(setOid);
  return { wordSet, words };
}

// 세트 삭제: 소속 단어를 먼저 삭제한 뒤 세트를 삭제한다.
export async function deleteWordSet(userId: string, setId: string) {
  const userOid = new ObjectId(userId);
  const setOid = new ObjectId(setId);

  const wordSet = await wordSetRepository.findByIdAndUserId(setOid, userOid);
  if (!wordSet) {
    throw new AppError('WORD_SET_NOT_FOUND', 404, '단어 세트를 찾을 수 없습니다');
  }

  await wordRepository.deleteByWordSetId(setOid);
  await wordSetRepository.deleteById(setOid);
}
