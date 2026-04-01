import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { colors } from '../constants/colors';
import { extractWords } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import Button from '../components/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetPhotoInput'>;
};

const MAX_PHOTOS = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WordSetPhotoInputScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordCountText, setWordCountText] = useState('20');
  const wordCount = Math.min(100, Math.max(1, parseInt(wordCountText, 10) || 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  async function pickImage(fromCamera: boolean) {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('최대 장수 초과', `사진은 최대 ${MAX_PHOTOS}장까지 추가할 수 있어요.`);
      return;
    }

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', fromCamera ? '카메라 권한이 필요합니다.' : '사진 접근 권한이 필요합니다.');
      return;
    }

    const remaining = MAX_PHOTOS - photos.length;
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          allowsMultipleSelection: true,
          selectionLimit: remaining,
        });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri).slice(0, remaining);
      setPhotos((prev) => [...prev, ...newUris]);
    }
  }

  function handleDelete(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= photos.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  async function handleExtract() {
    if (photos.length < 1) return;
    setLoading(true);
    setError('');
    try {
      // URI를 base64로 변환한다.
      const images: string[] = [];
      for (const uri of photos) {
        const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
        images.push(base64);
      }

      const result = await extractWords({ type: 'photo', images, wordCount });
      if (result.words.length < 1) {
        setError('추출할 수 있는 단어가 없어요. 다른 사진을 촬영해보세요.');
        return;
      }
      navigation.navigate('WordSelection', { words: result.words, source: 'photo' });
    } catch {
      setError('단어 추출에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>사진을 촬영하세요</Text>

      {/* 사진 카드 슬라이더 */}
      {photos.length > 0 ? (
        <>
          <FlatList
            data={photos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item, index }) => (
              <View style={styles.photoSlide}>
                <Image source={{ uri: item }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(index)}
                >
                  <Ionicons name="close-circle" size={28} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          />
          {/* 도트 인디케이터 */}
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="images-outline" size={48} color={colors.text.disabled} />
          <Text style={styles.emptyText}>사진을 추가해주세요</Text>
        </View>
      )}

      <Text style={styles.counter}>{photos.length} / {MAX_PHOTOS}장</Text>

      {/* 촬영/갤러리 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={22} color={colors.accent} />
          <Text style={styles.actionBtnText}>촬영</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(false)} activeOpacity={0.7}>
          <Ionicons name="image-outline" size={22} color={colors.accent} />
          <Text style={styles.actionBtnText}>갤러리</Text>
        </TouchableOpacity>
      </View>

      {/* 추출할 단어 수 */}
      <View style={styles.wordCountRow}>
        <Text style={styles.wordCountLabel}>추출할 핵심 단어 수</Text>
        <View style={styles.wordCountControl}>
          <RNTextInput
            style={styles.wordCountInput}
            value={wordCountText}
            onChangeText={setWordCountText}
            keyboardType="number-pad"
            maxLength={3}
            textAlign="center"
            selectTextOnFocus
          />
          <Text style={styles.wordCountUnit}>개 (최대 100)</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>단어를 분석하고 있어요</Text>
          </View>
        ) : (
          <Button label="단어 추출하기" onPress={handleExtract} disabled={photos.length < 1} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
    paddingHorizontal: 24,
  },
  photoSlide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
  },
  photoImage: {
    width: '100%',
    height: 260,
    borderRadius: 14,
    backgroundColor: colors.background.secondary,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 32,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 20,
  },
  emptyCard: {
    marginHorizontal: 24,
    height: 200,
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.disabled,
  },
  counter: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent + '18',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  wordCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  wordCountLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  wordCountControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordCountInput: {
    width: 56,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  wordCountUnit: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  error: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    marginTop: 'auto',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
