import { useState } from 'react';
import {
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
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetWordCount'>;
  route: RouteProp<MainStackParamList, 'WordSetWordCount'>;
};

export default function WordSetWordCountScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const params = route.params;
  const [wordCountText, setWordCountText] = useState('20');

  const parsed = parseInt(wordCountText, 10);
  const wordCount = isNaN(parsed) ? 0 : parsed;
  const isValidCount = wordCount >= 1 && wordCount <= 100;

  function handleNext() {
    if (!isValidCount) return;
    // 추출 전용 로딩 화면으로 이동
    navigation.navigate('WordSetExtracting', { ...params, wordCount });
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
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="핵심 단어 찾기" onPress={handleNext} disabled={!isValidCount} />
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
