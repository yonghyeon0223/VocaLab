import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// 앱의 진입점.
// Sprint 00에서는 환경이 제대로 세팅됐는지 확인하는 Hello World만 출력한다.
// 네비게이션 구조는 Sprint 01에서 추가한다.
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VocaLab</Text>
      <Text style={styles.subtitle}>Hello World</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
