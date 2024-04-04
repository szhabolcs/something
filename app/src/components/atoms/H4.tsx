import { StyleSheet, Text, View } from "react-native";
import React from "react";

type H4Props = {
  children?: React.ReactNode;
  accent?: boolean;
  cursive?: boolean;
};

const H4 = ({ children, accent, cursive }: H4Props) => {
  return (
    <Text
      style={[
        styles.h4,
        accent && { color: "#16a34a" },
        cursive && styles.cursive,
      ]}
    >
      {children}
    </Text>
  );
};

export default H4;

const styles = StyleSheet.create({
  h4: {
    fontSize: 20,
    fontWeight: "700",
    color: "#404040",
  },
  cursive: {
    fontFamily: "Caveat",
    fontWeight: "normal",
    fontSize: 26,
  },
});
