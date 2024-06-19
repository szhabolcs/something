import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Column from '../atoms/Column';
import H3 from '../atoms/H3';
import Row from '../atoms/Row';
import StreakChip from '../atoms/StreakChip';
import { DateTime } from 'luxon';

type ThingCardProps = {
  name: string;
  startTime: string;
  endTime: string;
  streak: number;
  id: string;
  navigation?: any;
};

const ThingCard = ({ navigation, name, startTime, endTime, streak, id }: ThingCardProps) => {
  startTime = DateTime.fromFormat(startTime, 'hh:mm:ss', { zone: 'utc'}).toLocal().toLocaleString({ hour: 'numeric', minute: 'numeric' });
  endTime = DateTime.fromFormat(endTime, 'hh:mm:ss', { zone: 'utc'}).toLocal().toLocaleString({ hour: 'numeric', minute: 'numeric' });

  return (
    <Pressable
      onPress={() => {
        navigation && navigation.navigate('Details', { thingId: id, streakCount: streak });
      }}
    >
      <Column styles={styles.container}>
        <Row styles={{ justifyContent: 'space-between' }}>
          <H3>{name}</H3>
          <StreakChip streak={streak} />
        </Row>
        <Text style={styles.time}>
          {startTime} - {endTime}
        </Text>
      </Column>
    </Pressable>
  );
};

export default ThingCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16
  },
  time: {
    fontSize: 12,
    color: '#404040'
  }
});
