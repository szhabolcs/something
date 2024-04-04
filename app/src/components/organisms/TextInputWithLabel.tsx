import { View, Text } from "react-native";
import React from "react";
import Label from "../atoms/Label";
import Column from "../atoms/Column";
import MyInput from "../molecules/MyInput";

type TextInputWithLabelProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  error?: string;
  multiline?: boolean;
};

const TextInputWithLabel = ({
  label,
  placeholder,
  value,
  onChangeText,
  secure,
  error,
  multiline,
}: TextInputWithLabelProps) => {
  return (
    <Column styles={{ gap: 5 }}>
      <Label text={label} />
      <MyInput
        secure={secure}
        text={value}
        setText={onChangeText}
        placeholder={placeholder}
        error={error ? true : false}
      />
    </Column>
  );
};

export default TextInputWithLabel;
