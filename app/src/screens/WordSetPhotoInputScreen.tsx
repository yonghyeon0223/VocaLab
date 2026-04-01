import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

export default function WordSetPhotoInputScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<string[]>([]);

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
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>영어 교재 촬영</Text>
        <Text style={styles.subtitle}>교재, 단어장, 프린트 등을 촬영하거나 갤러리에서 선택하세요.</Text>

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

        {/* 사진 목록 — 세로 스크롤 */}
        {photos.length > 0 ? (
          <View style={styles.photoList}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoCard}>
                <Image source={{ uri }} style={styles.photoImage} />
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(i)}>
                  <Ionicons name="close-circle" size={26} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="images-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>아직 사진이 없어요</Text>
          </View>
        )}

        <Text style={styles.counter}>{photos.length} / {MAX_PHOTOS}장</Text>

        {/* 다음 버튼 — 스크롤 안에 배치 */}
        <Button
          label="다음"
          onPress={() => navigation.navigate('WordSetWordCount', { type: 'photo', photos })}
          disabled={photos.length < 1}
        />
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
  photoList: {
    gap: 12,
  },
  photoCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.background.secondary,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyCard: {
    height: 180,
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
});
