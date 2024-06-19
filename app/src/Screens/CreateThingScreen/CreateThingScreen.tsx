import { ScrollView, StyleSheet, Text } from 'react-native';
import React from 'react';
import Column from '../../components/atoms/Column';
import H1 from '../../components/atoms/H1';
import MyButton from '../../components/molecules/MyButton';
import Row from '../../components/atoms/Row';
import LabeledInput from '../../components/organisms/TextInputWithLabel';
import ActionRow from '../../components/molecules/ActionRow';
import { useCreateThingScreenLogic } from './CreateThingsScreen.logic';
import H3 from '../../components/atoms/H3';
import MyInput from '../../components/molecules/MyInput';
import { X } from 'react-native-feather';
import { DateTime } from 'luxon';
import LoadingOverlay from '../../components/organisms/LoadingOverlay';

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
    handleUsernameAdd,
    loading
  } = useCreateThingScreenLogic();

  const scheduleText = () => {
    if (!newThing?.schedule) {
      return 'Not set';
    }

    const startTime = DateTime.fromFormat(newThing!.schedule!.startTime, 'hh:mm', { zone: 'utc' })
      .toLocal()
      .toLocaleString({ hour: 'numeric', minute: 'numeric' });
    const endTime = DateTime.fromFormat(newThing!.schedule!.endTime, 'hh:mm', { zone: 'utc' })
      .toLocal()
      .toLocaleString({ hour: 'numeric', minute: 'numeric' });

    if (newThing?.schedule.repeat === 'once') {
      const readableDate = DateTime.fromISO(newThing!.schedule.specificDate!).toLocaleString({
        month: 'long',
        day: 'numeric'
      });
      return `Once on ${readableDate}, from ${startTime} to ${endTime}`;
    }
    if (newThing?.schedule.repeat === 'daily') {
      return `Every day, from ${startTime} to ${endTime}`;
    }
    if (newThing?.schedule.repeat === 'weekly') {
      return `Every week on ${newThing.schedule.dayOfWeek}, from ${startTime} to ${endTime}`;
    }

    return 'Not set';
  };

  return (
    <ScrollView>
      <LoadingOverlay visible={loading} />
      <Column styles={{ paddingVertical: 16, gap: 30 }}>
        <H1>
          Create a <H1 accent>new Thing</H1>
        </H1>

        <Column styles={{ justifyContent: 'flex-start' }}>
          {/* NAME AND DESCRIPTION */}
          <Column styles={{ padding: 16, gap: 16 }}>
            <LabeledInput label={'Name'} placeholder={'Thing name'} value={thingName} onChangeText={setThingName} />
            <LabeledInput
              multiline
              label={'Description'}
              placeholder={'Thing description'}
              value={thingDescription}
              onChangeText={setThingDescription}
            />
          </Column>

          {/* EDIT AND SEE SCHEDULE */}
          <ActionRow label={scheduleText()} action={() => navigation.push('SetTime')} />

          {/* USERNAMES */}
          <Column>
            <Row
              styles={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: 16,
                marginTop: 30
              }}
            >
              <Column
                styles={{
                  flex: 1,
                  height: 50,
                  justifyContent: 'center'
                }}
              >
                <LabeledInput
                  label="Friends"
                  value={currentSharedUsername}
                  onChangeText={setCurrentSharedUsername}
                  placeholder={"Type your friend's username"}
                />
              </Column>
              <MyButton text={'Add'} onPress={handleUsernameAdd} />
            </Row>
            <Column styles={{ gap: 10 }}>
              {sharedUsernames.map((username, index) => {
                return (
                  <Row
                    key={index}
                    styles={{
                      gap: 8,
                      alignItems: 'center',
                      marginHorizontal: 16,
                      padding: 8,
                      borderRadius: 5,
                      backgroundColor: '#16a34a'
                    }}
                  >
                    <X
                      color={'#fff'}
                      onPress={() => {
                        setSharedUsernames(sharedUsernames.filter((name) => name !== username));
                      }}
                    />
                    <H3 white>@{username}</H3>
                  </Row>
                );
              })}
            </Column>
          </Column>
        </Column>

        {/* ACTIONS */}
        <Row
          styles={{
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginTop: 30
          }}
        >
          <MyButton
            text={'Cancel'}
            onPress={() => {
              handleCanel();
              navigation.pop();
            }}
          />
          <MyButton
            text={'Save'}
            onPress={() => {
              handleCreateThing();
              navigation.pop();
            }}
            accent
          />
        </Row>
      </Column>
    </ScrollView>
  );
};

export default CreateThingScreen;

const styles = StyleSheet.create({});
