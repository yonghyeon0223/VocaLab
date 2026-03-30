import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';
import { RatingValue } from '../../../shared/types';
import { useLevelTestStore } from '../stores/levelTestStore';
import { fetchAllTestSentences } from '../services/sentenceService';
import { LEVEL_LABELS, RATING_OPTIONS, RATING_ORDER } from '../constants/levels';
import { colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelTest'>;
};

export default function ProfileLevelTestScreen({ navigation }: Props) {
  const { currentLevel, ratings, sentences, setCurrentLevel, setRating, setAllSentences } =
    useLevelTestStore();

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // 레벨이 바뀌면 문장 인덱스를 초기화한다.
  useEffect(() => {
    setSentenceIndex(0);
  }, [currentLevel]);

  // 아직 문장이 로드되지 않은 경우에만 fetch한다.
  // 뒤로 갔다가 돌아온 경우 재요청하지 않는다.
  useEffect(() => {
    if (Object.keys(sentences).length === 10) return;
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const all = await fetchAllTestSentences();
      setAllSentences(all);
    } catch {
      setLoadError('문장을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const currentSentences = sentences[currentLevel] ?? [];
  const currentSentence = currentSentences[sentenceIndex];
  const currentRating = ratings[currentLevel];

  // 이전 레벨 rating을 기준으로 현재 레벨에서 선택 가능한 rating을 제한한다.
  const prevRating = currentLevel > 1 ? ratings[currentLevel - 1] : undefined;
  function isButtonDisabled(value: RatingValue) {
    if (!prevRating) return false;
    return RATING_ORDER[value] < RATING_ORDER[prevRating];
  }

  function handleCycleSentence() {
    if (currentSentences.length === 0) return;
    setSentenceIndex((prev) => (prev + 1) % currentSentences.length);
  }

  function handlePrev() {
    if (currentLevel > 1) setCurrentLevel(currentLevel - 1);
  }

  function handleNext() {
    if (currentLevel < 10) setCurrentLevel(currentLevel + 1);
  }

  // 평가 선택 시 저장 후 다음 레벨로 자동 이동한다.
  // lv.10이면 이동하지 않고 결과 보기 버튼이 활성화된다.
  function handleRating(value: RatingValue) {
    setRating(currentLevel, value);
    if (currentLevel < 10) {
      setTimeout(() => setCurrentLevel(currentLevel + 1), 250);
    }
  }

  // lv.10이 평가됐을 때만 결과 화면으로 이동할 수 있다.
  function handleResult() {
    navigation.navigate('ProfileLevelResult');
  }

  const isLastLevel = currentLevel === 10;
  const canShowResult = isLastLevel && ratings[10] !== undefined;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>문장을 불러오는 중...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 레벨 헤더: 번호를 작게, 레이블을 크게 표시해 단계를 직관적으로 나타낸다 */}
      <View style={styles.header}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelNumber}>lv.{currentLevel}</Text>
          <Text style={styles.levelLabel}>{LEVEL_LABELS[currentLevel]}</Text>
        </View>

        {/* 진행 바: 10개 세그먼트 */}
        <View style={styles.progressRow}>
          {Array.from({ length: 10 }, (_, i) => {
            const lv = i + 1;
            const rated = ratings[lv];
            const isCurrent = lv === currentLevel;
            const segColor = rated
              ? RATING_OPTIONS.find((o) => o.value === rated)!.color
              : isCurrent
                ? colors.accent
                : colors.background.tertiary;
            return (
              <TouchableOpacity
                key={lv}
                style={[styles.segment, { backgroundColor: segColor }]}
                onPress={() => setCurrentLevel(lv)}
              />
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 문장 카드
            하단 row에 번역과 다음 예문 아이콘을 나란히 배치한다.
            여러 예문이 있을 때만 아이콘이 나타난다. */}
        {currentSentence ? (
          <View style={styles.sentenceCard}>
            <Text style={styles.sentenceText}>{currentSentence.text}</Text>
            <View style={styles.divider} />
            <View style={styles.translationRow}>
              <Text style={styles.translationText}>{currentSentence.translation}</Text>
              {currentSentences.length > 1 && (
                <TouchableOpacity onPress={handleCycleSentence} hitSlop={12}>
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.sentenceCard}>
            <Text style={styles.loadingText}>문장 로딩 중...</Text>
          </View>
        )}

        {/* 4지선다 평가 버튼
            선택하면 저장 후 다음 레벨로 자동 이동한다.
            보더 없이 배경 tint/채움으로 상태를 구분한다. */}
        <View style={styles.ratingButtons}>
          {RATING_OPTIONS.map((option) => {
            const disabled = isButtonDisabled(option.value);
            const selected = currentRating === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.ratingButton,
                  disabled
                    ? styles.ratingButtonDisabled
                    : { backgroundColor: selected ? option.color : option.color + '22' },
                ]}
                onPress={() => handleRating(option.value)}
                disabled={disabled}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.ratingButtonText,
                    { color: selected ? '#fff' : option.color },
                    disabled && styles.ratingButtonTextDisabled,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navButton, currentLevel === 1 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentLevel === 1}
        >
          <Text style={[styles.navButtonText, currentLevel === 1 && styles.navButtonTextDisabled]}>
            이전
          </Text>
        </TouchableOpacity>

        {isLastLevel ? (
          <TouchableOpacity
            style={[styles.navButtonPrimary, !canShowResult && styles.navButtonDisabled]}
            onPress={handleResult}
            disabled={!canShowResult}
          >
            <Text style={[styles.navButtonPrimaryText, !canShowResult && styles.navButtonTextDisabled]}>
              결과 보기
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButtonPrimary} onPress={handleNext}>
            <Text style={styles.navButtonPrimaryText}>다음</Text>
          </TouchableOpacity>
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
  centered: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 14,
  },
  levelInfo: {
    gap: 2,
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  levelLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  sentenceCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 20,
    gap: 14,
  },
  sentenceText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 26,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  // 번역 텍스트와 다음 예문 아이콘을 한 row에 나란히 배치한다.
  translationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  translationText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  ratingButtons: {
    gap: 10,
  },
  ratingButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ratingButtonDisabled: {
    backgroundColor: colors.background.secondary,
  },
  ratingButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  ratingButtonTextDisabled: {
    color: colors.text.disabled,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  retryText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  nav: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  navButtonPrimary: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  navButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  navButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
