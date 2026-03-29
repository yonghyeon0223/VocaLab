import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

// 화면 3 — 문장 평가 (다음 작업에서 구현 예정)
export default function ProfileLevelTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>화면 3 — 준비 중</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text.secondary,
    fontSize: 16,
  },
});
