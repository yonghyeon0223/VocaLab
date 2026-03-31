import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextInput from '../components/ui/TextInput';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetName'>;
};

const MAX_NAME_LENGTH = 30;

export default function WordSetNameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_NAME_LENGTH;

  function handleNext() {
    if (!isValid) return;
    navigation.navigate('WordSetWords', { name: trimmed });
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
          <Text style={styles.title}>단어 세트 이름을{'\n'}지어주세요</Text>
        </View>

        <TextInput
          label="세트 이름"
          value={name}
          onChangeText={setName}
          placeholder="예: TOEIC 필수 단어"
          maxLength={MAX_NAME_LENGTH}
        />

        <Text style={styles.counter}>{trimmed.length} / {MAX_NAME_LENGTH}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="다음" onPress={handleNext} disabled={!isValid} />
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
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  counter: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
