import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

type H1Props = {
  children: React.ReactNode;
  customColor?: TextStyle['color'];
  accent?: boolean;
};

const H1 = ({ children, customColor, accent }: H1Props) => {
  return (
    <Text style={[styles.h1, { color: customColor }, accent && styles.accent]}>
      {children}
    </Text>
  );
};

export default H1;

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#404040',
    textAlign: 'center'
  },
  accent: {
    color: '#16a34a'
  }
});
