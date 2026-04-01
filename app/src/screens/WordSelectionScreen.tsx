import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSelection'>;
  route: RouteProp<MainStackParamList, 'WordSelection'>;
};

type MeaningEntry = { meaning: string; partOfSpeech: string };
type ExtractedWord = { spelling: string; meanings: MeaningEntry[] };

const MAX_WORDS = 1000;

export default function WordSelectionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { words, source } = route.params;

  // 선택 상태: spelling -> meaning index -> boolean (기본 전체 선택)
  const [selected, setSelected] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    for (const w of words) {
      init[w.spelling] = w.meanings.map(() => true);
    }
    return init;
  });

  // 선택된 총 뜻 수
  const selectedCount = Object.values(selected).reduce(
    (sum, arr) => sum + arr.filter(Boolean).length, 0,
  );

  function toggleMeaning(spelling: string, index: number) {
    setSelected((prev) => {
      const arr = [...prev[spelling]];
      const totalMeanings = words.find((w) => w.spelling === spelling)!.meanings.length;

      // 뜻이 1개뿐이면 단어 전체 토글
      if (totalMeanings === 1) {
        arr[0] = !arr[0];
        return { ...prev, [spelling]: arr };
      }

      // 마지막 1개 선택 상태에서 해제 시도 → 단어 전체 해제
      const currentSelected = arr.filter(Boolean).length;
      if (arr[index] && currentSelected <= 1) {
        return { ...prev, [spelling]: arr.map(() => false) };
      }

      arr[index] = !arr[index];
      return { ...prev, [spelling]: arr };
    });
  }

  // 단어 전체 토글 (헤더 탭)
  function toggleWord(spelling: string) {
    setSelected((prev) => {
      const arr = prev[spelling];
      const allSelected = arr.some(Boolean);
      return { ...prev, [spelling]: arr.map(() => !allSelected) };
    });
  }

  function selectAll() {
    setSelected((prev) => {
      const next = { ...prev };
      for (const w of words) {
        next[w.spelling] = w.meanings.map(() => true);
      }
      return next;
    });
  }

  function deselectAll() {
    setSelected((prev) => {
      const next = { ...prev };
      for (const w of words) {
        next[w.spelling] = w.meanings.map(() => false);
      }
      return next;
    });
  }

  function handleNext() {
    // 선택된 뜻만 모아 Word 배열을 구성한다
    const selectedWords: Array<{ spelling: string; meaning: string; partOfSpeech: string }> = [];
    for (const w of words) {
      const flags = selected[w.spelling];
      for (let i = 0; i < w.meanings.length; i++) {
        if (flags[i]) {
          selectedWords.push({
            spelling: w.spelling,
            meaning: w.meanings[i].meaning,
            partOfSpeech: w.meanings[i].partOfSpeech,
          });
        }
      }
    }
    if (selectedWords.length < 1) return;
    navigation.navigate('WordSetName', { source, words: selectedWords });
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

        {/* 전체 선택/해제 */}
        <View style={styles.bulkRow}>
          <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
            <Text style={styles.bulkText}>전체 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deselectAll} activeOpacity={0.7}>
            <Text style={styles.bulkText}>전체 해제</Text>
          </TouchableOpacity>
        </View>

        {/* 단어 목록 */}
        {words.map((w) => {
          const flags = selected[w.spelling];
          const isWordSelected = flags.some(Boolean);
          const isMulti = w.meanings.length > 1;

          return (
            <View key={w.spelling} style={styles.wordCard}>
              {/* 단어 헤더 */}
              <TouchableOpacity
                style={styles.wordHeader}
                onPress={() => toggleWord(w.spelling)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isWordSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isWordSelected ? colors.accent : colors.text.disabled}
                />
                <Text style={[styles.wordSpelling, isWordSelected && styles.wordSpellingActive]}>
                  {w.spelling}
                </Text>
              </TouchableOpacity>

              {/* 뜻 목록 */}
              {w.meanings.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.meaningRow}
                  onPress={() => toggleMeaning(w.spelling, i)}
                  activeOpacity={0.7}
                >
                  {isMulti && (
                    <Ionicons
                      name={flags[i] ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={flags[i] ? colors.accent : colors.text.disabled}
                    />
                  )}
                  <Text style={[styles.meaningText, !flags[i] && styles.meaningTextOff]}>
                    {m.meaning}
                  </Text>
                  <Text style={styles.posTag}>{m.partOfSpeech}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* 하단 */}
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
