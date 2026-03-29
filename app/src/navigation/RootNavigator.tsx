import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import ProfileNicknameScreen from '../screens/ProfileNicknameScreen';
import ProfileLevelIntroScreen from '../screens/ProfileLevelIntroScreen';
import MainScreen from '../screens/MainScreen';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  VerifyEmail: undefined;
  Main: undefined;
};

export type ProfileStackParamList = {
  ProfileNickname: undefined;
  ProfileLevelIntro: undefined;
};

const AuthStack = createNativeStackNavigator<RootStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0f0f0f' },
  animation: 'slide_from_right',
} as const;

// 인증 상태와 프로필 완료 여부에 따라 세 가지 스택 중 하나를 보여준다.
//   미인증          → 로그인/회원가입 스택
//   인증 + 미완료   → 프로필 설정 스택
//   인증 + 완료     → 메인 스택
export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profileCompleted = useProfileStore((s) => s.profileCompleted);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // 미인증 — 로그인/회원가입 화면
        <AuthStack.Navigator screenOptions={screenOptions}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Signup" component={SignupScreen} />
          <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </AuthStack.Navigator>
      ) : !profileCompleted ? (
        // 인증됐지만 프로필 미완료 — 프로필 설정 플로우
        <ProfileStack.Navigator screenOptions={screenOptions}>
          <ProfileStack.Screen name="ProfileNickname" component={ProfileNicknameScreen} />
          <ProfileStack.Screen name="ProfileLevelIntro" component={ProfileLevelIntroScreen} />
        </ProfileStack.Navigator>
      ) : (
        // 인증 + 프로필 완료 — 메인 앱
        <AuthStack.Navigator screenOptions={screenOptions}>
          <AuthStack.Screen name="Main" component={MainScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
