import { TestSentence } from '../../../shared/types';
import api from './api';

// 특정 레벨의 예문 3개를 서버에서 가져온다.
async function fetchByLevel(level: number): Promise<TestSentence[]> {
  const res = await api.get(`/api/sentences/test?level=${level}`);
  return res.data.data as TestSentence[];
}

// lv.1~10 전체 예문을 병렬로 한 번에 가져온다.
// 화면 3 진입 시 한 번만 호출하고, 이후 레벨 이동 시 추가 요청 없음.
export async function fetchAllTestSentences(): Promise<{ [level: number]: TestSentence[] }> {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const results = await Promise.all(levels.map(fetchByLevel));
  return Object.fromEntries(levels.map((level, i) => [level, results[i]]));
}
