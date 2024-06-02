import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Row from '../atoms/Row';
import Label from '../atoms/Label';
import { ChevronRight } from 'react-native-feather';

type ActionRowProps = {
  label: string;
  action: () => void;
};

const ActionRow = ({ label, action }: ActionRowProps) => {
  return (
    <Pressable onPress={action}>
      <Row
        styles={{
          justifyContent: 'space-between',
          padding: 15,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
          borderTopColor: '#f0f0f0'
        }}
      >
        <Label text={label} />
        <ChevronRight color={'black'} />
      </Row>
    </Pressable>
  );
};

export default ActionRow;

const styles = StyleSheet.create({});
