import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

type H2Props = {
  children?: React.ReactNode;
  accent?: boolean;
  cursive?: boolean;
};

const H2 = ({ children, accent, cursive }: H2Props) => {
  return <Text style={[styles.H2, accent && styles.accent, cursive && styles.cursive]}>{children}</Text>;
};

export default H2;

const styles = StyleSheet.create({
  H2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#404040'
  },
  accent: {
    color: '#16a34a'
  },
  cursive: {
    fontFamily: 'Caveat',
    fontWeight: 'normal',
    fontSize: 26
  }
});
