import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import TextInput from './TextInput';

type PasswordInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  showStrength?: boolean;
  placeholder?: string;
};

// 비밀번호 강도를 4단계로 판단한다.
// 길이 → 영문 → 숫자 → 특수문자 순으로 조건을 쌓아
// 충족한 조건 수만큼 강도 바를 채운다.
function getStrength(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Za-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_COLORS = ['#e24b4a', '#e2974a', '#e2d44a', '#4ae27a'];
const STRENGTH_LABELS = ['너무 짧아요', '조금 더 복잡하게', '거의 다 왔어요', '완벽해요!'];

export default function PasswordInput({
  label,
  value,
  onChangeText,
  error,
  showStrength = false,
  placeholder,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = getStrength(value);

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChangeText}
          error={error}
          secureTextEntry={!visible}
          placeholder={placeholder}
          style={styles.input}
        />
        {/* 비밀번호를 보이게/숨기게 전환하는 토글 버튼 */}
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={styles.toggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.toggleText}>{visible ? '숨김' : '표시'}</Text>
        </TouchableOpacity>
      </View>

      {/* 강도 바는 showStrength prop이 켜져 있고 값이 있을 때만 표시한다 */}
      {showStrength && value.length > 0 && (
        <View style={styles.strengthWrapper}>
          <View style={styles.bars}>
            {[1, 2, 3, 4].map((level) => (
              <View
                key={level}
                style={[
                  styles.bar,
                  { backgroundColor: strength >= level ? STRENGTH_COLORS[strength - 1] : colors.background.tertiary },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength - 1] }]}>
            {STRENGTH_LABELS[strength - 1]}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 8,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    paddingRight: 56,
  },
  toggle: {
    position: 'absolute',
    right: 16,
    bottom: 14,
  },
  toggleText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
  },
});
