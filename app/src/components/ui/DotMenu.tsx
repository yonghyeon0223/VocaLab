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
};

export default function DotMenu({ items }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={22} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.menu}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: colors.background.secondary,
    borderRadius: 14,
    padding: 8,
    width: 220,
    gap: 2,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  menuText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  menuTextDestructive: {
    color: colors.error,
  },
});
