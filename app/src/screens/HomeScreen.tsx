import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useWordSetStore } from '../stores/wordSetStore';
import { useProfileStore } from '../stores/profileStore';
import { fetchWordSets, deleteWordSet } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import { WordSet } from '../../../shared/types';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const nickname = useProfileStore((s) => s.nickname);
  const wordSets = useWordSetStore((s) => s.wordSets);
  const loaded = useWordSetStore((s) => s.loaded);
  const [refreshing, setRefreshing] = useState(false);

  // 화면에 포커스될 때마다 세트 목록을 가져온다.
  useFocusEffect(
    useCallback(() => {
      if (!loaded) {
        fetchWordSets().catch(() => {});
      }
    }, [loaded]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchWordSets();
    } catch {
      // 새로고침 실패 시 무시
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDelete(setId: string) {
    try {
      await deleteWordSet(setId);
    } catch {
      // 삭제 실패 시 무시
    }
  }

  function formatDate(date: Date | string) {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function renderWordSetCard({ item }: { item: WordSet }) {
    return (
      <View style={styles.setCard}>
        <View style={styles.setCardContent}>
          <Text style={styles.setName}>{item.name}</Text>
          <Text style={styles.setMeta}>
            {item.words?.length ?? 0}개 단어 · {formatDate(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.headerSection}>
        <Text style={styles.greeting}>{nickname}님, 안녕하세요</Text>

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

        {/* 세트 목록 헤더 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 단어 세트</Text>
          <Text style={styles.sectionCount}>{wordSets.length}개</Text>
        </View>
      </View>
    );
  }

  function renderEmpty() {
    if (!loaded) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="folder-open-outline" size={48} color={colors.text.disabled} />
        <Text style={styles.emptyTitle}>아직 단어 세트가 없어요</Text>
        <Text style={styles.emptyText}>첫 단어 세트를 만들어보세요!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={wordSets}
        keyExtractor={(item) => item._id}
        renderItem={renderWordSetCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
        ]}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />

      {/* 하단 고정: 새 단어 세트 만들기 버튼 */}
      <View style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 60 }]}>
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('WordSetInputMethod')}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.fabText}>새 단어 세트 만들기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  headerSection: {
    gap: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  setCardContent: {
    flex: 1,
    gap: 4,
  },
  setName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  setMeta: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.disabled,
  },
  fab: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
