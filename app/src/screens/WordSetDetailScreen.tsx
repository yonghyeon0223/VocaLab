import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import { deleteWordSet } from '../services/wordSetService';
import DotMenu from '../components/ui/DotMenu';
import api from '../services/api';
import { Word } from '../../../shared/types';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetDetail'>;
  route: RouteProp<MainStackParamList, 'WordSetDetail'>;
};

// 학습 8단계 정의
const LEARNING_STAGES = [
  { key: 'intro', label: '단어 소개', icon: 'book-outline' as const, desc: '단어와 뜻을 처음 만나는 단계' },
  { key: 'meaning', label: '뜻 익히기', icon: 'bulb-outline' as const, desc: '뜻을 보고 단어를 맞추는 연습' },
  { key: 'write', label: '써보기', icon: 'pencil-outline' as const, desc: '단어를 직접 타이핑하는 연습' },
  { key: 'family', label: '단어 가족 만나기', icon: 'people-outline' as const, desc: '파생어, 동의어, 반의어 학습' },
  { key: 'context', label: '맥락 읽기', icon: 'reader-outline' as const, desc: '예문 속에서 단어의 쓰임 이해' },
  { key: 'speak', label: '말문 트기', icon: 'mic-outline' as const, desc: '발음과 말하기 연습' },
  { key: 'compose', label: '문장 만들기', icon: 'create-outline' as const, desc: '단어를 활용해 문장 작성' },
  { key: 'advanced', label: '심화 훈련', icon: 'trophy-outline' as const, desc: '종합 복습 + 응용 문제' },
];

type WordSetData = {
  _id: string;
  name: string;
  source: string;
  words: Word[];
};

export default function WordSetDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { setId } = route.params;
  const [data, setData] = useState<WordSetData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      async function load() {
        try {
          const res = await api.get(`/api/word-sets/${setId}`);
          if (mounted) setData(res.data.data.wordSet);
        } catch {
          if (mounted) setData(null);
        } finally {
          if (mounted) setLoading(false);
        }
      }
      load();
      return () => { mounted = false; };
    }, [setId]),
  );

  function handleRename() {
    navigation.navigate('WordSetRename', { setId, currentName: data?.name ?? '' });
  }

  function handleDelete() {
    Alert.alert(
      '단어 세트 삭제',
      `"${data?.name}" (${data?.words?.length ?? 0}개 단어)을 삭제할까요?\n삭제하면 되돌릴 수 없어요.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWordSet(setId);
              navigation.goBack();
            } catch {}
          },
        },
      ],
    );
  }

  function handleShare() {
    ToastAndroid.show('공유 기능은 준비 중이에요', ToastAndroid.SHORT);
  }

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>세트를 불러올 수 없어요</Text>
      </View>
    );
  }

  const wordCount = data.words?.length ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단: 세트 이름 + 메뉴 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{data.name}</Text>
        <DotMenu title={data.name} items={[
          { label: '이름 수정', onPress: handleRename },
          { label: '삭제', onPress: handleDelete, destructive: true },
          { label: '공유', onPress: handleShare },
        ]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 진행률 */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>전체 진행률</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
          <Text style={styles.progressText}>0%</Text>
        </View>

        {/* 액티비티 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>액티비티</Text>
        </View>

        <TouchableOpacity
          style={styles.activityCard}
          onPress={() => navigation.navigate('WordIntro', { setId, words: data.words })}
          activeOpacity={0.7}
        >
          <View style={styles.activityIcon}>
            <Ionicons name="albums-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.stageContent}>
            <Text style={styles.stageLabel}>플래시카드</Text>
            <Text style={styles.stageDesc}>단어와 뜻을 카드로 넘기며 복습해요</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text.disabled} />
        </TouchableOpacity>

        {/* 8단계 학습 로드맵 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>학습 로드맵</Text>
        </View>

        {LEARNING_STAGES.map((stage, i) => {
          const isUnlocked = i === 0;
          return (
            <TouchableOpacity
              key={stage.key}
              style={[styles.stageCard, !isUnlocked && styles.stageCardLocked]}
              onPress={() => {
                // 1단계 포함 전부 placeholder — 다음 스프린트에서 구현
              }}
              activeOpacity={1}
            >
              <View style={[styles.stageIcon, isUnlocked ? styles.stageIconActive : styles.stageIconLocked]}>
                {isUnlocked ? (
                  <Ionicons name={stage.icon} size={22} color={colors.accent} />
                ) : (
                  <Ionicons name="lock-closed" size={18} color={colors.text.disabled} />
                )}
              </View>
              <View style={styles.stageContent}>
                <Text style={[styles.stageLabel, !isUnlocked && styles.stageLabelLocked]}>
                  {i + 1}. {stage.label}
                </Text>
                <Text style={[styles.stageDesc, !isUnlocked && styles.stageDescLocked]}>
                  {stage.desc}
                </Text>
              </View>
              {isUnlocked && (
                <Text style={styles.stageProgress}>0/{wordCount}</Text>
              )}
            </TouchableOpacity>
          );
        })}
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
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  body: {
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent + '1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    gap: 8,
    paddingVertical: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'right',
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  stageCardLocked: {},
  stageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconActive: {
    backgroundColor: colors.accent + '1a',
  },
  stageIconLocked: {
    backgroundColor: colors.background.secondary,
  },
  stageContent: {
    flex: 1,
    gap: 2,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  stageLabelLocked: {
    color: colors.text.primary,
  },
  stageDesc: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  stageDescLocked: {
    color: colors.text.secondary,
  },
  stageProgress: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
});
