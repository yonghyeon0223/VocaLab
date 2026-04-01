import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetInputMethod'>;
};

export default function WordSetInputMethodScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <Text style={styles.title}>어떤 방식으로{'\n'}단어를 추가할까요?</Text>

      <View style={styles.cards}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('WordSetTextInput')}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={32} color={colors.accent} />
          <Text style={styles.cardTitle}>직접 입력</Text>
          <Text style={styles.cardDesc}>단어 리스트, 영어 가사, 교과서 지문 등{'\n'}텍스트를 붙여넣거나 입력하세요</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('WordSetPhotoInput')}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={32} color={colors.accent} />
          <Text style={styles.cardTitle}>사진 촬영</Text>
          <Text style={styles.cardDesc}>교재, 프린트, 화면 등을{'\n'}촬영하면 단어를 자동 추출해요</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
    marginBottom: 32,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
