import { useState } from 'react';
import {
  Modal,
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
import { POS_OPTIONS, POS_LABELS } from '../constants/pos';
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

export default function WordSetManualEntryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState<DraftWord[]>([{ spelling: '', meaning: '', partOfSpeech: 'noun' }]);
  const [posPickerIndex, setPosPickerIndex] = useState<number | null>(null);

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

  // 현재 마지막 단어가 미완성이면 추가 불가
  const lastWord = words[words.length - 1];
  const lastComplete = !!(lastWord.spelling.trim() && lastWord.meaning.trim());
  const canAddMore = lastComplete && words.length < 100;

  function handleNext() {
    const valid = words.filter((w) => w.spelling.trim() && w.meaning.trim());
    if (valid.length < 1) return;

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
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
              autoCorrect={false}
              inputMode="text"
              textContentType="none"
            />

            <RNTextInput
              style={styles.input}
              value={w.meaning}
              onChangeText={(v) => updateWord(i, 'meaning', v)}
              placeholder="한국어 뜻"
              placeholderTextColor={colors.text.disabled}
            />

            {/* 품사 드롭다운 — 가운데 배치 */}
            <TouchableOpacity
              style={styles.posSelector}
              onPress={() => setPosPickerIndex(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.posSelectorText}>{POS_LABELS[w.partOfSpeech] ?? w.partOfSpeech}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        ))}

        {/* 단어 추가 버튼 */}
        <TouchableOpacity
          style={[styles.addButton, !canAddMore && styles.addButtonDisabled]}
          onPress={addWord}
          disabled={!canAddMore}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={20} color={canAddMore ? colors.accent : colors.text.disabled} />
          <Text style={[styles.addButtonText, !canAddMore && styles.addButtonTextDisabled]}>
            {!lastComplete ? '위 단어를 먼저 완성해주세요' : '단어 추가'}
          </Text>
        </TouchableOpacity>

        {/* 다음 버튼 — 스크롤 안에 자연스럽게 배치 */}
        <View style={styles.nextSection}>
          <Text style={styles.countText}>{validCount}개 단어 입력됨</Text>
          <Button label="다음" onPress={handleNext} disabled={validCount < 1} />
        </View>
      </ScrollView>

      {/* 품사 선택 모달 */}
      <Modal
        visible={posPickerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPosPickerIndex(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPosPickerIndex(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>품사 선택</Text>
            {POS_OPTIONS.map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.modalOption,
                  posPickerIndex !== null && words[posPickerIndex]?.partOfSpeech === pos && styles.modalOptionActive,
                ]}
                onPress={() => {
                  if (posPickerIndex !== null) {
                    updateWord(posPickerIndex, 'partOfSpeech', pos);
                    setPosPickerIndex(null);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.modalOptionText,
                  posPickerIndex !== null && words[posPickerIndex]?.partOfSpeech === pos && styles.modalOptionTextActive,
                ]}>
                  {POS_LABELS[pos]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  posSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.accent + '15',
  },
  posSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent,
  },
  addButtonTextDisabled: {
    color: colors.text.disabled,
  },
  nextSection: {
    gap: 8,
    marginTop: 8,
  },
  countText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  // --- 모달 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    width: 260,
    gap: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: colors.accent + '22',
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  modalOptionTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
