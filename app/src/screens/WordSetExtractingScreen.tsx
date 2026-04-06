import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { extractSpellings, generateMeanings } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetExtracting'>;
  route: RouteProp<MainStackParamList, 'WordSetExtracting'>;
};

type Stage = 'uploading' | 'extracting' | 'extracted' | 'meanings' | 'done' | 'error';

const STAGE_LABELS: Record<Stage, string> = {
  uploading: '서버에 전송하고 있어요',
  extracting: '핵심 단어를 추출하고 있어요',
  extracted: '단어 추출 완료',
  meanings: '뜻을 분석하고 있어요',
  done: '완료',
  error: '오류 발생',
};

export default function WordSetExtractingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const params = route.params;
  const [stage, setStage] = useState<Stage>('uploading');
  const [spellings, setSpellings] = useState<string[]>([]);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [error, setError] = useState('');
  const abortedRef = useRef(false);

  const source = params.type === 'text' ? 'manual' : 'photo';
  // 사진 입력 시 원본 텍스트가 없으므로 AI가 추출한 단어만으로 뜻 생성
  const originalText = params.type === 'text' ? params.text : '';

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        // 1단계: 서버 전송 + 단어 추출
        setStage('uploading');

        let input: { type: 'text'; text: string; wordCount: number } | { type: 'photo'; images: string[]; wordCount: number };
        if (params.type === 'text') {
          input = { type: 'text', text: params.text, wordCount: params.wordCount };
        } else {
          const images: string[] = [];
          for (const uri of params.photos) {
            const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
            images.push(base64);
          }
          input = { type: 'photo', images, wordCount: params.wordCount };
        }

        if (!mounted || abortedRef.current) return;
        setStage('extracting');

        const extractResult = await extractSpellings(input);

        if (!mounted || abortedRef.current) return;

        if (extractResult.spellings.length < 1) {
          setError('추출할 수 있는 단어가 없어요. 다른 내용으로 시도해보세요.');
          setStage('error');
          return;
        }

        // 추출된 단어 목록 + 추천 제목 저장
        const extracted = extractResult.spellings.slice(0, 100);
        setSpellings(extracted);
        if (extractResult.title) setSuggestedTitle(extractResult.title);
        setStage('extracted');

        // 잠깐 보여준 후 뜻 추출로 넘어감
        await new Promise((r) => setTimeout(r, 1500));
        if (!mounted || abortedRef.current) return;

        // 2단계: 뜻 생성
        setStage('meanings');

        const meaningsResult = await generateMeanings(
          originalText || extracted.join(', '),
          extracted,
        );

        if (!mounted || abortedRef.current) return;

        if (meaningsResult.words.length < 1) {
          setError('뜻 추출에 실패했어요. 다시 시도해주세요.');
          setStage('error');
          return;
        }

        setStage('done');
        navigation.replace('WordSelection', { words: meaningsResult.words.slice(0, 100), source, suggestedTitle });
      } catch {
        if (!mounted || abortedRef.current) return;
        setError('단어 찾기에 실패했어요. 다시 시도해주세요.');
        setStage('error');
      }
    }

    run();
    return () => { mounted = false; };
  }, []);

  function handleGoBack() {
    abortedRef.current = true;
    navigation.goBack();
  }

  // 단계별 아이콘
  function stageIcon(target: Stage, current: Stage) {
    const order: Stage[] = ['uploading', 'extracting', 'extracted', 'meanings', 'done'];
    const targetIdx = order.indexOf(target);
    const currentIdx = order.indexOf(current);

    if (current === 'error') {
      return <Ionicons name="alert-circle" size={20} color={colors.error} />;
    }
    if (currentIdx > targetIdx) {
      return <Ionicons name="checkmark-circle" size={20} color="#4caf7d" />;
    }
    if (currentIdx === targetIdx) {
      return <ActivityIndicator size="small" color={colors.accent} />;
    }
    return <Ionicons name="ellipse-outline" size={20} color={colors.text.disabled} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 단계 표시 */}
        <View style={styles.steps}>
          <View style={styles.stepRow}>
            {stageIcon('uploading', stage)}
            <Text style={[styles.stepText, (stage === 'uploading') && styles.stepTextActive]}>
              서버 전송
            </Text>
          </View>
          <View style={styles.stepRow}>
            {stageIcon('extracting', stage)}
            <Text style={[styles.stepText, (stage === 'extracting') && styles.stepTextActive]}>
              단어 추출
            </Text>
          </View>
          <View style={styles.stepRow}>
            {stageIcon('meanings', stage)}
            <Text style={[styles.stepText, (stage === 'meanings') && styles.stepTextActive]}>
              뜻 분석
            </Text>
          </View>
        </View>

        {/* 현재 상태 메시지 */}
        <Text style={styles.statusMessage}>{STAGE_LABELS[stage]}</Text>

        {/* 추출된 단어 목록 (extracted 이후 표시) */}
        {spellings.length > 0 && (
          <View style={styles.wordList}>
            <Text style={styles.wordListTitle}>{spellings.length}개 단어 추출됨</Text>
            <View style={styles.wordChips}>
              {spellings.map((w, i) => (
                <View key={`${w}-${i}`} style={styles.wordChip}>
                  <Text style={styles.wordChipText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 에러 */}
        {stage === 'error' && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
            <Button label="돌아가기" onPress={handleGoBack} />
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  body: {
    paddingHorizontal: 24,
    gap: 24,
  },
  steps: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 16,
    color: colors.text.disabled,
    fontWeight: '500',
  },
  stepTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
  },
  wordList: {
    gap: 10,
  },
  wordListTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  wordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wordChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  wordChipText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  errorSection: {
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});
