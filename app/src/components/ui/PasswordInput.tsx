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

  // label과 error는 PasswordInput이 직접 렌더링한다.
  // TextInput에 넘기지 않아야 toggle 버튼이 입력창 안에서만 고정된다.
  // TextInput에 label/error까지 넘기면 wrapper 높이가 달라져 toggle 위치가 밀린다.
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* toggle은 입력창에만 겹쳐야 한다. inputBox 안에서만 절대 위치를 쓴다. */}
      <View style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          error={error}
          secureTextEntry={!visible}
          placeholder={placeholder}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={styles.toggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.toggleText}>{visible ? '숨김' : '표시'}</Text>
        </TouchableOpacity>
      </View>

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
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  inputBox: {
    position: 'relative',
  },
  input: {
    paddingRight: 56,
  },
  toggle: {
    position: 'absolute',
    right: 16,
    // 입력창 paddingVertical(14)의 중간에 맞춘다.
    // label과 error는 inputBox 밖에 있으므로 이 값이 밀리지 않는다.
    top: 14,
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
