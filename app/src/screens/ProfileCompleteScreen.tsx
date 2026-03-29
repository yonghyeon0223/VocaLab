import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';
import { useProfileStore } from '../stores/profileStore';
import { completeProfile } from '../services/profileService';
import { LEVEL_LABELS } from '../constants/levels';
import { colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileComplete'>;
};

// 결과 카드에 표시할 구간 레이블과 store 키 매핑
const LEVEL_CARDS = [
  { label: '처음 만날 때', key: 'easyLevel' as const },
  { label: '실전 적용',    key: 'activeLevel' as const },
  { label: '심화',         key: 'hardLevel' as const },
];

export default function ProfileCompleteScreen({ navigation }: Props) {
  const { nickname, purposes, easyLevel, activeLevel, hardLevel } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 두 버튼 모두 profileCompleted: true 업데이트 후 메인 앱으로 이동한다.
  // RootNavigator가 profileCompleted 변화를 감지해 자동으로 메인 앱을 렌더링한다.
  async function handleComplete() {
    setLoading(true);
    setError('');
    try {
      await completeProfile();
      // profileCompleted가 true가 되면 RootNavigator가 메인 앱으로 전환하므로
      // 명시적인 navigate 호출 불필요
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
      setLoading(false);
    }
  }

  // 닉네임 첫 글자를 아바타로 사용한다. 한글/영문 모두 첫 글자를 대문자로 표기한다.
  const avatarChar = nickname.trim().charAt(0).toUpperCase() || '?';

  const levels = { easyLevel, activeLevel, hardLevel };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 닉네임 아바타 */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarChar}</Text>
          </View>
        </View>

        {/* 타이틀 */}
        <Text style={styles.title}>다 됐어요,{'\n'}{nickname}님!</Text>

        {/* 학습 목적 태그 */}
        {purposes.length > 0 && (
          <View style={styles.purposeSection}>
            <Text style={styles.sectionLabel}>학습 목적</Text>
            <View style={styles.purposeChips}>
              {purposes.map((p) => (
                <View key={p} style={styles.purposeChip}>
                  <Text style={styles.purposeChipText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 권장 학습 난이도 */}
        <View style={styles.levelSection}>
          <Text style={styles.sectionLabel}>권장 학습 난이도</Text>
          <View style={styles.levelCards}>
            {LEVEL_CARDS.map(({ label, key }) => {
              const lv = levels[key];
              return (
                <View key={key} style={styles.levelCard}>
                  <Text style={styles.levelCardLabel}>{label}</Text>
                  <Text style={styles.levelCardValue}>
                    lv.{lv}
                    <Text style={styles.levelCardSub}> — {LEVEL_LABELS[lv] ?? ''}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 안내 문구 */}
        <Text style={styles.hint}>
          프로필에서 난이도를 직접 조정하거나{'\n'}테스트를 다시 받을 수 있어요.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? '저장 중...' : '첫 단어 세트 만들기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>나중에 할게요</Text>
        </TouchableOpacity>
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
    gap: 28,
    alignItems: 'stretch',
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent + '33', // accent 20% opacity
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 40,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  purposeSection: {
    gap: 0,
  },
  purposeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.accent + '1a',
    borderWidth: 1,
    borderColor: colors.accent + '4d',
  },
  purposeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
  },
  levelSection: {
    gap: 0,
  },
  levelCards: {
    gap: 10,
  },
  levelCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: 4,
  },
  levelCardLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  levelCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  levelCardSub: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.primary,
  },
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: 'center',
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
