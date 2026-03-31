import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { sendVerification, verifyEmail } from '../services/authService';
import { useSignupStore } from '../stores/signupStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyEmail'>;
};

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen({ navigation }: Props) {
  const email = useSignupStore((s) => s.email);
  const password = useSignupStore((s) => s.password);
  const clearSignupData = useSignupStore((s) => s.clearSignupData);

  const [codes, setCodes] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 재발송 쿨다운: 처음 이 화면에 도착했을 때는 이미 코드가 발송된 상태이므로 바로 카운트를 시작한다.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(RNTextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    startCooldown();
    // 화면이 언마운트될 때 타이머를 정리한다.
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startCooldown() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // 한 칸에 숫자 한 자리만 입력받는다.
  // 숫자가 입력되면 다음 칸으로 자동 이동한다.
  function handleCodeChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...codes];
    next[index] = digit;
    setCodes(next);
    setError('');

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // 백스페이스를 누르면 현재 칸이 비어있을 때 이전 칸으로 이동한다.
  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = codes.join('');
    if (code.length < CODE_LENGTH) {
      setError('인증 코드 6자리를 모두 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // verifyEmail 성공 시 authStore에 토큰이 저장되어 RootNavigator가 Main으로 전환한다.
      await verifyEmail(email, password, code);
      clearSignupData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '인증에 실패했습니다';
      setError(message);
      setCodes(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    try {
      await sendVerification(email);
      startCooldown();
      setError('');
      setCodes(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      setError('코드 재발송에 실패했습니다. 잠시 후 다시 시도해주세요');
    }
  }

  // 이전 화면으로 돌아갈 때 signupStore를 비워 민감 정보가 남지 않게 한다.
  function handleBack() {
    clearSignupData();
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Logo size="medium" />

        <View style={styles.header}>
          <Text style={styles.title}>이메일 인증</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.emailText}>{email}</Text>
            {'\n'}으로 발송된 6자리 코드를 입력해주세요.
          </Text>
        </View>

        <View style={styles.codeRow}>
          {codes.map((digit, i) => (
            <RNTextInput
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={colors.accent}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={loading ? '확인 중...' : '인증 완료'}
          onPress={handleVerify}
          disabled={loading}
        />

        {/* 쿨다운 중에는 안내 문구만, 가능할 때는 버튼 형태로 표시한다 */}
        {cooldown > 0 ? (
          <Text style={styles.resendHint}>코드가 오지 않았나요? {cooldown}초 후 재발송할 수 있어요</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} style={styles.resendButton} activeOpacity={0.7}>
            <Text style={styles.resendButtonText}>코드 재발송</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>← 이전으로</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: colors.accent,
    fontWeight: '500',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  codeBox: {
    width: 44,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
  },
  codeBoxFilled: {
    borderColor: colors.accent,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  resendHint: {
    fontSize: 14,
    color: colors.text.disabled,
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.accent + '18',
  },
  resendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
  },
  back: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});
