import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Column from "../../components/atoms/Column";
import { useThingDetailsScreenLogic } from "./ThingDetailsScreen.logic";
import Row from "../../components/atoms/Row";
import H1 from "../../components/atoms/H1";
import StreakChip from "../../components/atoms/StreakChip";
import H3 from "../../components/atoms/H3";
import H4 from "../../components/atoms/H4";
import { ChevronLeft, ChevronsLeft } from "react-native-feather";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import ImageViewer from "../../components/molecules/ImageViewer";
import MyButton from "../../components/molecules/MyButton";

const ThingDetailsScreen = ({ route, navigation }: any) => {
  const { getDetails, thing, refreshing } = useThingDetailsScreenLogic();

  const { thingId, streakCount } = route.params;

  useEffect(() => {
    getDetails(thingId);
  }, []);

  console.log(JSON.stringify(thing));

  if (!thing)
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
      getData={() => getDetails(thingId)}
      styles={{
        flex: 1,
        gap: 32,
        padding: 16,
      }}
    >
      <Row
        styles={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ChevronLeft
          width={32}
          height={32}
          color={"black"}
          onPress={() => {
            navigation.pop();
          }}
        />
        <H1>{thing.name}</H1>
        <StreakChip streak={streakCount} />
      </Row>
      <Column
        styles={{
          gap: 16,
        }}
      >
        <H3>Next occurance</H3>
        <H4>
          {thing.nextOccurrence?.startTime} - {thing.nextOccurrence?.endTime}
        </H4>
      </Column>
      <Column
        styles={{
          gap: 16,
        }}
      >
        <H4>Description</H4>
        <H3>{thing.description}</H3>
      </Column>
      <Column
        styles={{
          gap: 16,
        }}
      >
        <H4>Shared with</H4>
        {thing.sharedWith.map((shared) => (
          <Column
            key={shared.userUuid}
            styles={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              backgroundColor: "#16a34a",
              borderRadius: 10,
              width: "auto",
              alignSelf: "flex-start",
            }}
          >
            <H3 key={shared.userUuid} white>
              @{shared.username}
            </H3>
          </Column>
        ))}
      </Column>
      <Column>
        <Row
          styles={{
            justifyContent: "space-between",
          }}
        >
          <H4>Memories</H4>
          <MyButton
            smalltext
            accent
            text={"Create more"}
            onPress={() => {
              navigation.navigate("Camera", {
                name: thing.name,
                uuid: thingId,
              });
            }}
          />
        </Row>
        <Column>
          <FlatList
            scrollEnabled={false}
            data={thing.previousCheckpoints}
            keyExtractor={(item, index) => index.toString()}
            style={{
              marginTop: 20,
            }}
            contentContainerStyle = {{
              gap: 16
            }}
            renderItem={({ item, index }) => (
              <ImageViewer
                key={index.toString()}
                uri={item.photoUuid}
                name={item.thingName}
                username={item.username}
              />
            )}
          />
        </Column>
      </Column>
    </Column>
  );
};

export default ThingDetailsScreen;

const styles = StyleSheet.create({});
