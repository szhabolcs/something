import {
  ActivityIndicator,
  Pressable,
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

const ProfileScreen = ({ navigation }: any) => {
  const { user, getData, data } = useProfileScreenLogic();

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    getData();
  }, []);

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
                (data.levels.currentLevel.minThreshold /
                  data.levels.nextLevel.minThreshold) *
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
          data={opened ? data.things : data.things.slice(0, 3)}
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
        <Pressable
          onPress={() => {
            setOpened((o) => !o);
          }}
        >
          <Text
            style={{
              textAlign: "center",
            }}
          >
            {opened ? "Show less" : "Show more"}
          </Text>
        </Pressable>
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
    </Column>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
