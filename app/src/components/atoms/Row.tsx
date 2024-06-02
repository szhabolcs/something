import { ViewStyle, StyleSheet, View } from 'react-native';
import React from 'react';

type RowProps = {
  children?: React.ReactNode;
  styles?: ViewStyle;
};

const Row = ({ children, styles }: RowProps) => {
  return <View style={[RowStyles.row, styles]}>{children}</View>;
};

export default Row;

const RowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  }
});
