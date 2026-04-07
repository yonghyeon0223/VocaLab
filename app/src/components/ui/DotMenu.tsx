import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type MenuItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  items: MenuItem[];
  title?: string;
};

export default function DotMenu({ items, title }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={22} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            {title && <Text style={styles.sheetTitle}>{title}</Text>}
            {items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuItem}
                onPress={() => {
                  setVisible(false);
                  item.onPress();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuText, item.destructive && styles.menuTextDestructive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelItem}
              onPress={() => setVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginBottom: 4,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuText: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  menuTextDestructive: {
    color: colors.error,
  },
  cancelItem: {
    paddingVertical: 14,
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
