import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetInputMethod'>;
};

export default function WordSetInputMethodScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.body, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <Text style={styles.title}>핵심 단어로{'\n'}단어 세트 만들기</Text>

      {/* AI 추천 배지 */}
      <View style={styles.section}>
        <View style={styles.sectionBadge}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
          <Text style={styles.sectionBadgeText}>AI가 핵심 단어를 골라줘요</Text>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('WordSetTextInput')}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={28} color={colors.accent} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>영어 지문 입력</Text>
            <Text style={styles.cardDesc}>
              교과서 지문, 단어 리스트, 가사 등을 붙여넣으면{'\n'}
              AI가 내 수준에 맞는 핵심 단어를 찾아줘요
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('WordSetPhotoInput')}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={28} color={colors.accent} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>사진 촬영</Text>
            <Text style={styles.cardDesc}>
              영어 교재, 단어장, 프린트를 촬영하면{'\n'}
              AI가 사진 속 핵심 단어를 찾아줘요
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 수동 입력 */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.cardLight}
          onPress={() => navigation.navigate('WordSetManualEntry')}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={28} color={colors.text.secondary} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitleLight}>단어 직접 입력</Text>
            <Text style={styles.cardDesc}>
              단어, 뜻, 품사를 하나씩 직접 입력해요{'\n'}
              이미 외울 단어가 정해져 있을 때 좋아요
            </Text>
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  section: {
    gap: 12,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  cardLight: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardTitleLight: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
