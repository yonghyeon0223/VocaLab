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
import { LevelRatings, RatingValue } from '../../../shared/types';
import { useLevelTestStore } from '../stores/levelTestStore';
import { fetchAllTestSentences } from '../services/sentenceService';
import { updateProfile } from '../services/profileService';
import { calculateLevels } from '../utils/levelCalculator';
import { LEVEL_LABELS, RATING_OPTIONS, RATING_ORDER } from '../constants/levels';
import { colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelTest'>;
};

export default function ProfileLevelTestScreen({ navigation }: Props) {
  // 프로필 설정 플로우와 재테스트에서 결과 화면 이름이 다르다.
  // 현재 navigator에 등록된 이름을 기준으로 결정한다.
  const routeNames = navigation.getState().routeNames as string[];
  const resultScreen = routeNames.includes('RetestResult') ? 'RetestResult' : 'ProfileLevelResult';

  const {
    currentLevel,
    ratings,
    sentences,
    setCurrentLevel,
    setRating,
    setAllSentences,
    clearRatingsFrom,
    setAlienFrom,
  } = useLevelTestStore();

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  // 번역은 기본적으로 숨긴다. 유저가 원할 때 탭해서 볼 수 있다.
  const [showTranslation, setShowTranslation] = useState(false);

  // 레벨이 바뀌면 문장 인덱스와 번역 표시 상태를 초기화한다.
  useEffect(() => {
    setSentenceIndex(0);
    setShowTranslation(false);
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

  // 이전 버튼: 이동할 레벨(currentLevel - 1)의 평가도 함께 초기화한다.
  // 돌아간 화면에서 이전 선택이 남아있지 않고 다시 고를 수 있게 한다.
  function handlePrev() {
    if (currentLevel <= 1) return;
    clearRatingsFrom(currentLevel - 1);
    setCurrentLevel(currentLevel - 1);
  }

  // 평가 선택 시 저장 후 다음 레벨로 자동 이동한다.
  // "외계어예요" 선택 시 이후 모든 레벨을 alien으로 채우고 결과 화면으로 바로 이동한다.
  // lv.10이면 레벨 계산 후 DB에 저장하고 결과 화면으로 이동한다.
  async function handleRating(value: RatingValue) {
    if (value === 'alien') {
      // 현재 레벨부터 lv.10까지 전부 alien으로 처리한다.
      // 이후 레벨을 하나씩 선택할 필요가 없으므로 바로 결과로 넘긴다.
      setAlienFrom(currentLevel);
      const updatedRatings: LevelRatings = { ...ratings };
      for (let l = currentLevel; l <= 10; l++) {
        updatedRatings[l] = 'alien';
      }
      const { easyLevel, activeLevel, hardLevel } = calculateLevels(updatedRatings);
      try {
        await updateProfile({
          easyLevel,
          activeLevel,
          hardLevel,
          levelRatings: updatedRatings as Record<string, string>,
        });
      } catch {
        // 저장에 실패해도 결과는 볼 수 있게 계속 진행한다.
      }
      (navigation.navigate as (screen: string) => void)(resultScreen);
      return;
    }

    setRating(currentLevel, value);

    if (currentLevel < 10) {
      setTimeout(() => setCurrentLevel(currentLevel + 1), 250);
      return;
    }

    // lv.10 평가 완료: store setRating이 비동기적으로 반영되기 전에
    // 직접 병합한 ratings로 계산한다.
    const updatedRatings: LevelRatings = { ...ratings, 10: value };
    const { easyLevel, activeLevel, hardLevel } = calculateLevels(updatedRatings);
    try {
      await updateProfile({
        easyLevel,
        activeLevel,
        hardLevel,
        levelRatings: updatedRatings as Record<string, string>,
      });
    } catch {
      // 저장에 실패해도 결과는 볼 수 있게 계속 진행한다.
    }
    (navigation.navigate as (screen: string) => void)(resultScreen);
  }

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
      {/* 레벨 헤더 */}
      <View style={styles.header}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelNumber}>lv.{currentLevel}</Text>
          <Text style={styles.levelLabel}>{LEVEL_LABELS[currentLevel]}</Text>
        </View>

        {/* 진행 바: 현재 레벨 세그먼트만 높이를 키워 위치를 직관적으로 표시한다 */}
        <View style={styles.progressRow}>
          {Array.from({ length: 10 }, (_, i) => {
            const lv = i + 1;
            const rated = ratings[lv];
            const isCurrent = lv === currentLevel;
            const segColor = rated
              ? RATING_OPTIONS.find((o) => o.value === rated)!.color
              : colors.background.tertiary;
            return (
              <TouchableOpacity
                key={lv}
                style={styles.segmentWrapper}
                onPress={() => setCurrentLevel(lv)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.segment,
                    { backgroundColor: segColor, height: isCurrent ? 8 : 4 },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 문장 카드
            여러 예문이 있을 때만 reload 아이콘이 나타난다. */}
        {currentSentence ? (
          <View style={styles.sentenceCard}>
            {/* 영어 문장은 reload 아이콘 없이 전체 너비로 표시한다 */}
            <Text style={styles.sentenceText}>{currentSentence.text}</Text>
            <View style={styles.divider} />
            {/* 뜻 보기/번역과 다른 문장 버튼을 같은 row에 배치한다
                번역이 전체 너비를 사용하고 reload는 오른쪽 끝에 붙는다 */}
            <View style={styles.bottomRow}>
              <View style={styles.translationWrapper}>
                {showTranslation ? (
                  <TouchableOpacity onPress={() => setShowTranslation(false)} activeOpacity={0.7}>
                    <Text style={styles.translationText}>{currentSentence.translation}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setShowTranslation(true)} activeOpacity={0.7}>
                    <Text style={styles.actionText}>뜻 보기</Text>
                  </TouchableOpacity>
                )}
              </View>
              {currentSentences.length > 1 && (
                <TouchableOpacity
                  onPress={handleCycleSentence}
                  hitSlop={8}
                  style={styles.cycleButton}
                >
                  <Text style={styles.actionText}>다른 예문 보기</Text>
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

        {/* 이전 버튼: 외계어예요 버튼 바로 아래, 평가 버튼과 같은 시야에 배치한다 */}
        <TouchableOpacity
          style={[styles.prevButton, currentLevel === 1 && styles.prevButtonDisabled]}
          onPress={handlePrev}
          disabled={currentLevel === 1}
          hitSlop={8}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={currentLevel === 1 ? colors.text.disabled : colors.text.secondary}
          />
          <Text
            style={[
              styles.prevButtonText,
              currentLevel === 1 && styles.prevButtonTextDisabled,
            ]}
          >
            이전
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
    fontSize: 15,
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
    alignItems: 'flex-end',
    gap: 5,
  },
  segmentWrapper: {
    flex: 1,
    height: 8,
    justifyContent: 'flex-end',
  },
  segment: {
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
  // 뜻 보기/번역과 다른 문장 버튼을 한 row에 배치한다.
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  translationWrapper: {
    flex: 1,
  },
  cycleButton: {
    alignSelf: 'flex-start',
  },
  // "뜻 보기"와 "다른 예문 보기" 두 텍스트가 나란히 표시되므로
  // 동일한 스타일을 공유한다. 별도 스타일 대신 actionText 하나로 통일.
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sentenceText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 26,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  translationText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
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
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    paddingVertical: 4,
    paddingRight: 8,
  },
  prevButtonDisabled: {
    opacity: 0.3,
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  prevButtonTextDisabled: {
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
});
