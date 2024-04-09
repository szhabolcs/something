import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Column from "../../components/atoms/Column";
import H1 from "../../components/atoms/H1";
import Row from "../../components/atoms/Row";
import H2 from "../../components/atoms/H2";
import { useProfileScreenLogic } from "./ProfileScreen.logic";
import Label from "../../components/atoms/Label";
import Spacer from "../../components/atoms/Spacer";
import { FlatList } from "react-native-gesture-handler";
import * as Icons from "react-native-feather";
import H3 from "../../components/atoms/H3";
import ThingCard from "../../components/molecules/ThingCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import MyButton from "../../components/molecules/MyButton";
import { scheduleAllNotifications } from "../../navigation/RootNavigation.logic";

const ProfileScreen = ({ navigation }: any) => {
  const { user, getData, data, refreshing } = useProfileScreenLogic();

  const [opened, setOpened] = useState(true);
  const [notificationsScheduled, setNotificationsScheduled] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);

  useEffect(() => {
    getData();

    (async () => {
      const keys = await AsyncStorage.getAllKeys();
      const notificationKeys = keys.filter((key) =>
        key.startsWith("notificationId")
      );
      if (notificationKeys.length > 0) {
        setNotificationsScheduled(true);
      }

      const consent = await AsyncStorage.getItem("allowNotifications");
      if (consent === "true") {
        setAllowNotifications(true);
      }
    })();
  }, []);

  async function removeNotifications() {
    const keys = await AsyncStorage.getAllKeys();
    const notificationKeys = keys.filter((key) =>
      key.startsWith("notificationId")
    );
    // Clear all notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const key of notificationKeys) {
      await AsyncStorage.removeItem(key);
    }

    setNotificationsScheduled(false);
  }

  async function toggleNotifications() {
    if (allowNotifications) {
      await AsyncStorage.setItem("allowNotifications", "false");
      setAllowNotifications(false);
      await removeNotifications();
    } else {
      await AsyncStorage.setItem("allowNotifications", "true");
      setAllowNotifications(true);
      await scheduleAllNotifications();
      setNotificationsScheduled(true);
    }
  }

  if (!data)
    return (
      <Column
        styles={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size={"large"} />
      </Column>
    );

  return (
    <Column
      scrollable
      refreshing={refreshing}
      getData={getData}
      styles={{
        flex: 1,
        padding: 16,
      }}
    >
      <H1>
        Profile <H1 accent>Things</H1>
      </H1>
      <Column
        styles={{
          borderColor: "#f0f0f0",
          borderWidth: 1,
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          width: "100%",
        }}
      >
        <Row
          styles={{
            alignItems: "center",
            gap: 5,
          }}
        >
          <H2>{user?.username}</H2>
          <Text>({data.levels.currentLevel.level})</Text>
        </Row>
        <Column
          styles={{
            width: "100%",
            height: 5,
            backgroundColor: "#f0f0f0",
            borderRadius: 20,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Column
            styles={{
              height: "100%",
              width: `${
                (data?.levels?.currentLevel?.minThreshold /
                  data?.levels?.nextLevel?.minThreshold) *
                100
              }%`,
              backgroundColor: "#16a34a",
              borderRadius: 20,
            }}
          />
        </Column>
        <Spacer space={15} />
        <Text>Badges</Text>
        <Spacer space={10} />
        <FlatList
          data={data.badges}
          horizontal
          contentContainerStyle={{ gap: 10, flexGrow: 1 }}
          renderItem={({ item }) => {
            const icon = item.icon as keyof typeof Icons;
            const Icon = Icons[icon];
            return (
              <Column
                styles={{
                  gap: 5,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                  padding: 10,
                  borderRadius: 10,
                  borderColor: "#f0f0f0",
                  borderWidth: 1,
                }}
              >
                <Icon color={"black"} />
                <Label text={item.name} />
              </Column>
            );
          }}
        />
      </Column>
      <Pressable
        onPress={() => {
          navigation.push("Leaderboard");
        }}
      >
        <Column
          styles={{
            borderColor: "#f0f0f0",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: opened ? 16 : 5,
            marginTop: 16,
            width: "100%",
          }}
        >
          <H3>
            See <H3 accent>leaderboard</H3>
          </H3>
        </Column>
      </Pressable>
      <Column
        styles={{
          borderColor: "#f0f0f0",
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: opened ? 16 : 5,
          marginTop: 16,
          width: "100%",
        }}
      >
        <H3 accent>My Things</H3>
        <FlatList
          scrollEnabled={false}
          data={opened ? data.things : data.things.slice(0, 3)}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ gap: 5 }}
          renderItem={({ item }) => (
            <ThingCard
              name={item.name}
              startTime={item.startTime}
              endTime={item.endTime}
              streak={item.streakCount}
              id={item.uuid}
              navigation={navigation}
            />
          )}
        />
      </Column>
      <Column
        styles={{
          marginTop: 100,
        }}
      >
        <H3 accent>Debug/dev things</H3>
        <Spacer space={10} />
        <Label text="If there are any problems regarding notifications, please toggle notifications twice, to re-enable and reschedule them." />
        <Spacer space={10} />
        <Label text="If any other problems occur feel free to contact me about it :)" />
        <Spacer space={20} />
        <H3>
          {notificationsScheduled
            ? "Notifications are scheduled"
            : "Notifications are not scheduled"}
        </H3>
        <Spacer space={10} />
        <MyButton
          accent
          smalltext
          text="Remove all scheduled notifications"
          onPress={removeNotifications}
        />
        <Spacer space={20} />
        <H3>
          {allowNotifications
            ? "Notifications are allowed"
            : "Notifications are not allowed"}
        </H3>
        <Spacer space={10} />
        <MyButton
          accent
          smalltext
          text="Toggle notifications"
          onPress={toggleNotifications}
        />
      </Column>
    </Column>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
