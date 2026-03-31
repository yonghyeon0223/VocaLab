export const colors = {
  background: {
    primary: '#0f0f0f',    // 메인 배경
    secondary: '#1a1a1a',  // 입력창, 카드 배경
    tertiary: '#2a2a2a',   // 구분선, 비활성
  },
  text: {
    primary: '#f5f5f5',    // 주요 텍스트
    secondary: '#888888',  // 보조 텍스트
    disabled: '#666666',   // placeholder
  },
  border: {
    default: '#2e2e2e',    // 기본 테두리
    focused: '#6c63ff',    // 포커스 상태
  },
  accent: '#6c63ff',       // 포인트 컬러 (버튼, 링크, 강조)
  error: '#e24b4a',        // 에러 상태
} as const;
