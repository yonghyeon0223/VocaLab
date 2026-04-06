import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation as useTabNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useWordSetStore } from '../stores/wordSetStore';
import { useProfileStore } from '../stores/profileStore';
import { fetchWordSets } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const tabNavigation = useTabNavigation<any>();
  const insets = useSafeAreaInsets();
  const nickname = useProfileStore((s) => s.nickname);
  const wordSets = useWordSetStore((s) => s.wordSets);
  const loaded = useWordSetStore((s) => s.loaded);

  useFocusEffect(
    useCallback(() => {
      if (!loaded) {
        fetchWordSets().catch(() => {});
      }
    }, [loaded]),
  );

  // 가장 최근 단어 세트 (updatedAt 또는 createdAt 기준)
  const recentSet = wordSets.length > 0 ? wordSets[0] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.body,
        { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 인사 */}
      <Text style={styles.greeting}>{nickname}님, 안녕하세요</Text>

      {/* 3개 메뉴 */}
      <View style={styles.menuCards}>
        {/* 새 단어 세트 만들기 */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={() => navigation.navigate('WordSetInputMethod')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
          <View style={styles.cardContent}>
            <Text style={styles.primaryCardTitle}>새 단어 세트 만들기</Text>
            <Text style={styles.primaryCardDesc}>AI가 핵심 단어를 찾아줘요</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {/* 최근 학습 이어하기 */}
        <TouchableOpacity
          style={[styles.menuCard, !recentSet && styles.menuCardDisabled]}
          onPress={() => {
            // 다음 스프린트에서 단어 세트 상세 페이지로 이동
            if (recentSet) {
              // placeholder — 현재는 학습 탭으로 이동
              tabNavigation.navigate('Learning');
            }
          }}
          disabled={!recentSet}
          activeOpacity={0.7}
        >
          <Ionicons
            name="play-circle-outline"
            size={26}
            color={recentSet ? colors.accent : colors.text.disabled}
          />
          <View style={styles.cardContent}>
            <Text style={[styles.menuCardTitle, !recentSet && styles.menuCardTitleDisabled]}>
              최근 학습 이어하기
            </Text>
            <Text style={styles.menuCardDesc}>
              {recentSet ? recentSet.name : '아직 학습한 단어 세트가 없어요'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
        </TouchableOpacity>

        {/* 단어 세트 모두 보기 */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => tabNavigation.navigate('Learning')}
          activeOpacity={0.7}
        >
          <Ionicons name="library-outline" size={26} color={colors.accent} />
          <View style={styles.cardContent}>
            <Text style={styles.menuCardTitle}>단어 세트 모두 보기</Text>
            <Text style={styles.menuCardDesc}>
              {wordSets.length > 0 ? `${wordSets.length}개의 단어 세트` : '아직 단어 세트가 없어요'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.disabled} />
        </TouchableOpacity>
      </View>

      {/* 학습 현황 placeholder */}
      <View style={styles.placeholderCard}>
        <Ionicons name="bar-chart-outline" size={24} color={colors.text.disabled} />
        <Text style={styles.placeholderTitle}>학습 현황</Text>
        <Text style={styles.placeholderText}>학습 기능이 추가되면 여기에 진행률이 표시돼요</Text>
      </View>

      {/* 복습 캘린더 placeholder */}
      <View style={styles.placeholderCard}>
        <Ionicons name="calendar-outline" size={24} color={colors.text.disabled} />
        <Text style={styles.placeholderTitle}>복습 캘린더</Text>
        <Text style={styles.placeholderText}>복습 기능이 추가되면 여기에 스케줄이 표시돼요</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  body: {
    paddingHorizontal: 20,
    gap: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuCards: {
    gap: 10,
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  primaryCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  primaryCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  menuCardDisabled: {
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuCardTitleDisabled: {
    color: colors.text.secondary,
  },
  menuCardDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  placeholderCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});
