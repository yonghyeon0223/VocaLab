import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';
import { updateProfile } from '../services/profileService';
import Button from '../components/ui/Button';
import { colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfilePurpose'>;
};

type PurposeGroup = {
  label: string;
  items: string[];
};

const PURPOSE_GROUPS: PurposeGroup[] = [
  {
    label: '일상 · 생활',
    items: ['생활 영어', '실전 회화', '여행 영어'],
  },
  {
    label: '학교 · 수험',
    items: ['교과서 내신', '수능 준비', '편입 영어', 'SAT'],
  },
  {
    label: '공인 시험',
    items: ['TOEIC', 'TOEFL', 'IELTS', 'TEPS', 'OPIc', 'GRE'],
  },
  {
    label: '전공 · 직군',
    items: ['비즈니스', '금융 및 경제', '법률', '의학 및 보건', 'IT 및 개발', '과학 연구', '공학', '예술 및 디자인'],
  },
  {
    label: '영미권 콘텐츠',
    items: ['미드', '영화', '게임', '커뮤니티', '스포츠', '시사 및 뉴스', '팝송', '유튜브', '팟캐스트', '영어 원서', '다큐멘터리'],
  },
];

const MAX_SELECT = 5;

export default function ProfilePurposeScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleToggle(item: string) {
    setSelected((prev) => {
      const isSelected = prev.includes(item);

      // 마지막 1개 칩은 해제 불가
      if (isSelected && prev.length === 1) return prev;

      if (isSelected) {
        return prev.filter((v) => v !== item);
      }

      // 5개 초과 선택 불가
      if (prev.length >= MAX_SELECT) return prev;

      return [...prev, item];
    });
  }

  async function handleNext() {
    setLoading(true);
    setError('');
    try {
      await updateProfile({ purposes: selected });
      navigation.navigate('ProfileComplete');
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const isMaxReached = selected.length >= MAX_SELECT;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>어떤 영어를{'\n'}배우고 싶어요?</Text>
          <Text style={styles.subtitle}>최대 5개까지 고를 수 있어요.</Text>
          <Text style={styles.hint}>선택한 목적에 맞는 예문이 더 자주 출제돼요.</Text>
        </View>

        {/* 선택 카운터 */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            <Text style={[styles.counterNum, isMaxReached && styles.counterMax]}>
              {selected.length}
            </Text>
            {' '}/ {MAX_SELECT}
          </Text>
        </View>

        {/* 목적 그룹 */}
        {PURPOSE_GROUPS.map((group) => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.chips}>
              {group.items.map((item) => {
                const isSelected = selected.includes(item);
                // 최대치 도달 시 선택하지 않은 칩 비활성
                const isDisabled = !isSelected && isMaxReached;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                      isDisabled && styles.chipDisabled,
                    ]}
                    onPress={() => handleToggle(item)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                        isDisabled && styles.chipTextDisabled,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={loading ? '저장 중...' : '다음'}
          onPress={handleNext}
          disabled={loading || selected.length === 0}
        />
      </View>
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
    paddingTop: 60,
    paddingBottom: 24,
    gap: 24,
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
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  counterRow: {
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  counterNum: {
    fontWeight: '700',
    color: colors.accent,
  },
  counterMax: {
    color: colors.error,
  },
  group: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '1a', // accent 10% opacity
  },
  chipDisabled: {
    borderColor: colors.background.tertiary,
    backgroundColor: colors.background.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  chipTextDisabled: {
    color: colors.text.disabled,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
});
