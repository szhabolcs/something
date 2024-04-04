import { NavigationContainer } from "@react-navigation/native";
import { Linking, SafeAreaView, StyleSheet } from "react-native";
import { RootNavigation, navigate } from "./src/navigation/RootNavigation";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./src/hooks/notifications";
import { navigationRef } from "./src/navigation/RootNavigation";
import { useFonts } from "expo-font";

export default function App() {
  // Expo notification start
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {

    registerForPushNotificationsAsync().then((token: any) => {
      console.log("Push notification token: ", token);
    });

    // @ts-ignore
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        console.log("notification: ", notification);
        // navigate("Camera");
      });

    // @ts-ignore
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("response: ", response);
        navigate("Camera", response.notification.request.content.data);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        // @ts-ignore
        notificationListener.current
      );
      // @ts-ignore
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  // Expo notification end

  const [fontsLoaded] = useFonts({
    "Cursive-Regular": require("./assets/fonts/CedarvilleCursive-Regular.ttf"),
    Caveat: require("./assets/fonts/Caveat-VariableFont_wght.ttf"),
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
    flex: 1,
  },
});
