import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

// 앱 전체에서 쓰는 기본 버튼.
// disabled 상태에서는 색이 흐려지고 터치가 막힌다.
export default function Button({ label, onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  disabled: {
    backgroundColor: colors.background.tertiary,
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  labelDisabled: {
    color: colors.text.disabled,
  },
});
