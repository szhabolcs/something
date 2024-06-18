import { StyleSheet, Text } from 'react-native';

type Props = {
  children: React.ReactNode;
};

const styles = StyleSheet.create({
  default: {
    color: 'red'
  }
});

export default ({ children }: Props) => {
  return <Text style={styles.default}>{children}</Text>;
};
