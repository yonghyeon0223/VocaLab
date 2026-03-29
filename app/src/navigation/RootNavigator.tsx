import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import MainScreen from '../screens/MainScreen';
import { useAuthStore } from '../stores/authStore';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  VerifyEmail: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 인증 상태에 따라 보여줄 화면을 결정한다.
// isAuthenticated가 바뀌면 네비게이터가 자동으로 적절한 화면으로 전환한다.
export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f0f' },
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated ? (
          // 인증된 사용자 — 메인 화면
          <Stack.Screen name="Main" component={MainScreen} />
        ) : (
          // 미인증 사용자 — 로그인/회원가입 화면
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
