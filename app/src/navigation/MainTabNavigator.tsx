import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { Word } from '../../../shared/types';
import HomeScreen from '../screens/HomeScreen';
import LearningScreen from '../screens/LearningScreen';
import MemoryLabScreen from '../screens/MemoryLabScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WordSetInputMethodScreen from '../screens/WordSetInputMethodScreen';
import WordSetTextInputScreen from '../screens/WordSetTextInputScreen';
import WordSetPhotoInputScreen from '../screens/WordSetPhotoInputScreen';
import WordSetWordCountScreen from '../screens/WordSetWordCountScreen';
import WordSetExtractingScreen from '../screens/WordSetExtractingScreen';
import WordSelectionScreen from '../screens/WordSelectionScreen';
import WordSetNameScreen from '../screens/WordSetNameScreen';
import WordSetDetailScreen from '../screens/WordSetDetailScreen';
import WordIntroScreen from '../screens/WordIntroScreen';
import ProfileLevelTestScreen from '../screens/ProfileLevelTestScreen';
import ProfileLevelResultScreen from '../screens/ProfileLevelResultScreen';

export type MainStackParamList = {
  HomeTabs: undefined;
  WordSetInputMethod: undefined;
  WordSetTextInput: undefined;
  WordSetPhotoInput: undefined;
  WordSetWordCount: { type: 'text'; text: string } | { type: 'photo'; photos: string[] };
  WordSetExtracting: ({ type: 'text'; text: string } | { type: 'photo'; photos: string[] }) & { wordCount: number };
  WordSelection: { words: Word[]; source: 'manual' | 'photo'; suggestedTitle?: string };
  WordSetName: { source: 'manual' | 'photo'; words: Word[]; suggestedTitle?: string };
  WordSetDetail: { setId: string };
  WordSetRename: { setId: string; currentName: string };
  WordIntro: { setId: string; words: Word[] };
  RetestLevel: undefined;
  RetestResult: undefined;
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

export default function MainTabNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="WordSetInputMethod" component={WordSetInputMethodScreen} />
      <Stack.Screen name="WordSetTextInput" component={WordSetTextInputScreen} />
      <Stack.Screen name="WordSetPhotoInput" component={WordSetPhotoInputScreen} />
      <Stack.Screen name="WordSetWordCount" component={WordSetWordCountScreen} />
      <Stack.Screen name="WordSetExtracting" component={WordSetExtractingScreen} />
      <Stack.Screen name="WordSelection" component={WordSelectionScreen} />
      <Stack.Screen name="WordSetName" component={WordSetNameScreen} />
      <Stack.Screen name="WordSetDetail" component={WordSetDetailScreen} />
      <Stack.Screen name="WordSetRename" component={WordSetNameScreen} />
      <Stack.Screen name="WordIntro" component={WordIntroScreen} />
      <Stack.Screen name="RetestLevel" component={ProfileLevelTestScreen} />
      <Stack.Screen name="RetestResult" component={ProfileLevelResultScreen} />
    </Stack.Navigator>
  );
}
