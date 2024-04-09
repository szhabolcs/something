import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { authSelector, loginSilently } from "../redux/auth/AuthSlice";
import * as Notifications from "expo-notifications";
import RespositoryService from "../services/RespositoryService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useRootNavigationLogic = () => {
  const userState = useAppSelector(authSelector);
  const dispatch = useAppDispatch();

  const signInSilently = async () => {
    await dispatch(loginSilently());
    await scheduleAllNotifications();
  };

  return {
    loading: userState.loading,
    user: userState.user,
    signInSilently,
  };
};

export async function scheduleAllNotifications() {
  const consent = await AsyncStorage.getItem("allowNotifications");
  if (consent !== "true") {
    console.log("User has not given consent to receive notifications");
    return;
  }

  const repositoryService = new RespositoryService();
  const token = await AsyncStorage.getItem("token");
  const thingsToDo = await repositoryService.thingRepository.getAllPersonalThings(token ?? "");
  for (const thing of thingsToDo) {
    await scheduleNotificationForThing(thing);
  }
}

async function scheduleNotificationForThing(thing: any) {
  const existingNotificationIds = await AsyncStorage.getItem(`notificationIds-${thing.uuid}`);
  if (existingNotificationIds) {
    console.log(`Notification for thing: ${thing.name} already scheduled`);
    return;
  }

  const time = getRandomTime(thing.startTime, thing.endTime).split(":").map(Number);
  const lastNotificationTime = getRandomTime("18:00:00", "22:00:00").split(":").map(Number);
  console.log(`Scheduling notification for thing: ${thing.name} at ${time[0]}:${time[1]}:${time[2]} for the next 7 days`);
  console.log(`Last notification for thing: ${thing.name} at ${lastNotificationTime[0]}:${lastNotificationTime[1]}:${lastNotificationTime[2]} for the next 7 days`);

  const notificationIds = [];
  for (let i = 0; i < 7; i++) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "You have a ✨thing✨ to do!",
        body: `Don't forget to: ${thing.name}`,
        data: { thing },
      },
      trigger: {
        hour: time[0],
        minute: time[1],
        repeats: true,
      },
    });

    notificationIds.push(notificationId);

    // One last reminder each day
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Last reminder to complete your ✨thing✨ today!",
        body: `Don't forget to: ${thing.name}`,
        data: { thing },
      },
      trigger: {
        hour: lastNotificationTime[0],
        minute: lastNotificationTime[1],
        repeats: true,
      },
    });
  }

  await AsyncStorage.setItem(`notificationIds-${thing.uuid}`, JSON.stringify(notificationIds));
}

function getRandomTime(startTime: string, endTime: string): string {
  const [startHour, startMinute, startSecond] = startTime.split(":").map(Number);
  const [endHour, endMinute, endSecond] = endTime.split(":").map(Number);

  const startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
  const endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

  const randomTotalSeconds = startTotalSeconds + Math.random() * (endTotalSeconds - startTotalSeconds);

  const randomHour = Math.floor(randomTotalSeconds / 3600);
  const randomMinute = Math.floor((randomTotalSeconds % 3600) / 60);
  const randomSecond = Math.floor(randomTotalSeconds % 60);

  return `${randomHour < 10 ? "0" : ""}${randomHour}:${randomMinute < 10 ? "0" : ""}${randomMinute}:${randomSecond < 10 ? "0" : ""}${randomSecond}`;
}