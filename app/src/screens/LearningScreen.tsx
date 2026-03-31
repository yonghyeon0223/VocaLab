import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export default function LearningScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>학습</Text>
      <Text style={styles.subtitle}>곧 학습 기능이 추가됩니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
