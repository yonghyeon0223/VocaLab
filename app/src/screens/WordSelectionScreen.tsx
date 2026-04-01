import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { extractMeanings } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSelection'>;
  route: RouteProp<MainStackParamList, 'WordSelection'>;
};

type CategoryKey = 'easy' | 'appropriate' | 'hard';

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; color: string; defaultSelected: boolean; defaultOpen: boolean }> = {
  easy: { label: '쉬움', color: '#4caf7d', defaultSelected: false, defaultOpen: false },
  appropriate: { label: '적절', color: '#6c63ff', defaultSelected: true, defaultOpen: true },
  hard: { label: '심화', color: '#e8a838', defaultSelected: true, defaultOpen: true },
};

const MAX_WORDS = 1000;

export default function WordSelectionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { categories, source } = route.params;

  // 카테고리가 존재하는 것만 필터
  const activeCategories = (['easy', 'appropriate', 'hard'] as CategoryKey[])
    .filter((key) => categories[key].length > 0);

  // 선택 상태: 카테고리별 기본값 적용
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const key of activeCategories) {
      const defaultOn = CATEGORY_CONFIG[key].defaultSelected;
      for (const word of categories[key]) {
        init[word] = defaultOn;
      }
    }
    return init;
  });

  // 접기/펼치기 상태
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const key of activeCategories) {
      init[key] = CATEGORY_CONFIG[key].defaultOpen;
    }
    return init;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const isOverMax = selectedCount > MAX_WORDS;

  function toggleWord(word: string) {
    setSelected((prev) => {
      const next = !prev[word];
      // 최대 개수 초과 방지
      if (next && selectedCount >= MAX_WORDS) return prev;
      return { ...prev, [word]: next };
    });
  }

  function toggleAll(key: CategoryKey) {
    const words = categories[key];
    const allSelected = words.every((w) => selected[w]);
    setSelected((prev) => {
      const next = { ...prev };
      for (const w of words) {
        if (allSelected) {
          next[w] = false;
        } else {
          if (selectedCount < MAX_WORDS || prev[w]) {
            next[w] = true;
          }
        }
      }
      return next;
    });
  }

  async function handleNext() {
    const selectedWords = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([w]) => w);

    if (selectedWords.length < 1) return;

    setLoading(true);
    setError('');
    try {
      const meanings = await extractMeanings(selectedWords);
      navigation.navigate('MeaningSelection', { meanings, source });
    } catch {
      setError('뜻 추출에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>학습할 단어를 선택하세요</Text>
        <Text style={styles.subtitle}>
          {Object.values(categories).flat().length}개의 단어가 추출되었어요
        </Text>

        {activeCategories.map((key) => {
          const config = CATEGORY_CONFIG[key];
          const words = categories[key];
          const catSelectedCount = words.filter((w) => selected[w]).length;
          const allSelected = catSelectedCount === words.length;
          const isOpen = expanded[key];

          return (
            <View key={key} style={styles.categorySection}>
              {/* 카테고리 헤더 */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isOpen ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={config.color}
                />
                <View style={[styles.categoryDot, { backgroundColor: config.color }]} />
                <Text style={[styles.categoryLabel, { color: config.color }]}>
                  {config.label} ({catSelectedCount}/{words.length})
                </Text>
                <TouchableOpacity onPress={() => toggleAll(key)} hitSlop={8}>
                  <Text style={styles.toggleAllText}>
                    {allSelected ? '전체 해제' : '전체 선택'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* 단어 목록 */}
              {isOpen && (
                <View style={styles.wordList}>
                  {words.map((word) => (
                    <TouchableOpacity
                      key={word}
                      style={styles.wordRow}
                      onPress={() => toggleWord(word)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={selected[word] ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={selected[word] ? config.color : colors.text.disabled}
                      />
                      <Text style={[styles.wordText, selected[word] && styles.wordTextSelected]}>
                        {word}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* 하단 고정 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerInfo}>
          <Text style={styles.selectedCount}>
            선택된 단어: <Text style={styles.selectedCountNum}>{selectedCount}개</Text>
          </Text>
          {selectedCount > 0 && selectedCount <= 30 && (
            <Text style={styles.hint}>20~30개가 학습에 적합해요</Text>
          )}
          {isOverMax && (
            <Text style={styles.errorSmall}>최대 {MAX_WORDS}개까지 선택 가능해요</Text>
          )}
        </View>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>뜻을 분석하고 있어요</Text>
          </View>
        ) : (
          <Button
            label="다음"
            onPress={handleNext}
            disabled={selectedCount < 1 || isOverMax}
          />
        )}
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
    gap: 16,
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
  categorySection: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  toggleAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  wordList: {
    paddingLeft: 16,
    gap: 4,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  wordText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  wordTextSelected: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  error: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: 8,
  },
  footerInfo: {
    gap: 2,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  selectedCountNum: {
    fontWeight: '700',
    color: colors.accent,
  },
  hint: {
    fontSize: 14,
    color: colors.text.disabled,
  },
  errorSmall: {
    fontSize: 14,
    color: colors.error,
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
