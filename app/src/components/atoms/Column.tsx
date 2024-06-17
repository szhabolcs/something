import { View, Text, ViewStyle, StyleSheet, ScrollView, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import React from 'react';

type ColumProps = {
  children?: React.ReactNode;
  styles?: ViewStyle | ViewStyle[];
  scrollable?: boolean;
  refreshing?: any;
  getData?: () => void | Promise<void>;
};

const Column = ({ children, styles, scrollable, refreshing, getData }: ColumProps) => {
  if (scrollable) {
    return (
      // <SafeAreaView>
      <ScrollView
        style={{ flex: 1, height: '100%' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getData} />}
      >
        <View style={[ColumStyles.column, styles]}>{children}</View>
      </ScrollView>
      // </SafeAreaView>
    );
  }
  return <View style={[ColumStyles.column, styles]}>{children}</View>;
};

export default Column;

const ColumStyles = StyleSheet.create({
  column: {
    flexDirection: 'column'
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20
  }
});
