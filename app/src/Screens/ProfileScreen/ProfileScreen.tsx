import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Column from '../../components/atoms/Column';
import H1 from '../../components/atoms/H1';
import Row from '../../components/atoms/Row';
import H2 from '../../components/atoms/H2';
import { useProfileScreenLogic } from './ProfileScreen.logic';
import Label from '../../components/atoms/Label';
import Spacer from '../../components/atoms/Spacer';
import { FlatList } from 'react-native-gesture-handler';
import * as Icons from 'react-native-feather';
import H3 from '../../components/atoms/H3';
import ThingCard from '../../components/molecules/ThingCard';
import MyButton from '../../components/molecules/MyButton';

type NonUndefined<T> = T extends undefined ? never : T;

const ProfileScreen = ({ navigation }: any) => {
  const logic = useProfileScreenLogic();

  const [opened, setOpened] = useState(true);

  useEffect(() => {
    logic.getData();
  }, []);

  function calculatePointPercentage(data: NonUndefined<typeof logic.profile>) {
    const percentage =
      ((data.level.currentScore - data.level.currentLevel.minThreshold) /
        (data.level.nextLevel.minThreshold - data.level.currentLevel.minThreshold)) *
      100;
    return percentage + 1;
  }

  if (!logic.profile) {
    return (
      <Column
        styles={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ActivityIndicator size={'large'} />
      </Column>
    );
  }

  return (
    <Column
      scrollable
      refreshing={logic.refreshing}
      getData={logic.getData}
      styles={{
        flex: 1,
        paddingTop: 30,
        paddingVertical: 20,
        paddingHorizontal: 23
      }}
    >
      <H1>
        Profile <H1 accent>Things</H1>
      </H1>
      <Column
        styles={{
          borderColor: '#f0f0f0',
          borderWidth: 1,
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          width: '100%'
        }}
      >
        <Row styles={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <H2>{logic.user?.username}</H2>
          <Text>{logic.profile?.level.currentScore} points</Text>
        </Row>
        <Spacer space={10} />
        <Row
          styles={{
            alignItems: 'center',
            gap: 5,
            justifyContent: 'space-between'
          }}
        >
          <Row
            styles={{
              alignItems: 'center',
              gap: 5
            }}
          >
            <Text>
              {logic.profile?.level.currentLevel.name} ({logic.profile?.level.currentLevel.minThreshold})
            </Text>
          </Row>
          <Text>
            {logic.profile?.level.nextLevel.name} ({logic.profile?.level.nextLevel.minThreshold})
          </Text>
        </Row>
        <Column
          styles={{
            width: '100%',
            height: 5,
            backgroundColor: '#f0f0f0',
            borderRadius: 20,
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}
        >
          <Column
            styles={{
              height: '100%',
              width: `${calculatePointPercentage(logic.profile)}%`,
              backgroundColor: '#16a34a',
              borderRadius: 20
            }}
          />
        </Column>
        <Spacer space={15} />
        {/* <Text>Badges</Text> */}
        {/* <Spacer space={10} /> */}
        <FlatList
          data={logic.profile?.badges}
          horizontal
          contentContainerStyle={{ gap: 10, flexGrow: 1 }}
          renderItem={({ item }) => {
            const icon = item.icon as keyof typeof Icons;
            const Icon = Icons[icon];
            return (
              <Column
                styles={{
                  gap: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f0f0',
                  padding: 10,
                  borderRadius: 10,
                  borderColor: '#f0f0f0',
                  borderWidth: 1
                }}
              >
                <Icon color={'black'} />
                <Label text={item.name} />
              </Column>
            );
          }}
        />
      </Column>
      <Pressable
        onPress={() => {
          navigation.push('Leaderboard');
        }}
      >
        <Column
          styles={{
            borderColor: '#f0f0f0',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: opened ? 16 : 5,
            marginTop: 16,
            width: '100%'
          }}
        >
          <H3>
            See <H3 accent>leaderboard</H3>
          </H3>
        </Column>
      </Pressable>
      <Column
        styles={{
          borderColor: '#f0f0f0',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: opened ? 16 : 5,
          marginTop: 16,
          width: '100%'
        }}
      >
        <H3 accent>My Things</H3>
        <FlatList
          scrollEnabled={false}
          data={opened ? logic.profile?.things : logic.profile?.things.slice(0, 3)}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ gap: 5 }}
          renderItem={({ item }) => (
            <ThingCard
              name={item.name}
              startTime={item.startTime}
              endTime={item.endTime}
              streak={item.streak}
              id={item.id}
              navigation={navigation}
            />
          )}
        />
      </Column>
      <Column
        styles={{
          marginTop: 100
        }}
      >
        <MyButton accent smalltext text="Log out" onPress={logic.handleLogout} />
      </Column>
    </Column>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
