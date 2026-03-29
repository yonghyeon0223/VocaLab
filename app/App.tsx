import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';

// 앱의 진입점.
// 네비게이터가 화면 전환을 담당하고, 이 파일은 그걸 렌더링하기만 한다.
export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}
