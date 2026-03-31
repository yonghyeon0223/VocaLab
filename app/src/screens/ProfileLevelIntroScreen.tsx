import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileLevelIntro'>;
};

// 각 슬라이드: 큰 타이틀 + 설명으로 VocaLab 설계 철학을 한 장씩 보여준다.
const SLIDES = [
  {
    title: '예문으로\n단어를 배워요',
    description: 'VocaLab은 단어를 예문 안에서\n읽고, 듣고, 말하고, 쓰면서\n완전히 체화하도록 설계됐어요.',
    color: colors.accent,
  },
  {
    title: '쉬운 문장부터\n자연스럽게',
    description: '처음 만나는 단어는 쉬운 문장에서\n부담 없이 친해질 수 있어요.',
    color: '#4caf7d',
    label: '처음 만날 때',
  },
  {
    title: '내 수준에서\n실전 연습',
    description: '내 수준의 문장에서 단어를\n직접 써보며 실력을 키워요.',
    color: '#6c63ff',
    label: '실전 적용',
  },
  {
    title: '한 단계 위에\n도전하기',
    description: '어려운 문장에 도전하면서\n단어와 함께 영어 실력도 올려요.',
    color: '#e8a838',
    label: '심화',
  },
  {
    title: '내 수준에 맞는\n예문을 알아볼게요',
    description: '간단한 문장 평가로\n딱 맞는 난이도를 찾아드릴게요.',
    color: colors.accent,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 24;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;

export default function ProfileLevelIntroScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <FlatList
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {item.label && (
              <View style={[styles.badge, { backgroundColor: item.color + '22' }]}>
                <Text style={[styles.badgeText, { color: item.color }]}>{item.label}</Text>
              </View>
            )}
            <Text style={[styles.slideTitle, { color: item.color }]}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
      />

      {/* 도트 인디케이터 */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* 마지막 슬라이드에서만 버튼 활성화 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label={isLastSlide ? '문장 보러 가기' : '넘겨서 계속 읽기'}
          onPress={() => navigation.navigate('ProfileLevelTest')}
          disabled={!isLastSlide}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: CARD_MARGIN,
    justifyContent: 'center',
    flex: 1,
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 44,
  },
  slideDescription: {
    fontSize: 17,
    color: colors.text.secondary,
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});
