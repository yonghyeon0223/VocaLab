import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import LearningScreen from '../screens/LearningScreen';
import MemoryLabScreen from '../screens/MemoryLabScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WordSetNameScreen from '../screens/WordSetNameScreen';
import WordSetWordsScreen from '../screens/WordSetWordsScreen';
import ProfileLevelTestScreen from '../screens/ProfileLevelTestScreen';
import ProfileLevelResultScreen from '../screens/ProfileLevelResultScreen';

// 메인 스택 전체에서 사용하는 파라미터 목록.
// 탭 안의 화면과 모달/플로우 화면을 모두 포함한다.
export type MainStackParamList = {
  HomeTabs: undefined;
  WordSetName: undefined;
  WordSetWords: { name: string };
  ProfileLevelTest: undefined;
  ProfileLevelResult: undefined;
};

type TabParamList = {
  Home: undefined;
  Learning: undefined;
  MemoryLab: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Learning: { focused: 'book', unfocused: 'book-outline' },
  MemoryLab: { focused: 'flask', unfocused: 'flask-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.default,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Learning" component={LearningScreen} options={{ tabBarLabel: '학습' }} />
      <Tab.Screen name="MemoryLab" component={MemoryLabScreen} options={{ tabBarLabel: '장기기억 연구소' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '프로필' }} />
    </Tab.Navigator>
  );
}

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0f0f0f' },
  animation: 'slide_from_right',
} as const;

// 메인 앱의 최상위 네비게이터.
// 하단 탭과 단어 세트 생성/난이도 재테스트 같은 플로우 화면을 포함한다.
export default function MainTabNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="WordSetName" component={WordSetNameScreen} />
      <Stack.Screen name="WordSetWords" component={WordSetWordsScreen} />
      <Stack.Screen name="ProfileLevelTest" component={ProfileLevelTestScreen} />
      <Stack.Screen name="ProfileLevelResult" component={ProfileLevelResultScreen} />
    </Stack.Navigator>
  );
}
