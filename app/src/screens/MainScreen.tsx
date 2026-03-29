import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { logout } from '../services/authService';

// 로그인 후 진입하는 임시 메인 화면.
// Sprint 03~부터 실제 학습 콘텐츠로 교체된다.
export default function MainScreen() {
  async function handleLogout() {
    await logout();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>메인 화면</Text>
      <Text style={styles.subtitle}>Sprint 03에서 학습 콘텐츠가 추가됩니다.</Text>
      <Button label="로그아웃" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
