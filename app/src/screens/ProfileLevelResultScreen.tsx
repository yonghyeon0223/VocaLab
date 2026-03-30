import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';
import { LevelRatings } from '../../../shared/types';
import { useLevelTestStore } from '../stores/levelTestStore';
import { calculateLevels } from '../utils/levelCalculator';
import { updateProfile } from '../services/profileService';
import { LEVEL_LABELS, RATING_OPTIONS } from '../constants/levels';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelResult'>;
};

// 폴백 발생 시 표시할 안내 메시지
const FALLBACK_MESSAGES = {
  easy: '바로 이해되는 구간이 없어서 가장 낮은 레벨로 시작할게요.',
  active: '적절한 구간이 따로 없어서 기초와 심화 사이로 설정할게요.',
  hard: '어려운 구간이 없어서 가장 높은 레벨로 설정할게요.',
};

// 각 결과 카드의 레이블, 레벨 키, 색상 정의.
// 차트의 색상 구간과 시각적으로 일치시킨다.
const RESULT_CARDS = [
  { label: '처음 만날 때', key: 'easyLevel' as const,   color: '#4caf7d' },
  { label: '실전 적용',    key: 'activeLevel' as const,  color: colors.accent },
  { label: '심화',         key: 'hardLevel' as const,    color: '#e8a838' },
];

// 바 차트에 표시할 색상을 계산한다.
// easy 구간은 레벨 번호가 높은 상위 2개만 easy 색상으로 표시한다.
// → 경계 구간만 강조해 차트가 초록으로 압도되지 않게 한다.
// alien 구간은 가장 낮은 1개만 alien 색상으로, 나머지는 hard 색상으로 표시한다.
// → alien이 여러 레벨이어도 경계 1개만 빨간색이 된다.
function getBarColor(level: number, ratings: LevelRatings): string {
  const rating = ratings[level];
  if (!rating) return colors.background.tertiary;

  if (rating === 'easy') {
    const topTwo = Object.keys(ratings)
      .map(Number)
      .filter((l) => ratings[l] === 'easy')
      .sort((a, b) => b - a)
      .slice(0, 2);
    if (!topTwo.includes(level)) return colors.background.tertiary;
  }

  if (rating === 'alien') {
    const lowestAlien = Object.keys(ratings)
      .map(Number)
      .filter((l) => ratings[l] === 'alien')
      .sort((a, b) => a - b)[0];
    if (level !== lowestAlien) {
      return RATING_OPTIONS.find((o) => o.value === 'hard')!.color;
    }
  }

  return RATING_OPTIONS.find((o) => o.value === rating)!.color;
}

export default function ProfileLevelResultScreen({ navigation }: Props) {
  const { ratings } = useLevelTestStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { easyLevel, activeLevel, hardLevel, fallbacks } = calculateLevels(ratings);

  // "다음" 버튼: 계산된 레벨 값과 전체 평가 기록을 DB에 저장한다.
  async function handleNext() {
    setLoading(true);
    setError('');
    try {
      await updateProfile({
        easyLevel,
        activeLevel,
        hardLevel,
        levelRatings: ratings as Record<string, string>,
      });
      navigation.navigate('ProfilePurpose');
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>학습 구간이{'\n'}설정됐어요</Text>

        {/* 바 차트: lv.1~10 평가 결과를 색상으로 표시
            easy 최대 2개, alien 최대 1개 규칙을 적용해 경계 구간을 강조한다 */}
        <View style={styles.chart}>
          {Array.from({ length: 10 }, (_, i) => {
            const level = i + 1;
            const barColor = getBarColor(level, ratings);
            return (
              <View key={level} style={styles.chartRow}>
                <Text style={styles.chartLabel}>lv.{level}</Text>
                <View style={[styles.chartBar, { backgroundColor: barColor }]} />
              </View>
            );
          })}
        </View>

        {/* 폴백 안내 메시지 */}
        {(fallbacks.easy || fallbacks.active || fallbacks.hard) && (
          <View style={styles.fallbackBox}>
            {fallbacks.easy && (
              <Text style={styles.fallbackText}>• {FALLBACK_MESSAGES.easy}</Text>
            )}
            {fallbacks.active && (
              <Text style={styles.fallbackText}>• {FALLBACK_MESSAGES.active}</Text>
            )}
            {fallbacks.hard && (
              <Text style={styles.fallbackText}>• {FALLBACK_MESSAGES.hard}</Text>
            )}
          </View>
        )}

        {/* 결과 카드 3개: 각 레벨 번호를 차트 색상 구간과 일치시켜 직관성을 높인다 */}
        <View style={styles.resultCards}>
          {RESULT_CARDS.map(({ label, key, color }) => {
            const level = { easyLevel, activeLevel, hardLevel }[key];
            return (
              <View key={key} style={styles.resultCard}>
                <Text style={styles.resultCardLabel}>{label}</Text>
                <Text style={[styles.resultCardLevel, { color }]}>
                  lv.{level}
                  <Text style={styles.resultCardLevelSub}> — {LEVEL_LABELS[level]}</Text>
                </Text>
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={loading ? '저장 중...' : '다음'}
          onPress={handleNext}
          disabled={loading}
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  chart: {
    gap: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartLabel: {
    width: 36,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  chartBar: {
    flex: 1,
    height: 20,
    borderRadius: 4,
  },
  fallbackBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  fallbackText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  resultCards: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  resultCardLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  resultCardLevel: {
    fontSize: 18,
    fontWeight: '700',
    // color는 각 카드에서 인라인으로 지정한다 (easy→초록, active→보라, hard→노랑)
  },
  resultCardLevelSub: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.primary,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
