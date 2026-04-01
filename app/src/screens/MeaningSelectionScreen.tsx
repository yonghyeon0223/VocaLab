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
  navigation: NativeStackNavigationProp<MainStackParamList, 'MeaningSelection'>;
  route: RouteProp<MainStackParamList, 'MeaningSelection'>;
};

type MeaningEntry = { meaning: string; partOfSpeech: string };

export default function MeaningSelectionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { meanings, source } = route.params;

  const words = Object.keys(meanings);

  // 선택 상태: word -> meaning index -> boolean (기본 전체 선택)
  const [selected, setSelected] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    for (const word of words) {
      init[word] = meanings[word].map(() => true);
    }
    return init;
  });

  function toggleMeaning(word: string, index: number) {
    setSelected((prev) => {
      const arr = [...prev[word]];
      const entries = meanings[word];

      // 뜻이 1개뿐이면 해제 불가
      if (entries.length === 1) return prev;

      // 마지막 1개 선택 상태에서 해제 시도하면 무시
      const selectedCount = arr.filter(Boolean).length;
      if (arr[index] && selectedCount <= 1) return prev;

      arr[index] = !arr[index];
      return { ...prev, [word]: arr };
    });
  }

  function handleNext() {
    // 선택된 뜻만 모아 Word 배열을 구성한다
    const wordsPayload: Array<{ spelling: string; meaning: string; partOfSpeech: string }> = [];

    for (const word of words) {
      const entries = meanings[word];
      const flags = selected[word];
      for (let i = 0; i < entries.length; i++) {
        if (flags[i]) {
          wordsPayload.push({
            spelling: word,
            meaning: entries[i].meaning,
            partOfSpeech: entries[i].partOfSpeech,
          });
        }
      }
    }

    navigation.navigate('WordSetName', { source, words: wordsPayload });
  }

  // 다의어만 따로 모으고, 단의어는 간략하게 표시
  const polysemousWords = words.filter((w) => meanings[w].length > 1);
  const monosemousWords = words.filter((w) => meanings[w].length === 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>학습할 뜻을 선택하세요</Text>
        <Text style={styles.subtitle}>
          뜻이 여러 개인 단어는 불필요한 뜻을 해제할 수 있어요
        </Text>

        {/* 다의어 섹션 */}
        {polysemousWords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>다의어 ({polysemousWords.length}개)</Text>
            {polysemousWords.map((word) => (
              <View key={word} style={styles.wordCard}>
                <Text style={styles.wordSpelling}>
                  {word} <Text style={styles.meaningCount}>({meanings[word].length}개의 뜻)</Text>
                </Text>
                {meanings[word].map((entry: MeaningEntry, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.meaningRow}
                    onPress={() => toggleMeaning(word, i)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selected[word][i] ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={selected[word][i] ? colors.accent : colors.text.disabled}
                    />
                    <Text style={[styles.meaningText, !selected[word][i] && styles.meaningTextOff]}>
                      {entry.meaning}
                    </Text>
                    <Text style={styles.posTag}>{entry.partOfSpeech}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* 단의어 섹션 */}
        {monosemousWords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>단의어 ({monosemousWords.length}개)</Text>
            {monosemousWords.map((word) => {
              const entry = meanings[word][0];
              return (
                <View key={word} style={styles.monoRow}>
                  <Text style={styles.monoSpelling}>{word}</Text>
                  <Text style={styles.monoMeaning}>{entry.meaning}</Text>
                  <Text style={styles.posTag}>{entry.partOfSpeech}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="다음" onPress={handleNext} />
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
    gap: 20,
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
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  wordCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  wordSpelling: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  meaningCount: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  meaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
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
  monoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  monoSpelling: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    width: 110,
  },
  monoMeaning: {
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
