import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelIntro'>;
};

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
        <Text style={styles.title}>VocaLab은 문맥 속에서{'\n'}단어를 익혀요.</Text>
        <Text style={styles.subtitle}>
          단어를 처음 배울 때와 읽고, 듣고, 말하고, 쓰기에{'\n'}적합한 예문 난이도를 찾아볼거예요.
        </Text>
      </View>

      <View style={styles.cards}>
        {CARDS.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
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
    gap: 16,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 20,
    gap: 8,
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
});
