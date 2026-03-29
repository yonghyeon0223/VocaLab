import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

// 화면 2 — 난이도 안내 (다음 작업에서 구현 예정)
export default function ProfileLevelIntroScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>화면 2 — 준비 중</Text>
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
