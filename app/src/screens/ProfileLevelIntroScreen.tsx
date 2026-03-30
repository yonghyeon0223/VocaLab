import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelIntro'>;
};

// 세 가지 예문 구간이 각각 어떤 역할을 하는지 카드로 설명한다.
// 결과 화면 차트의 색상 구간과 동일한 포인트 컬러를 사용해 시각적 일관성을 유지한다.
const CARDS = [
  {
    label: '처음 만날 때',
    description: '먼저 쉬운 문장으로 단어와 자연스럽게 친해져요',
    color: '#4caf7d',
  },
  {
    label: '실전 적용',
    description: '내 수준의 문장에서 단어를 실제로 써볼 수 있게 만들어요',
    color: '#6c63ff',
  },
  {
    label: '심화',
    description: '한 단계 위의 문장에 도전하면서 단어와 함께 영어 실력도 올려요',
    color: '#e8a838',
  },
];

export default function ProfileLevelIntroScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>단어를 외워도{'\n'}막상 쓸 때 생각이 안 나죠?</Text>
          <Text style={styles.subtitle}>
            읽고, 듣고, 말하고, 쓰면서{'\n'}문맥 속에서 익힌 단어는 달라요.
          </Text>
        </View>

        <View style={styles.cards}>
          {CARDS.map((card) => (
            // 보더 없이 배경 tint + 라벨 컬러로 구간을 구분한다
            <View
              key={card.label}
              style={[styles.card, { backgroundColor: card.color + '18' }]}
            >
              <Text style={[styles.cardLabel, { color: card.color }]}>{card.label}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="문장 보러 가기"
          onPress={() => navigation.navigate('ProfileLevelTest')}
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
    paddingTop: 64,
    paddingBottom: 24,
    gap: 36,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 23,
  },
  cards: {
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
