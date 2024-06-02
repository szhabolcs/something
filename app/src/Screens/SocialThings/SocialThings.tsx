import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text
} from 'react-native';
import Column from '../../components/atoms/Column';
import H2 from '../../components/atoms/H2';
import Label from '../../components/atoms/Label';
import { LinearGradient } from 'expo-linear-gradient';
import H3 from '../../components/atoms/H3';
import { Users } from 'react-native-feather';
import Row from '../../components/atoms/Row';
import MyButton from '../../components/molecules/MyButton';

const SocialThings = () => {
  const socialThings = [
    {
      name: 'Szemét gyűjtés a Hackathon után',
      date: '2024.03.24',
      time: '3PM',
      location: 'Sapientia EMTE',
      image:
        'https://media.istockphoto.com/id/850937446/photo/janitor-cleaning-a-mess.jpg?s=612x612&w=0&k=20&c=ux4_LpJAhDWe_GDY8lxh8kNoIYFl99928FT0jDSp1xc='
    },
    {
      name: 'Szemét gyűjtés a Marosparton',
      date: '2024.03.24',
      time: '3PM',
      location: 'Marospart',
      image:
        'https://c7.alamy.com/comp/2G4RFN5/people-collecting-garbage-in-city-park-men-and-women-volunteers-cleaning-park-together-from-trash-and-plastic-waste-flat-vector-illustration-activists-team-gathering-litter-into-bags-2G4RFN5.jpg'
    }
  ];
  return (
    <Column styles={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <FlatList
          data={socialThings}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Column key={item.name} styles={{ padding: 10 }}>
              <Column
                styles={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 10
                }}
              >
                <ImageBackground
                  style={{
                    height: 200
                  }}
                  imageStyle={{ borderRadius: 20 }}
                  source={{ uri: item.image }}
                >
                  <LinearGradient
                    colors={['#21212100', '#212121']}
                    style={{ height: '100%', width: '100%', borderRadius: 20 }}
                  >
                    <Column
                      styles={{
                        height: '100%',
                        justifyContent: 'flex-end',
                        padding: 16
                      }}
                    >
                      <H3 white>{item.name}</H3>
                      <Text style={{ color: 'white' }}>
                        {item.date}, {item.time} @ {item.location}
                      </Text>
                    </Column>
                  </LinearGradient>
                </ImageBackground>
                <Row styles={{ justifyContent: 'space-between', padding: 16 }}>
                  <Row styles={{ gap: 5, alignItems: 'center' }}>
                    <Users color={'#16a34a'} />
                    <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      {Math.floor(Math.random() * (200 - 70 + 1)) + 70}
                    </Text>
                  </Row>
                  <Pressable>
                    <Column
                      styles={{
                        paddingVertical: 10,
                        paddingHorizontal: 30,
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(16, 185, 129, 0.5)'
                      }}
                    >
                      <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>
                        Join
                      </Text>
                    </Column>
                  </Pressable>
                </Row>
              </Column>
            </Column>
          )}
        />
      </ScrollView>
    </Column>
  );
};

export default SocialThings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32
  }
});
