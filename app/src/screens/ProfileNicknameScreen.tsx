import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';
import { updateProfile } from '../services/profileService';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileNickname'>;
};

const MAX_LENGTH = 10;

export default function ProfileNicknameScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmed = nickname.trim();

  // 유효성: 1자 이상, 공백만으로 구성 불가, 10자 이하
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_LENGTH;

  function handleChange(text: string) {
    setNickname(text);
    setError('');
  }

  async function handleNext() {
    if (!isValid) return;

    setLoading(true);
    try {
      await updateProfile({ nickname: trimmed });
      navigation.navigate('ProfileLevelIntro');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '저장에 실패했습니다. 다시 시도해주세요';
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>반가워요!{'\n'}뭐라고 부를까요?</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="닉네임"
            value={nickname}
            onChangeText={handleChange}
            error={error}
            placeholder="예: 민준"
            autoCapitalize="none"
            autoFocus
          />
          {/* 글자 수 카운터 */}
          <Text style={styles.counter}>
            {trimmed.length} / {MAX_LENGTH}
          </Text>
        </View>

        <Button
          label={loading ? '저장 중...' : '다음'}
          onPress={handleNext}
          disabled={!isValid || loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 64,
    justifyContent: 'space-between',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  form: {
    gap: 4,
  },
  counter: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});
