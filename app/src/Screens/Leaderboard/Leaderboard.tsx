import { StyleSheet, Switch, Text, View } from "react-native";
import React, { useEffect } from "react";
import Column from "../../components/atoms/Column";
import { useLeaderboardLogic } from "./Leaderboard.logic";
import { FlatList } from "react-native-gesture-handler";
import Row from "../../components/atoms/Row";
import H1 from "../../components/atoms/H1";
import H4 from "../../components/atoms/H4";
import H3 from "../../components/atoms/H3";
import Label from "../../components/atoms/Label";
import H2 from "../../components/atoms/H2";

const Leaderboard = () => {
  const { leaderBoard, getData, visibility, toggleVisibility } =
    useLeaderboardLogic();

  useEffect(() => {
    getData();
  }, []);

  return (
    <Column
      styles={{
        height: "100%",
        position: "relative",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
        gap: 30,
      }}
    >
      <H1>
        Leaderboard <H1 accent>Thing</H1>
      </H1>
      <FlatList
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
        data={leaderBoard}
        renderItem={({ item, index }) => {
          return (
            <Row
              styles={{
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <H2 accent>#{index + 1} </H2>
              <H2>{item.username}</H2>
              <Text
                style={{
                  fontSize: 24,
                }}
              >
                {item.points} points
              </Text>
            </Row>
          );
        }}
      />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 30,
          right: 30,
        }}
      >
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={visibility ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleVisibility}
          value={visibility}
        />
      </View>
    </Column>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({});
