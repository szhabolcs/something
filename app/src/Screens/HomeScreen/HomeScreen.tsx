import {
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect } from "react";
import Column from "../../components/atoms/Column";
import H2 from "../../components/atoms/H2";
import { FlatList } from "react-native-gesture-handler";
import ThingCard from "../../components/molecules/ThingCard";
import Spacer from "../../components/atoms/Spacer";
import OtherThingCard from "../../components/molecules/OtherThingCard";
import { useHomeScreenLogic } from "./HomeScree.logic";
import { Plus } from "react-native-feather";
import MyButton from "../../components/molecules/MyButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageViewer from "../../components/molecules/ImageViewer";

const HomeScreen = ({ navigation }: any) => {
  const {
    todaysPersonalThings,
    todaysOtherThings,
    allTodaysPersonalThings,
    getTodaysThingsPreview,
    getTodaysOtherThings,
    loading,
  } = useHomeScreenLogic();

  useEffect(() => {
    getTodaysThingsPreview();
    getTodaysOtherThings();
  }, []);

  const renderTodayThings = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (todaysPersonalThings.length === 0) {
      return <Text>No things for today</Text>;
    }

    return (
      <FlatList
        data={todaysPersonalThings}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <ThingCard
            id={item.uuid}
            navigation={navigation}
            name={item.name}
            startTime={item.startTime}
            endTime={item.endTime}
            streak={item.streakCount}
          />
        )}
      />
    );
  };

  const renderOtherThings = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (todaysOtherThings.length === 0) {
      return <Text>None of yor friends uploaded anything yet</Text>;
    }

    return (
      <FlatList
        data={todaysOtherThings}
        scrollEnabled={false}
        keyExtractor={(_, index) => index.toString()}
        style={{ gap: 16 }}
        contentContainerStyle={{ marginBottom: 50 }}
        renderItem={({ item }) => (
          <ImageViewer
            uri={item.photoUuid}
            name={item.thingName}
            username={item.username}
          />
        )}
      />
    );
  };

  const renderButton = () => {
    return (
      <Column
        styles={{
          justifyContent: "center",
          alignItems: "center",
          padding: 15,
          backgroundColor: "#16a34a",
          borderRadius: 15,
          position: "absolute",
          right: 16,
          bottom: 20,
        }}
      >
        <Plus
          color={"white"}
          onPress={() => {
            navigation.push("CreateThing");
          }}
        />
      </Column>
    );
  };

  return (
    <Column styles={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <H2>
          Todays <H2 accent>Things</H2>
        </H2>
        {renderTodayThings()}
        <Spacer space={20} />
        <H2>
          Other <H2 accent>Things</H2>
        </H2>
        {renderOtherThings()}
      </ScrollView>
      {renderButton()}
    </Column>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
  },
});
