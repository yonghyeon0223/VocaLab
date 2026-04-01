import { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>사진을 촬영하세요</Text>
      <Text style={styles.subtitle}>
        교재, 시험지, 단어장 등 영어가 포함된 페이지를{'\n'}
        촬영하거나 갤러리에서 선택하세요. 최대 {MAX_PHOTOS}장까지 추가할 수 있어요.
      </Text>

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
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(index)}>
                  <Ionicons name="close-circle" size={28} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          />
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label="다음"
          onPress={() => navigation.navigate('WordSetWordCount', { type: 'photo', photos })}
          disabled={photos.length < 1}
        />
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
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    marginTop: 'auto',
  },
});
