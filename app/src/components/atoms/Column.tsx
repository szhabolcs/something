import { View, Text, ViewStyle, StyleSheet, ScrollView, SafeAreaView, StatusBar } from "react-native";
import React from "react";

type ColumProps = {
  children?: React.ReactNode;
  styles?: ViewStyle | ViewStyle[];
  scrollable?: boolean;
};

const Column = ({ children, styles, scrollable }: ColumProps) => {
  if (scrollable) {
    return (
      <SafeAreaView>
        <ScrollView>
          <View style={[ColumStyles.column, styles]}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <View style={[ColumStyles.column, styles]}>{children}</View>;
};

export default Column;

const ColumStyles = StyleSheet.create({
  column: {
    flexDirection: "column",
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
  },
});
