import { StyleSheet, Text, View } from 'react-native';

// 홈 화면.
// 현재는 Hello World만 표시한다.
// Sprint 01에서 네비게이션이 연결되면 실제 콘텐츠로 교체된다.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VocaLab</Text>
      <Text style={styles.subtitle}>Hello World</Text>
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
