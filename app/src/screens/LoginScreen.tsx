import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import TextInput from '../components/ui/TextInput';
import PasswordInput from '../components/ui/PasswordInput';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { login } from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 서버에 로그인 요청을 보낸다.
  // 성공하면 authStore가 업데이트되어 RootNavigator가 자동으로 메인 화면으로 전환한다.
  async function handleLogin() {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '로그인에 실패했습니다';
      setError(message);
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
          <Text style={styles.title}>반가워요!</Text>
          <Text style={styles.subtitle}>오늘은 어떤 단어를 만나볼까요?</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="이메일"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordInput
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 입력"
          />

          {/* 에러 메시지는 폼 아래에 한 번에 표시한다 */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label={loading ? '로그인 중...' : '로그인'} onPress={handleLogin} disabled={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>
            계정이 없으신가요? <Text style={styles.linkAccent}>회원가입</Text>
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
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.secondary,
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
  link: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  linkAccent: {
    color: colors.accent,
    fontWeight: '500',
  },
});
