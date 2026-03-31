import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { createWordSet } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetWords'>;
  route: RouteProp<MainStackParamList, 'WordSetWords'>;
};

const MIN_WORDS = 5;
const MAX_WORDS = 200;

// 입력값을 줄바꿈 또는 쉼표로 분리하고, trim + 소문자 + 중복 제거한다.
function parseWords(input: string): string[] {
  const raw = input.split(/[\n,]/).map((w) => w.trim().toLowerCase()).filter(Boolean);
  return [...new Set(raw)];
}

export default function WordSetWordsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { name } = route.params;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const words = parseWords(input);
  const count = words.length;

  const isTooFew = count > 0 && count < MIN_WORDS;
  const isTooMany = count > MAX_WORDS;
  const isValid = count >= MIN_WORDS && count <= MAX_WORDS;

  // 서버(wordSetValidator)와 동일한 규칙을 UI에서 먼저 검증한다.
  function getHint(): string {
    if (isTooFew) return `최소 ${MIN_WORDS}개의 단어가 필요해요`;
    if (isTooMany) return `최대 ${MAX_WORDS}개까지 입력할 수 있어요`;
    return '';
  }

  async function handleSave() {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await createWordSet(name, words);
      // 홈 화면으로 돌아간다. 세트 목록은 store에 이미 반영되어 있다.
      navigation.popToTop();
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
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
          <Text style={styles.title}>단어를 입력하세요</Text>
          <Text style={styles.subtitle}>줄바꿈 또는 쉼표로 구분해 주세요. ({MIN_WORDS}~{MAX_WORDS}개)</Text>
        </View>

        <RNTextInput
          style={styles.textArea}
          value={input}
          onChangeText={setInput}
          placeholder={'apple\nbanana\ncherry\n...'}
          placeholderTextColor={colors.text.disabled}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.infoRow}>
          <Text style={[styles.counter, isTooMany && styles.counterError]}>
            {count}개 입력됨
          </Text>
          {getHint() ? <Text style={styles.hint}>{getHint()}</Text> : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label={loading ? '저장 중...' : '저장'}
          onPress={handleSave}
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  counterError: {
    color: colors.error,
  },
  hint: {
    fontSize: 14,
    color: colors.error,
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
});
