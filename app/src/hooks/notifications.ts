import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import Constants from 'expo-constants';

import { Platform } from 'react-native';
// import { navigate } from '../navigation/RootNavigation';

// export interface PushNotificationState {
//   expoPushToken?: Notifications.ExpoPushToken;
//   notification?: Notifications.Notification;
//   lastNotificationResponse?: Notifications.NotificationResponse;
// }

export async function getExpoPushToken() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX
      });

      console.log('Set notification channel');
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas.projectId
    });
  } else {
    alert('Must be using a physical device for Push notifications');
  }

  return token;
}

// export const usePushNotifications = (): PushNotificationState => {
//   Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//       shouldPlaySound: false,
//       shouldShowAlert: true,
//       shouldSetBadge: false
//     })
//   });

//   const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();

//   const [notification, setNotification] = useState<Notifications.Notification | undefined>();

//   const [lastNotificationResponse, setLastNotificationResponse] = useState<
//     Notifications.NotificationResponse | undefined
//   >();

//   const notificationListener = useRef<Notifications.Subscription>();
//   const responseListener = useRef<Notifications.Subscription>();

//   useEffect(() => {
//     getExpoPushToken().then((token) => {
//       setExpoPushToken(token);
//       console.log('Expo Push Token:', token?.data);

//       Notifications.getLastNotificationResponseAsync().then((response) => {
//         console.log('Expo last notification response: ', response);
//         setLastNotificationResponse(response ?? undefined);
//         if (response?.notification.request.content.data) {
//           navigate('Camera', response?.notification.request.content.data);
//         }
//       });
//     });

//     notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
//       setNotification(notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
//       console.log('Expo notification response: ', response);
//       if (response?.notification.request.content.data) {
//         navigate('Camera', response?.notification.request.content.data);
//       } else {
//         const _response = await Notifications.getLastNotificationResponseAsync();
//         console.log('Expo last notification _response: ', _response);
//         if (_response?.notification.request.content.data) {
//           navigate('Camera', _response?.notification.request.content.data);
//         }
//       }
//     });

//     return () => {
//       Notifications.removeNotificationSubscription(notificationListener.current!);

//       Notifications.removeNotificationSubscription(responseListener.current!);
//     };
//   }, []);

//   return {
//     expoPushToken,
//     notification,
//     lastNotificationResponse
//   };
// };
