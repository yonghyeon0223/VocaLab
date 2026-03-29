import { randomInt } from 'crypto';

// 6자리 랜덤 숫자 코드를 생성한다.
// Math.random은 암호학적으로 안전하지 않으므로 Node.js crypto 모듈을 사용한다.
// randomInt(min, max)는 min 이상 max 미만의 정수를 반환한다.
export function generateVerificationCode(): string {
  const code = randomInt(0, 1_000_000);
  // 앞자리가 0인 경우도 6자리로 맞춘다 (예: 000123)
  return code.toString().padStart(6, '0');
}
