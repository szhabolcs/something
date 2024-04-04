import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import Column from "../../components/atoms/Column";
import H1 from "../../components/atoms/H1";
import MyButton from "../../components/molecules/MyButton";
import Row from "../../components/atoms/Row";
import TextInputWithLabel from "../../components/organisms/TextInputWithLabel";
import ActionRow from "../../components/molecules/ActionRow";
import { useCreateThingScreenLogic } from "./CreateThingsScreen.logic";
import H3 from "../../components/atoms/H3";
import MyInput from "../../components/molecules/MyInput";
import { X } from "react-native-feather";

const CreateThingScreen = ({ navigation }: any) => {
  const {
    thingName,
    setThingName,
    thingDescription,
    setThingDescription,
    newThing,
    sharedUsernames,
    setSharedUsernames,
    currentSharedUsername,
    setCurrentSharedUsername,
    handleCreateThing,
    handleCanel,
  } = useCreateThingScreenLogic();

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        justifyContent: "space-between",
        paddingVertical: 16,
      }}
    >
      <H1>
        Create a <H1 accent>new Thing</H1>
      </H1>

      <Column
        styles={{
          justifyContent: "flex-start",
        }}
      >
        <Column
          styles={{
            padding: 16,
            gap: 16,
          }}
        >
          <TextInputWithLabel
            label={"Name"}
            placeholder={"Thing name"}
            value={thingName}
            onChangeText={setThingName}
          />
          <TextInputWithLabel
            multiline
            label={"Description"}
            placeholder={"Thing description"}
            value={thingDescription}
            onChangeText={setThingDescription}
          />
        </Column>
        <Column
          styles={{
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            gap: 16,
          }}
        >
          {newThing &&
            newThing.occurances.map((occurance: any) => {
              return (
                <>
                  <H3>
                    {occurance.startTime} - {occurance.endTime} repeats:{" "}
                    {occurance.repeat} on {occurance.dayOfWeek?.join(", ")}
                  </H3>
                </>
              );
            })}
        </Column>
        <ActionRow
          label={"Set time"}
          action={() => {
            navigation.push("SetTime");
          }}
        />
      </Column>
      <Column>
        <Row
          styles={{
            alignItems: "center",
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <Column
            styles={{
              flex: 1,
            }}
          >
            <MyInput
              text={currentSharedUsername}
              setText={setCurrentSharedUsername}
              placeholder={"Type your friend's username"}
            />
          </Column>
          <MyButton
            text={"Add"}
            onPress={() => {
              setSharedUsernames([...sharedUsernames, currentSharedUsername]);
              setCurrentSharedUsername("");
            }}
          />
        </Row>
        <Column
          styles={{
            gap: 16,
          }}
        >
          {sharedUsernames.map((username) => {
            return (
              <Row
                styles={{
                  gap: 8,
                  alignItems: "center",
                  marginHorizontal: 16,
                  padding: 8,
                  borderRadius: 5,
                  backgroundColor: "rgba(16, 185, 129, 0.5)",
                }}
              >
                <X
                  color={"#fff"}
                  onPress={() => {
                    setSharedUsernames(
                      sharedUsernames.filter((name) => name !== username)
                    );
                  }}
                />
                <H3>{username}</H3>
              </Row>
            );
          })}
        </Column>
      </Column>
      <Row
        styles={{
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <MyButton
          text={"Cancel"}
          onPress={() => {
            handleCanel();
            navigation.pop();
          }}
        />
        <MyButton
          text={"Save"}
          onPress={() => {
            handleCreateThing();
            navigation.pop();
          }}
          accent
        />
      </Row>
    </ScrollView>
  );
};

export default CreateThingScreen;

const styles = StyleSheet.create({});
