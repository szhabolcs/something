import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StyleSheet } from 'react-native';
import { RootNavigation } from './src/navigation/RootNavigation';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { navigationRef } from './src/navigation/RootNavigation';
import { useFonts } from 'expo-font';
import { usePushNotifications } from './src/hooks/notifications';

export default function App() {
  const { expoPushToken, notification, lastNotificationResponse } = usePushNotifications();

  const [fontsLoaded] = useFonts({
    'Cursive-Regular': require('./assets/fonts/CedarvilleCursive-Regular.ttf'),
    Caveat: require('./assets/fonts/Caveat-VariableFont_wght.ttf')
  });

  return (
    <SafeAreaView style={styles.container}>
      <Provider store={store}>
        <NavigationContainer ref={navigationRef}>
          <RootNavigation />
        </NavigationContainer>
      </Provider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
