import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { LEVEL_LABELS } from '../constants/levels';
import TextInput from '../components/ui/TextInput';
import Button from '../components/ui/Button';
import { useProfileStore } from '../stores/profileStore';
import { useWordSetStore } from '../stores/wordSetStore';
import { updateProfile } from '../services/profileService';
import { logout } from '../services/authService';
import { MainStackParamList } from '../navigation/MainTabNavigator';
import api from '../services/api';
import { useLevelTestStore } from '../stores/levelTestStore';

// 프로필 화면에서 사용할 학습 목적 그룹 (ProfilePurposeScreen과 동일)
const PURPOSE_GROUPS = [
  { label: '일상 · 생활', items: ['생활 영어', '실전 회화', '여행 영어'] },
  { label: '학교 · 수험', items: ['교과서 내신', '수능 준비', '편입 영어', 'SAT'] },
  { label: '공인 시험', items: ['TOEIC', 'TOEFL', 'IELTS', 'TEPS', 'OPIc', 'GRE'] },
  { label: '전공 · 직군', items: ['비즈니스', '금융 및 경제', '법률', '의학 및 보건', 'IT 및 개발', '과학 연구', '공학', '예술 및 디자인'] },
  { label: '영미권 콘텐츠', items: ['미드', '영화', '게임', '커뮤니티', '스포츠', '시사 및 뉴스', '팝송', '유튜브', '팟캐스트', '영어 원서', '다큐멘터리'] },
];

const MAX_PURPOSE = 5;
const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);
const TABS = ['기본', '학습 목적', '예문 난이도'] as const;
type TabName = typeof TABS[number];

