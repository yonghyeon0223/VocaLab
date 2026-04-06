import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { colors } from '../constants/colors';
import { extractWords } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetExtracting'>;
  route: RouteProp<MainStackParamList, 'WordSetExtracting'>;
};

// 예상 소요 시간(초)을 계산한다.
function estimateSeconds(type: 'text' | 'photo', wordCount: number, photoCount: number): number {
  if (type === 'photo') {
    return Math.round((photoCount * 8 + wordCount * 0.3) * 1.2);
  }
  return Math.round((5 + wordCount * 0.3) * 1.2);
}

type Stage = 'preparing' | 'uploading' | 'analyzing' | 'done';

const STAGE_MESSAGES: Record<Stage, string> = {
  preparing: '사진을 준비하고 있어요',
  uploading: '서버에 전송하고 있어요',
  analyzing: 'AI가 핵심 단어를 분석하고 있어요',
  done: '거의 다 됐어요',
};

export default function WordSetExtractingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const params = route.params;
  const [elapsed, setElapsed] = useState(0);
  const [stage, setStage] = useState<Stage>(params.type === 'photo' ? 'preparing' : 'uploading');
  const [error, setError] = useState('');
  const abortedRef = useRef(false);

  const source = params.type === 'text' ? 'manual' : 'photo';
  const photoCount = params.type === 'photo' ? params.photos.length : 0;
  const estimateSec = estimateSeconds(params.type, params.wordCount, photoCount);
  const estimateStr = `약 ${estimateSec}~${Math.round(estimateSec * 1.5)}초`;
  const statusMessage = STAGE_MESSAGES[stage];

  // 경과 시간 카운터
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 화면 진입 시 즉시 추출 시작
  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        let input: { type: 'text'; text: string; wordCount: number } | { type: 'photo'; images: string[]; wordCount: number };

        if (params.type === 'text') {
          input = { type: 'text', text: params.text, wordCount: params.wordCount };
        } else {
          // 사진 → base64 변환 (preparing 단계)
          const images: string[] = [];
          for (const uri of params.photos) {
            const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
            images.push(base64);
          }
          input = { type: 'photo', images, wordCount: params.wordCount };
        }

        // 서버 전송 + AI 분석 시작
        setStage('uploading');
        // 약간의 딜레이 후 analyzing으로 전환 (업로드는 빠르게 끝남)
        setTimeout(() => setStage('analyzing'), 2000);

        const result = await extractWords(input);
        setStage('done');

        if (!mounted || abortedRef.current) return;

        if (result.words.length < 1) {
          setError('추출할 수 있는 단어가 없어요. 다른 내용으로 시도해보세요.');
          return;
        }

        navigation.replace('WordSelection', { words: result.words, source });
      } catch {
        if (!mounted || abortedRef.current) return;
        setError('단어 찾기에 실패했어요. 다시 시도해주세요.');
      }
    }

    run();
    return () => { mounted = false; };
  }, []);

  function handleGoBack() {
    abortedRef.current = true;
    navigation.goBack();
  }

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const elapsedStr = minutes > 0
    ? `${minutes}분 ${String(seconds).padStart(2, '0')}초`
    : `${seconds}초`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {error ? (
          <>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button label="돌아가기" onPress={handleGoBack} />
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.statusMessage}>{statusMessage}</Text>
            <Text style={styles.elapsed}>{elapsedStr} 경과</Text>
            <Text style={styles.estimate}>예상 소요 시간: {estimateStr}</Text>
          </>
        )}
      </View>

      {!error && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button label="취소" onPress={handleGoBack} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  elapsed: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  estimate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
