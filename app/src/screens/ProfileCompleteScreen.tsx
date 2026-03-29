import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/RootNavigator';
import { colors } from '../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ProfileComplete'>;
};

export default function ProfileCompleteScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ProfileCompleteScreen — 플레이스홀더</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});
