import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/MainTabNavigator';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'WordSetTextInput'>;
};

const MAX_CHARS = 5000;

export default function WordSetTextInputScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  const trimmed = text.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_CHARS;

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
          <Text style={styles.title}>영어 지문을 입력하세요</Text>
          <Text style={styles.subtitle}>
            교과서 지문, 단어 리스트, 팝송 가사 등{'\n'}영어 텍스트를 붙여넣거나 입력하세요.
          </Text>
        </View>

        <RNTextInput
          style={styles.textArea}
          value={text}
          onChangeText={setText}
          placeholder={'apple, banana, cherry...\n\nThe invention of the smartphone has changed the way people communicate...'}
          placeholderTextColor={colors.text.disabled}
          multiline
          textAlignVertical="top"
          maxLength={MAX_CHARS}
        />

        <Text style={styles.counter}>{trimmed.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}자</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label="다음"
          onPress={() => navigation.navigate('WordSetWordCount', { type: 'text', text: trimmed })}
          disabled={!isValid}
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
    flexGrow: 1,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 17,
    color: colors.text.secondary,
    lineHeight: 25,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
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
