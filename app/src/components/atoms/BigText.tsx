import { StyleSheet, Text, View } from "react-native";
import React from "react";

type BigTextProps = {
  children: React.ReactNode;
  accent?: boolean;
  underLine?: boolean;
};

const BigText = ({ children, accent, underLine }: BigTextProps) => {
  return (
    <Text
      style={[
        styles.bigText,
        accent && styles.accent,
        underLine && styles.underLine,
      ]}
    >
      {children}
    </Text>
  );
};

export default BigText;

const styles = StyleSheet.create({
  bigText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#404040",
  },
  accent: {
    color: "#16a34a",
  },
  underLine: {
    textDecorationLine: "underline",
  },
});
