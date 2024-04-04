import { Text, StyleSheet } from "react-native";
import React from "react";

type LabelProps = {
  text: string;
};

const Label = ({ text }: LabelProps) => {
  return <Text style={styles.label}>{text}</Text>;
};

export default Label;

const styles = StyleSheet.create({
  label: {
    color: "#404040",
    fontWeight: "500",
    fontSize: 12,
  },
});
