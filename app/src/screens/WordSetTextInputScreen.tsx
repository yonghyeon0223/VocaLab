import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { extractWords } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetTextInput'>;
};

const MAX_CHARS = 50000;

export default function WordSetTextInputScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmed = text.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_CHARS;

  async function handleExtract() {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      const result = await extractWords({ type: 'text', text: trimmed });
      if (result.words.length < 1) {
        setError('추출할 수 있는 단어가 없어요. 다른 텍스트를 입력해보세요.');
        return;
      }
      navigation.navigate('WordSelection', { words: result.words, source: 'manual' });
    } catch {
      setError('단어 추출에 실패했어요. 다시 시도해주세요.');
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
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>텍스트를 입력하세요</Text>
          <Text style={styles.subtitle}>
            단어 리스트, 영어 가사, 교과서 지문 등을{'\n'}붙여넣거나 직접 입력하세요.
          </Text>
        </View>

        <RNTextInput
          style={styles.textArea}
          value={text}
          onChangeText={setText}
          placeholder={'apple, banana, cherry...\n또는 영어 텍스트를 자유롭게 입력하세요'}
          placeholderTextColor={colors.text.disabled}
          multiline
          textAlignVertical="top"
          maxLength={MAX_CHARS}
        />

        <Text style={styles.counter}>{trimmed.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}자</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>단어를 분석하고 있어요</Text>
          </View>
        ) : (
          <Button label="단어 추출하기" onPress={handleExtract} disabled={!isValid} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  body: {
    paddingHorizontal: 24,
    gap: 16,
    flexGrow: 1,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 17,
    color: colors.text.secondary,
    lineHeight: 25,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  counter: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  error: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