// 구간별 색상
const ZONE_COLORS = {
  easy: '#4caf7d',
  active: '#6c63ff',
  hard: '#e8a838',
};

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('기본');

  // --- 기본 탭 상태 ---
  const storeNickname = useProfileStore((s) => s.nickname);
  const [nickname, setNickname] = useState(storeNickname);
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSaved, setNicknameSaved] = useState(false);

  // --- 학습 목적 탭 상태 ---
  const storePurposes = useProfileStore((s) => s.purposes);
  const [purposes, setPurposes] = useState<string[]>(storePurposes);

  // --- 난이도 탭 상태 ---
  const storeEasy = useProfileStore((s) => s.easyLevel);
  const storeActive = useProfileStore((s) => s.activeLevel);
  const storeHard = useProfileStore((s) => s.hardLevel);
  const [easyLevel, setEasyLevel] = useState(storeEasy);
  const [activeLevel, setActiveLevel] = useState(storeActive);
  const [hardLevel, setHardLevel] = useState(storeHard);

  // 예문 미리보기 상태
  const [previewSentence, setPreviewSentence] = useState<{ text: string; translation: string } | null>(null);
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);

  // 토스트
  const [toast, setToast] = useState('');

  // store에서 값이 바뀌면 로컬 상태도 동기화한다 (다른 화면에서 돌아왔을 때).
  useEffect(() => { setNickname(storeNickname); }, [storeNickname]);
  useEffect(() => { setPurposes(storePurposes); }, [storePurposes]);
  useEffect(() => { setEasyLevel(storeEasy); }, [storeEasy]);
  useEffect(() => { setActiveLevel(storeActive); }, [storeActive]);
  useEffect(() => { setHardLevel(storeHard); }, [storeHard]);

  // 이전 탭 추적: 탭 전환 시 변경사항이 있으면 자동 저장한다.
  const prevTabRef = useRef<TabName>(activeTab);

  // 화면 이탈 시 autoSave가 최신 state를 읽을 수 있도록 ref에 보관한다.
  const stateRef = useRef({ activeTab, nickname, storeNickname, purposes, storePurposes, easyLevel, storeEasy, activeLevel, storeActive, hardLevel, storeHard });
  stateRef.current = { activeTab, nickname, storeNickname, purposes, storePurposes, easyLevel, storeEasy, activeLevel, storeActive, hardLevel, storeHard };

  // 화면 포커스 해제(홈 탭 이동 등) 시 현재 탭의 변경사항을 저장한다.
  useFocusEffect(
    useCallback(() => {
      return () => {
        const s = stateRef.current;
        const tab = s.activeTab;
        if (tab === '기본') {
          const trimmed = s.nickname.trim();
          if (trimmed && trimmed !== s.storeNickname) {
            updateProfile({ nickname: trimmed }).catch(() => {});
          }
        } else if (tab === '학습 목적') {
          if (JSON.stringify(s.purposes) !== JSON.stringify(s.storePurposes) && s.purposes.length >= 1) {
            updateProfile({ purposes: s.purposes }).catch(() => {});
          }
        } else if (tab === '예문 난이도') {
          if (s.easyLevel !== s.storeEasy || s.activeLevel !== s.storeActive || s.hardLevel !== s.storeHard) {
            updateProfile({ easyLevel: s.easyLevel, activeLevel: s.activeLevel, hardLevel: s.hardLevel }).catch(() => {});
          }
        }
      };
    }, []),
  );

  function handleTabChange(tab: TabName) {
    autoSave(prevTabRef.current);
    prevTabRef.current = tab;
    setActiveTab(tab);
  }

  // 탭별 변경사항 감지 후 서버 저장
  async function autoSave(tab: TabName) {
    try {
      if (tab === '기본') {
        const trimmed = nickname.trim();
        if (trimmed && trimmed !== storeNickname) {
          await updateProfile({ nickname: trimmed });
        }
      } else if (tab === '학습 목적') {
        const changed = JSON.stringify(purposes) !== JSON.stringify(storePurposes);
        if (changed && purposes.length >= 1) {
          await updateProfile({ purposes });
        }
      } else if (tab === '예문 난이도') {
        const changed = easyLevel !== storeEasy || activeLevel !== storeActive || hardLevel !== storeHard;
        if (changed) {
          await updateProfile({ easyLevel, activeLevel, hardLevel });
        }
      }
    } catch {
      showToast('저장에 실패했어요. 다시 시도해주세요.');
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // --- 기본 탭 ---
  async function handleNicknameSave() {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError('닉네임을 입력해주세요');
      return;
    }
    if (trimmed.length > 10) {
      setNicknameError('닉네임은 10자 이하로 입력해주세요');
      return;
    }
    try {
      await updateProfile({ nickname: trimmed });
      setNicknameError('');
      setNicknameSaved(true);
      setTimeout(() => setNicknameSaved(false), 2000);
    } catch {
      showToast('저장에 실패했어요. 다시 시도해주세요.');
    }
  }

  async function handleLogout() {
    await logout();
    useWordSetStore.getState().reset();
  }

  // --- 학습 목적 탭 ---
  function handlePurposeToggle(item: string) {
    setPurposes((prev) => {
      if (prev.includes(item)) {
        if (prev.length === 1) return prev;
        return prev.filter((p) => p !== item);
      }
      if (prev.length >= MAX_PURPOSE) return prev;
      return [...prev, item];
    });
  }

  // --- 난이도 탭 ---
  // easyLevel <= activeLevel <= hardLevel 역전 방지
  function handleSetEasy(lv: number) {
    setEasyLevel(lv);
    if (lv > activeLevel) setActiveLevel(lv);
    if (lv > hardLevel) setHardLevel(lv);
    fetchPreview(lv);
  }

  function handleSetActive(lv: number) {
    setActiveLevel(lv);
    if (lv < easyLevel) setEasyLevel(lv);
    if (lv > hardLevel) setHardLevel(lv);
    fetchPreview(lv);
  }

  function handleSetHard(lv: number) {
    setHardLevel(lv);
    if (lv < activeLevel) setActiveLevel(lv);
    if (lv < easyLevel) setEasyLevel(lv);
    fetchPreview(lv);
  }

  // 레벨 선택 시 해당 레벨 예문을 가져온다.
  async function fetchPreview(level: number) {
    setPreviewLevel(level);
    try {
      const res = await api.get(`/api/sentences/test?level=${level}`);
      const sentences = res.data.data.sentences as { text: string; translation: string }[];
      if (sentences.length > 0) {
        const random = sentences[Math.floor(Math.random() * sentences.length)];
        setPreviewSentence(random);
      }
    } catch {
      setPreviewSentence(null);
    }
  }

  function handleRetakeTest() {
    autoSave(activeTab);
    // 이전 테스트 데이터를 지워 깨끗한 상태로 시작한다.
    useLevelTestStore.getState().reset();
    navigation.navigate('ProfileLevelTest');
  }

  // --- 렌더링 ---
  function renderBasicTab() {
    return (
      <ScrollView contentContainerStyle={styles.tabBody} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <TextInput
            label="닉네임"
            value={nickname}
            onChangeText={(v) => { setNickname(v); setNicknameSaved(false); }}
            error={nicknameError}
            maxLength={10}
          />
          <Button
            label={nicknameSaved ? '저장됨' : '닉네임 변경'}
            onPress={handleNicknameSave}
            disabled={nickname.trim() === storeNickname || nicknameSaved}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>비밀번호</Text>
          <Text style={styles.fieldHint}>비밀번호 변경 기능은 준비 중이에요</Text>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  function renderPurposeTab() {
    const isMax = purposes.length >= MAX_PURPOSE;
    return (
      <ScrollView contentContainerStyle={styles.tabBody} showsVerticalScrollIndicator={false}>
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            <Text style={[styles.counterNum, isMax && styles.counterMax]}>{purposes.length}</Text>
            {' '}/ {MAX_PURPOSE}
          </Text>
        </View>

        {PURPOSE_GROUPS.map((group) => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.chips}>
              {group.items.map((item) => {
                const isSelected = purposes.includes(item);
                const isDisabled = !isSelected && isMax;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.chipSelected, isDisabled && styles.chipDisabled]}
                    onPress={() => handlePurposeToggle(item)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected, isDisabled && styles.chipTextDisabled]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  function renderLevelRow(label: string, color: string, value: number, onSelect: (lv: number) => void) {
    return (
      <View style={styles.levelSection}>
        <View style={styles.levelHeader}>
          <View style={[styles.levelDot, { backgroundColor: color }]} />
          <Text style={styles.levelLabel}>{label}</Text>
          <Text style={[styles.levelValue, { color }]}>lv.{value}</Text>
        </View>
        <View style={styles.levelButtons}>
          {LEVELS.map((lv) => {
            const isActive = lv === value;
            return (
              <TouchableOpacity
                key={lv}
                style={[styles.levelBtn, isActive && { backgroundColor: color }]}
                onPress={() => onSelect(lv)}
                activeOpacity={0.7}
              >
                <Text style={[styles.levelBtnText, isActive && styles.levelBtnTextActive]}>{lv}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  function renderLevelTab() {
    return (
      <ScrollView contentContainerStyle={styles.tabBody} showsVerticalScrollIndicator={false}>
        {renderLevelRow('처음 만날 때', ZONE_COLORS.easy, easyLevel, handleSetEasy)}
        {renderLevelRow('실전 적용', ZONE_COLORS.active, activeLevel, handleSetActive)}
        {renderLevelRow('심화', ZONE_COLORS.hard, hardLevel, handleSetHard)}

        {/* 예문 미리보기 */}
        {previewSentence && previewLevel && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>lv.{previewLevel} · {LEVEL_LABELS[previewLevel]}</Text>
            <Text style={styles.previewText}>{previewSentence.text}</Text>
            <Text style={styles.previewTranslation}>{previewSentence.translation}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.retestButton} onPress={handleRetakeTest} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={18} color={colors.accent} />
          <Text style={styles.retestText}>예문 난이도 테스트 받기</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.screenTitle}>프로필</Text>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => handleTabChange(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 내용 */}
      {activeTab === '기본' && renderBasicTab()}
      {activeTab === '학습 목적' && renderPurposeTab()}
      {activeTab === '예문 난이도' && renderLevelTab()}

      {/* 토스트 */}
      {toast ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom, 16) + 60 }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  // --- 탭 바 ---
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  // --- 공통 탭 바디 ---
  tabBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
    gap: 24,
  },
  // --- 기본 탭 ---
  field: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  fieldHint: {
    fontSize: 14,
    color: colors.text.disabled,
  },
  logoutSection: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.error,
  },
  // --- 학습 목적 탭 ---
  counterRow: {
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: 14,
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
    fontSize: 14,
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
    backgroundColor: colors.accent + '1a',
  },
  chipDisabled: {
    borderColor: colors.background.tertiary,
    backgroundColor: colors.background.primary,
  },
  chipText: {
    fontSize: 14,
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
  // --- 난이도 탭 ---
  levelSection: {
    gap: 10,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  levelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  levelValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  levelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  levelBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  levelBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  previewCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: 24,
  },
  previewTranslation: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  retestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  retestText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent,
  },
  // --- 토스트 ---
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  toastText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
