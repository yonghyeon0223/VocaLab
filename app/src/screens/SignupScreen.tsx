import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import TextInput from '../components/ui/TextInput';
import PasswordInput from '../components/ui/PasswordInput';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { register } from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; passwordConfirm?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // 클라이언트 검증 후 서버에 회원가입 요청을 보낸다.
  // 성공하면 로그인 화면으로 이동해 사용자가 직접 로그인하게 한다.
  async function handleSignup() {
    const next: typeof errors = {};

    if (!email) next.email = '이메일을 입력해주세요';
    if (!password) next.password = '비밀번호를 입력해주세요';
    if (password && passwordConfirm && password !== passwordConfirm) {
      next.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await register(email, password, passwordConfirm);
      navigation.navigate('Login');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '회원가입에 실패했습니다';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>과학적으로 설계된{'\n'}학습, 지금 시작해요</Text>
          <Text style={styles.subtitle}>인지과학 기반 단어 학습을 직접 경험해보세요.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="이메일"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordInput
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="영문 + 숫자 8자 이상"
            showStrength
          />
          <PasswordInput
            label="비밀번호 확인"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            error={errors.passwordConfirm}
            placeholder="비밀번호 다시 입력"
          />

          {errors.general ? <Text style={styles.error}>{errors.general}</Text> : null}

          <Button label={loading ? '처리 중...' : '계정 만들기'} onPress={handleSignup} disabled={loading} />

          <Text style={styles.terms}>
            계정을 만들면{' '}
            <Text style={styles.termsAccent}>이용약관</Text>
            {' '}및{' '}
            <Text style={styles.termsAccent}>개인정보처리방침</Text>
            에 동의하는 것으로 간주합니다.
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>
            이미 계정이 있으신가요? <Text style={styles.linkAccent}>로그인</Text>
          </Text>
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
    gap: 32,
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
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  terms: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  termsAccent: {
    color: colors.accent,
  },
  link: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  linkAccent: {
    color: colors.accent,
    fontWeight: '500',
  },
});
