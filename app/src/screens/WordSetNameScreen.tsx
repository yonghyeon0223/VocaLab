import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextInput from '../components/ui/TextInput';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { createWordSet, updateWordSetName } from '../services/wordSetService';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetName' | 'WordSetRename'>;
};

const MAX_NAME_LENGTH = 30;

export default function WordSetNameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  // 편집 모드 여부를 route name으로 판단
  const isRenameMode = route.name === 'WordSetRename';
  const params = route.params as
    | { source: 'manual' | 'photo'; words: unknown[]; suggestedTitle?: string }
    | { setId: string; currentName: string };

  const initialName = isRenameMode
    ? (params as { currentName: string }).currentName
    : (params as { suggestedTitle?: string }).suggestedTitle ?? '';

  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_NAME_LENGTH;

  async function handleSave() {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      if (isRenameMode) {
        const { setId } = params as { setId: string };
        await updateWordSetName(setId, trimmed);
        navigation.goBack();
      } else {
        const { source, words } = params as { source: 'manual' | 'photo'; words: unknown[] };
        await createWordSet(trimmed, source, words as never);
        navigation.popToTop();
      }
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {isRenameMode ? '세트 이름 수정' : '단어 세트 이름을\n지어주세요'}
          </Text>
          {!isRenameMode && (
            <Text style={styles.subtitle}>
              {(params as { words: unknown[] }).words?.length ?? 0}개의 단어가 준비됐어요
            </Text>
          )}
        </View>

        <TextInput
          label="세트 이름"
          value={name}
          onChangeText={setName}
          placeholder="예: TOEIC 필수 단어"
          maxLength={MAX_NAME_LENGTH}
        />

        <Text style={styles.counter}>{trimmed.length} / {MAX_NAME_LENGTH}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label={loading ? '저장 중...' : '저장'}
          onPress={handleSave}
          disabled={!isValid || loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  body: {
    paddingHorizontal: 24,
    gap: 16,
  },
  titleBlock: {
    marginBottom: 8,
    gap: 6,
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
  },
  counter: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  error: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
