import { StyleSheet, Text, View } from "react-native";
import React from "react";

type H3Props = {
  children?: React.ReactNode;
  accent?: boolean;
  white?: boolean;
};

const H3 = ({ children, accent, white }: H3Props) => {
  return (
    <Text style={[styles.H3, accent && styles.accent, white && styles.white]}>
      {children}
    </Text>
  );
};

export default H3;

const styles = StyleSheet.create({
  H3: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#404040",
  },
  accent: {
    color: "#16a34a",
  },
  white: {
    color: "white",
  },
});
