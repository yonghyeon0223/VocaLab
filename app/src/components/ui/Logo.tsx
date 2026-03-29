import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
};

const SIZE_MAP = {
  small:  { mark: 28, name: 16 },
  medium: { mark: 40, name: 22 },
  large:  { mark: 56, name: 30 },
};

// 로고마크(V 심볼)와 VocaLab 텍스트로 구성된 로고.
// size prop으로 화면별로 크기를 조절할 수 있다.
export default function Logo({ size = 'medium' }: LogoProps) {
  const { mark, name } = SIZE_MAP[size];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.markBox, { width: mark * 1.2, height: mark * 1.2, borderRadius: mark * 0.28 }]}>
        <Text style={[styles.mark, { fontSize: mark }]}>V</Text>
      </View>
      <Text style={[styles.name, { fontSize: name }]}>VocaLab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  markBox: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    color: '#ffffff',
    fontWeight: '700',
  },
  name: {
    color: colors.text.primary,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
