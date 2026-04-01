import { useState } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import { Word } from '../../../shared/types';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetManualEntry'>;
};

type DraftWord = {
  spelling: string;
  meaning: string;
  partOfSpeech: string;
};

const POS_OPTIONS = ['noun', 'verb', 'adj', 'adv', 'phrase'] as const;

export default function WordSetManualEntryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState<DraftWord[]>([{ spelling: '', meaning: '', partOfSpeech: 'noun' }]);

  function updateWord(index: number, field: keyof DraftWord, value: string) {
    setWords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addWord() {
    if (words.length >= 100) return;
    setWords((prev) => [...prev, { spelling: '', meaning: '', partOfSpeech: 'noun' }]);
  }

  function removeWord(index: number) {
    if (words.length <= 1) return;
    setWords((prev) => prev.filter((_, i) => i !== index));
  }

  function handleNext() {
    // 유효한 단어만 필터
    const valid = words.filter((w) => w.spelling.trim() && w.meaning.trim());
    if (valid.length < 1) return;

    // Word 구조로 변환 — 같은 spelling은 meanings를 합침
    const wordMap = new Map<string, Word>();
    for (const w of valid) {
      const spelling = w.spelling.trim().toLowerCase();
      const existing = wordMap.get(spelling);
      const meaningObj = {
        definition: '',
        meaning: w.meaning.trim(),
        partOfSpeech: w.partOfSpeech,
      };
      if (existing) {
        existing.meanings.push(meaningObj);
      } else {
        wordMap.set(spelling, { spelling, meanings: [meaningObj] });
      }
    }

    navigation.navigate('WordSetName', {
      source: 'manual',
      words: Array.from(wordMap.values()),
    });
  }

  const validCount = words.filter((w) => w.spelling.trim() && w.meaning.trim()).length;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>단어를 직접 입력하세요</Text>
        <Text style={styles.subtitle}>단어, 뜻, 품사를 하나씩 추가해요</Text>

        {words.map((w, i) => (
          <View key={i} style={styles.wordCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIndex}>{i + 1}</Text>
              {words.length > 1 && (
                <TouchableOpacity onPress={() => removeWord(i)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={22} color={colors.text.disabled} />
                </TouchableOpacity>
              )}
            </View>

            <RNTextInput
              style={styles.input}
              value={w.spelling}
              onChangeText={(v) => updateWord(i, 'spelling', v)}
              placeholder="영단어 또는 표현"
              placeholderTextColor={colors.text.disabled}
              autoCapitalize="none"
            />

            <RNTextInput
              style={styles.input}
              value={w.meaning}
              onChangeText={(v) => updateWord(i, 'meaning', v)}
              placeholder="한국어 뜻"
              placeholderTextColor={colors.text.disabled}
            />

            <View style={styles.posRow}>
              {POS_OPTIONS.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.posChip, w.partOfSpeech === pos && styles.posChipActive]}
                  onPress={() => updateWord(i, 'partOfSpeech', pos)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.posText, w.partOfSpeech === pos && styles.posTextActive]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addWord} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
          <Text style={styles.addButtonText}>단어 추가</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.countText}>{validCount}개 단어 입력됨</Text>
        <Button
          label="다음"
          onPress={handleNext}
          disabled={validCount < 1}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  wordCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.disabled,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text.primary,
  },
  posRow: {
    flexDirection: 'row',
    gap: 6,
  },
  posChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  posChipActive: {
    backgroundColor: colors.accent + '22',
  },
  posText: {
    fontSize: 14,
    color: colors.text.disabled,
    fontWeight: '500',
  },
  posTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: 6,
  },
  countText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
