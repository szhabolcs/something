import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Column from '../../components/atoms/Column';
import H1 from '../../components/atoms/H1';
import TextInputWithLabel from '../../components/organisms/TextInputWithLabel';
import { useLoginScreenLogic } from './LoginScreen.logic';
import MyButton from '../../components/molecules/MyButton';
import Row from '../../components/atoms/Row';
import { ChevronRight } from 'react-native-feather';

const LoginScreen = ({ navigation }: any) => {
  const { username, setUsername, password, setPassword, handleLogin } =
    useLoginScreenLogic();

  return (
    <Column
      styles={{
        padding: 16,
        justifyContent: 'space-around',
        flex: 1
      }}
    >
      <Row
        styles={{
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0
        }}
      >
        <H1 customColor={'#404040'}>some</H1>
        {/* <H1 customColor={"#ea580c"}>thing</H1> */}
        <H1 customColor={'#16a34a'}>thing</H1>
      </Row>
      <Column
        styles={{
          gap: 20
        }}
      >
        <TextInputWithLabel
          label="Username"
          placeholder={'Example username'}
          value={username}
          onChangeText={setUsername}
        />
        <TextInputWithLabel
          label="Password"
          placeholder={'Example password'}
          value={password}
          onChangeText={setPassword}
          secure
        />
        <Pressable
          onPress={() => {
            navigation.push('Register');
          }}
        >
          <Row>
            <Text
              style={{
                color: '#404040',
                fontWeight: 'bold'
              }}
            >
              Or create a <Text style={{ color: '#16a34a' }}>new account</Text>
            </Text>
            <ChevronRight stroke={'#16a34a'} />
          </Row>
        </Pressable>
      </Column>
      <MyButton accent text={'Login'} onPress={handleLogin} />
    </Column>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
