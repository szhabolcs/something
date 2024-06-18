import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import Column from '../../components/atoms/Column';
import H2 from '../../components/atoms/H2';
import { FlatList } from 'react-native-gesture-handler';
import ThingCard from '../../components/molecules/ThingCard';
import Spacer from '../../components/atoms/Spacer';
import { useHomeScreenLogic } from './HomeScreen.logic';
import { Plus } from 'react-native-feather';
import ImageViewer from '../../components/molecules/ImageViewer';
import LoadingOverlay from '../../components/organisms/LoadingOverlay';

const HomeScreen = ({ navigation }: any) => {
  const logic = useHomeScreenLogic();

  useEffect(() => {
    logic.getHomeThings();
  }, []);

  const renderTodayThings = () => {
    if (logic.userThings.home.length === 0) {
      return <Text>No things for today</Text>;
    }

    return (
      <FlatList
        data={logic.userThings.home}
        scrollEnabled={false}
        style={{ marginTop: 18 }}
        contentContainerStyle={{ gap: 14 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <ThingCard
            id={item.id}
            navigation={navigation}
            name={item.name}
            startTime={item.startTime}
            endTime={item.endTime}
            streak={item.streak}
          />
        )}
      />
    );
  };

  const renderOtherThings = () => {
    if (logic.otherThings.home.length === 0) {
      return <Text>None of yor friends uploaded anything yet</Text>;
    }

    return (
      <FlatList
        data={logic.otherThings.home}
        scrollEnabled={false}
        keyExtractor={(_, index) => index.toString()}
        style={{ marginTop: 18, marginBottom: 50 }}
        contentContainerStyle={{ gap: 14 }}
        renderItem={({ item }) => <ImageViewer uri={item.image} name={item.name} username={item.username} />}
      />
    );
  };

  const renderButton = () => {
    return (
      <Column
        styles={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
          backgroundColor: '#16a34a',
          borderRadius: 15,
          position: 'absolute',
          right: 16,
          bottom: 20
        }}
      >
        <Plus
          color={'white'}
          onPress={() => {
            navigation.push('CreateThing');
          }}
        />
      </Column>
    );
  };

  return (
    <Column styles={{ flex: 1 }}>
      <LoadingOverlay visible={logic.refreshing} />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={logic.refreshing} onRefresh={logic.getHomeThings} />}
      >
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
    paddingTop: 32
  }
});
