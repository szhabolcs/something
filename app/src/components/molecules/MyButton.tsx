import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import Column from "../atoms/Column";
import H4 from "../atoms/H4";

type MyButtonProps = {
  text: string;
  onPress: () => void;
  accent?: boolean;
  small?: boolean;
  subLine?: string;
};

const MyButton = ({ text, onPress, accent, small, subLine }: MyButtonProps) => {
  if (small) {
    return (
      <Pressable onPress={onPress}>
        <Column styles={[]}>
          <H4 accent={accent}>{text}</H4>
        </Column>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Column styles={[styles.button, accent ? styles.accent : styles.button]}>
        <H4 accent={accent}>{text}</H4>
      </Column>
    </Pressable>
  );
};

export default MyButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  accent: {
    backgroundColor: "rgba(16, 185, 129, 0.5)",
  },
});
