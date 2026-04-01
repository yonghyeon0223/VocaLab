import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readAsStringAsync } from 'expo-file-system/legacy';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { extractWords } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetWordCount'>;
  route: RouteProp<MainStackParamList, 'WordSetWordCount'>;
};

export default function WordSetWordCountScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const params = route.params;
  const [wordCountText, setWordCountText] = useState('20');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = parseInt(wordCountText, 10);
  const wordCount = isNaN(parsed) ? 0 : parsed;
  const isValidCount = wordCount >= 1 && wordCount <= 100;
  const source = params.type === 'text' ? 'manual' : 'photo';

  async function handleExtract() {
    setLoading(true);
    setError('');
    try {
      let input: { type: 'text'; text: string; wordCount: number } | { type: 'photo'; images: string[]; wordCount: number };

      if (params.type === 'text') {
        input = { type: 'text', text: params.text, wordCount };
      } else {
        // URI를 base64로 변환
        const images: string[] = [];
        for (const uri of params.photos) {
          const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
          images.push(base64);
        }
        input = { type: 'photo', images, wordCount };
      }

      const result = await extractWords(input);
      if (result.words.length < 1) {
        setError('추출할 수 있는 단어가 없어요. 다른 내용으로 시도해보세요.');
        return;
      }
      navigation.navigate('WordSelection', { words: result.words, source });
    } catch {
      setError('단어 찾기에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.body, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.title}>몇 개의 핵심 단어를{'\n'}골라볼까요?</Text>

        <View style={styles.inputRow}>
          <RNTextInput
            style={styles.wordCountInput}
            value={wordCountText}
            onChangeText={setWordCountText}
            keyboardType="number-pad"
            maxLength={3}
            textAlign="center"
            selectTextOnFocus
          />
          <Text style={styles.wordCountUnit}>개</Text>
        </View>

        {!isValidCount && wordCountText.length > 0 && (
          <Text style={styles.rangeHint}>1~100 사이의 숫자를 입력해주세요</Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>핵심 단어를 찾고 있어요</Text>
          </View>
        ) : (
          <Button label="핵심 단어 찾기" onPress={handleExtract} disabled={!isValidCount} />
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
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  wordCountInput: {
    width: 80,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.accent,
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  wordCountUnit: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  rangeHint: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
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
