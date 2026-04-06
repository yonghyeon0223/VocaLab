import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { POS_LABELS } from '../constants/pos';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import { Word } from '../../../shared/types';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordIntro'>;
  route: RouteProp<MainStackParamList, 'WordIntro'>;
};

type FilterKey = 'spelling' | 'meaning' | 'definition' | 'pos';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'spelling', label: '단어' },
  { key: 'meaning', label: '한국어 뜻' },
  { key: 'definition', label: '영문 뜻' },
  { key: 'pos', label: '품사' },
];

export default function WordIntroScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { words } = route.params;

  // 기본: 단어 + 한국어 뜻
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    spelling: true,
    meaning: true,
    definition: false,
    pos: false,
  });

  function toggleFilter(key: FilterKey) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const anyVisible = Object.values(filters).some(Boolean);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>단어 소개</Text>
          <Text style={styles.headerCount}>{words.length}개 단어</Text>
        </View>
      </View>

      {/* 필터 토글 */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterChip, filters[opt.key] && styles.filterChipActive]}
            onPress={() => toggleFilter(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filters[opt.key] && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 단어 목록 */}
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {!anyVisible ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>표시할 항목을 선택해주세요</Text>
          </View>
        ) : (
          words.map((word, idx) => (
            <View key={`${word.spelling}-${idx}`} style={styles.wordCard}>
              {/* 번호 */}
              <Text style={styles.wordIndex}>{idx + 1}</Text>

              <View style={styles.wordContent}>
                {/* 영단어 */}
                {filters.spelling && (
                  <Text style={styles.spelling}>{word.spelling}</Text>
                )}

                {/* 뜻 목록 */}
                {word.meanings.map((m, i) => (
                  <View key={i} style={styles.meaningRow}>
                    {filters.pos && (
                      <Text style={styles.posTag}>{POS_LABELS[m.partOfSpeech] ?? m.partOfSpeech}</Text>
                    )}
                    {filters.meaning && (
                      <Text style={styles.meaning}>{m.meaning}</Text>
                    )}
                    {filters.definition && (
                      <Text style={styles.definition}>{m.definition}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  filterChipActive: {
    backgroundColor: colors.accent + '22',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.disabled,
  },
  filterTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.disabled,
  },
  wordCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  wordIndex: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.disabled,
    minWidth: 24,
    paddingTop: 2,
  },
  wordContent: {
    flex: 1,
    gap: 4,
  },
  spelling: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  meaningRow: {
    gap: 2,
  },
  posTag: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  meaning: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  definition: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
