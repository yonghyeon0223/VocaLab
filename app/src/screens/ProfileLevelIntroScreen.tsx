import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelIntro'>;
};

const SKILLS = ['읽기', '듣기', '말하기', '쓰기'];

// easyLevel과 activeLevel이 각각 어느 학습 활동에 쓰이는지 카드로 설명한다.
const CARDS = [
  {
    label: '처음 만날 때',
    description: '새 단어를 처음 접할 때 사용하는 예문 난이도예요.',
  },
  {
    label: '실전 적용',
    description: '단어를 실제로 활용하는 연습에 사용하는 예문 난이도예요.',
  },
];

export default function ProfileLevelIntroScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>딱 맞는 예문을{'\n'}찾아드릴게요</Text>

        {/* 문맥 학습 원리 — 왜 난이도가 중요한지 설명한다 */}
        <View style={styles.reasonBox}>
          <Text style={styles.reasonHeadline}>VocaLab은 문맥 속에서 단어를 익혀요</Text>
          <Text style={styles.reasonBody}>
            너무 쉬우면 기억에 안 남고,{'\n'}
            너무 어려우면 뜻이 파악되지 않아요.{'\n'}
            딱 맞는 예문이어야 단어가 자연스럽게 머릿속에 남아요.
          </Text>
        </View>

        <Text style={styles.subtitle}>문장 몇 개를 보고 느낌을 알려주세요.</Text>
      </View>

      <View style={styles.cards}>
        {CARDS.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
            {/* 이 레벨이 적용되는 학습 활동을 pill로 나열한다 */}
            <View style={styles.pills}>
              {SKILLS.map((skill) => (
                <View key={skill} style={styles.pill}>
                  <Text style={styles.pillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <Button
        label="문장 보러 가기"
        onPress={() => navigation.navigate('ProfileLevelTest')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
    paddingVertical: 64,
    justifyContent: 'space-between',
  },
  header: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  reasonBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  reasonHeadline: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  reasonBody: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
