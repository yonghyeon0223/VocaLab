import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import { Word } from '../../../shared/types';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSelection'>;
  route: RouteProp<MainStackParamList, 'WordSelection'>;
};

const MAX_WORDS = 1000;

export default function WordSelectionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { words, source } = route.params;

  // 단어 선택 상태 (spelling 기준)
  const [selectedWords, setSelectedWords] = useState<Set<string>>(
    () => new Set(words.map((w) => w.spelling)),
  );

  const selectedCount = selectedWords.size;

  function toggleWord(spelling: string) {
    setSelectedWords((prev) => {
      const next = new Set(prev);
      if (next.has(spelling)) {
        next.delete(spelling);
      } else if (next.size < MAX_WORDS) {
        next.add(spelling);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedWords(new Set(words.map((w) => w.spelling)));
  }

  function deselectAll() {
    setSelectedWords(new Set());
  }

  function handleNext() {
    const selected = words.filter((w) => selectedWords.has(w.spelling));
    if (selected.length < 1) return;
    navigation.navigate('WordSetName', { source, words: selected });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>학습할 단어를 선택하세요</Text>
        <Text style={styles.subtitle}>
          {words.length}개의 단어가 추출되었어요
        </Text>
        {selectedCount > 0 && selectedCount <= 30 && (
          <Text style={styles.hint}>20~30개가 학습에 적합해요</Text>
        )}

        <View style={styles.bulkRow}>
          <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
            <Text style={styles.bulkText}>전체 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deselectAll} activeOpacity={0.7}>
            <Text style={styles.bulkText}>전체 해제</Text>
          </TouchableOpacity>
        </View>

        {words.map((w) => {
          const isSelected = selectedWords.has(w.spelling);
          return (
            <TouchableOpacity
              key={w.spelling}
              style={styles.wordCard}
              onPress={() => toggleWord(w.spelling)}
              activeOpacity={0.7}
            >
              <View style={styles.wordHeader}>
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isSelected ? colors.accent : colors.text.disabled}
                />
                <Text style={[styles.wordSpelling, isSelected && styles.wordSpellingActive]}>
                  {w.spelling}
                </Text>
              </View>
              {w.meanings.map((m, i) => (
                <View key={i} style={styles.meaningRow}>
                  <Text style={[styles.meaningText, !isSelected && styles.meaningTextOff]}>
                    {m.meaning}
                  </Text>
                  <Text style={styles.posTag}>{m.partOfSpeech}</Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.selectedCount}>
          선택된 단어: <Text style={styles.selectedCountNum}>{selectedCount}개</Text>
        </Text>
        {selectedCount > MAX_WORDS && (
          <Text style={styles.errorSmall}>최대 {MAX_WORDS}개까지 선택 가능해요</Text>
        )}
        <Button
          label="다음"
          onPress={handleNext}
          disabled={selectedCount < 1 || selectedCount > MAX_WORDS}
        />
      </View>
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
  },
  hint: {
    fontSize: 14,
    color: colors.text.disabled,
  },
  bulkRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bulkText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  wordCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordSpelling: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  wordSpellingActive: {
    color: colors.text.primary,
  },
  meaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 30,
    paddingVertical: 2,
  },
  meaningText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  meaningTextOff: {
    color: colors.text.disabled,
  },
  posTag: {
    fontSize: 14,
    color: colors.text.disabled,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: 6,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  selectedCountNum: {
    fontWeight: '700',
    color: colors.accent,
  },
  errorSmall: {
    fontSize: 14,
    color: colors.error,
  },
});
