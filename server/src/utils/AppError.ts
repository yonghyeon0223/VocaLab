// 비즈니스 로직에서 발생하는 에러를 일관된 형태로 던지기 위한 클래스.
// HTTP 상태 코드와 메시지를 함께 담아 컨트롤러에서 그대로 응답할 수 있다.
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
