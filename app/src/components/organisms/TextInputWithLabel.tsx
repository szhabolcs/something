import React from 'react';
import Label from '../atoms/Label';
import Column from '../atoms/Column';
import MyInput from '../molecules/MyInput';
import { ApiError, extractError } from '../../services/ApiService';
import ErrorText from '../atoms/ErrorText';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  error?: ApiError;
  path?: (string | number)[];
  multiline?: boolean;
};

const LabeledInput = ({ label, placeholder, value, onChangeText, secure, error, path, multiline }: Props) => {
  return (
    <Column styles={{ gap: 5 }}>
      <Label text={label} />
      <MyInput
        secure={secure}
        text={value}
        setText={onChangeText}
        placeholder={placeholder}
        error={!!extractError(error, path ?? [])}
        multiline={multiline}
      />
      <ErrorText>{extractError(error, path ?? [])}</ErrorText>
    </Column>
  );
};

export default LabeledInput;
