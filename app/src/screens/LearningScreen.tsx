import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { ToastAndroid } from 'react-native';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import DotMenu from '../components/ui/DotMenu';
import { colors } from '../constants/colors';
import { useWordSetStore } from '../stores/wordSetStore';
import { fetchWordSets, deleteWordSet } from '../services/wordSetService';
import { WordSet } from '../../../shared/types';

export default function LearningScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const wordSets = useWordSetStore((s) => s.wordSets);
  const loaded = useWordSetStore((s) => s.loaded);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!loaded) {
        fetchWordSets().catch(() => {});
      }
    }, [loaded]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    try { await fetchWordSets(); } catch {} finally { setRefreshing(false); }
  }

  function confirmDelete(item: WordSet) {
    Alert.alert(
      '단어 세트 삭제',
      `"${item.name}" (${(item as WordSet & { wordCount?: number }).wordCount ?? item.words?.length ?? 0}개 단어)을 삭제할까요?\n삭제하면 되돌릴 수 없어요.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try { await deleteWordSet(item._id); } catch {}
          },
        },
      ],
    );
  }

  function formatDate(date: Date | string) {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function renderItem({ item }: { item: WordSet }) {
    const wordCount = (item as WordSet & { wordCount?: number }).wordCount ?? item.words?.length ?? 0;
    return (
      <TouchableOpacity
        style={styles.setCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('WordSetDetail', { setId: item._id })}
      >
        <View style={styles.setCardContent}>
          <Text style={styles.setName}>{item.name}</Text>
          <Text style={styles.setMeta}>
            {wordCount}개 단어 · {formatDate(item.createdAt)}
          </Text>
        </View>
        <DotMenu items={[
          { label: '이름 수정', onPress: () => navigation.navigate('WordSetRename', { setId: item._id, currentName: item.name }) },
          { label: '삭제', onPress: () => confirmDelete(item), destructive: true },
          { label: '공유', onPress: () => ToastAndroid.show('공유 기능은 준비 중이에요', ToastAndroid.SHORT) },
        ]} />
      </TouchableOpacity>
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
        <Text style={styles.emptyText}>홈에서 첫 단어 세트를 만들어보세요</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.screenTitle}>내 단어 세트</Text>

      <FlatList
        data={wordSets}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
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
    paddingTop: 80,
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
});
