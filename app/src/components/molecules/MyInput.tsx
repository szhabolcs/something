import { error } from 'console';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

type MyInputProps = {
  text: string;
  setText: (text: string) => void;
  placeholder: string;
  secure?: boolean;
  multiline?: boolean;
  error?: boolean;
};

const MyInput = ({ text, setText, placeholder, secure, error, multiline }: MyInputProps) => {
  return (
    <TextInput
      placeholder={placeholder}
      style={[styles.input, error && styles.error]}
      onChangeText={setText}
      value={text}
      secureTextEntry={secure}
      multiline={multiline}
    />
  );
};

export default MyInput;

const styles = StyleSheet.create({
  input: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  error: {
    borderColor: 'red'
  }
});
