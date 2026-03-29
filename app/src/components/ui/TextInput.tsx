import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';

type TextInputProps = RNTextInputProps & {
  label?: string;
  error?: string;
};

// 기본 / 포커스 / 에러 세 가지 상태를 가진 입력창.
// 포커스 시 테두리가 accent 색으로 바뀌고,
// 에러가 있으면 error 색 테두리 + 에러 메시지가 아래에 표시된다.
export default function TextInput({ label, error, style, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  // 에러 > 포커스 > 기본 순으로 테두리 색을 결정한다
  const borderColor = error
    ? colors.error
    : focused
    ? colors.border.focused
    : colors.border.default;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor={colors.text.disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.text.primary,
  },
  error: {
    fontSize: 11,
    color: colors.error,
  },
});
