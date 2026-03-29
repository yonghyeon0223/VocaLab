import nodemailer from 'nodemailer';
import { ENV } from './env';

// Transporter는 한 번만 생성하고 재사용한다.
// 매 발송마다 새로 만들면 SMTP 연결 비용이 발생한다.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
});

// 이메일 인증 코드를 발송한다.
// 제목에 코드를 포함해 미리보기에서도 바로 확인할 수 있게 한다.
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"VocaLab" <${ENV.EMAIL_USER}>`,
    to,
    subject: `[VocaLab] 이메일 인증 코드: ${code}`,
    text: [
      '안녕하세요, VocaLab입니다.',
      '아래 6자리 코드를 입력해 이메일 인증을 완료해주세요.',
      '',
      `  ${code}`,
      '',
      '이 코드는 10분 후 만료됩니다.',
      '본인이 요청하지 않은 경우 이 이메일을 무시해주세요.',
    ].join('\n'),
  });
}
