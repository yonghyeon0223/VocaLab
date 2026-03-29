import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { tryAutoLogin } from './src/services/authService';
import { colors } from './src/constants/colors';

// 앱의 진입점.
// 시작 시 AsyncStorage에 Refresh Token이 있으면 자동 로그인을 시도한다.
// 시도가 끝난 뒤에야 네비게이터를 렌더링해, 화면이 깜빡이며 전환되는 걸 막는다.
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    tryAutoLogin().finally(() => setReady(true));
  }, []);

  // 자동 로그인 시도가 끝날 때까지 빈 화면을 보여준다.
  if (!ready) {
    return <View style={styles.splash} />;
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
