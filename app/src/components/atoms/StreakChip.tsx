import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Row from './Row';

type StreakChipProps = {
  streak: number;
};

const StreakChip = ({ streak }: StreakChipProps) => {
  return (
    <Row styles={styles.streakChip}>
      <Text style={styles.streakChipText}>{streak} 🔥</Text>
    </Row>
  );
};

export default StreakChip;

const styles = StyleSheet.create({
  streakChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#16a34a'
  },
  streakChipText: {
    color: 'white',
    fontWeight: '600'
  }
});
