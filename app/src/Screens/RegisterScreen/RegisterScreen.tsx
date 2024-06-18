import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Column from '../../components/atoms/Column';
import H1 from '../../components/atoms/H1';
import LabeledInput from '../../components/organisms/TextInputWithLabel';
import Row from '../../components/atoms/Row';
import MyButton from '../../components/molecules/MyButton';
import { useRegisterScreenLogic } from './RegisterScree.logic';
import { ChevronLeft } from 'react-native-feather';
import LoadingOverlay from '../../components/organisms/LoadingOverlay';

const RegisterScreen = ({ navigation }: any) => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    passwordAgain,
    setPasswordAgain,
    loading,
    error,
    handleRegister
  } = useRegisterScreenLogic();

  return (
    <Column
      styles={{
        padding: 16,
        justifyContent: 'space-between',
        height: '100%',
        flex: 1,
        paddingBottom: 70
      }}
    >
      <LoadingOverlay visible={loading} />

      <Column>
        <Pressable
          onPress={() => {
            navigation.pop();
          }}
        >
          <Row
            styles={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Column
              styles={{
                position: 'absolute',
                left: 0
              }}
            >
              <ChevronLeft stroke={'#404040'} height={30} width={30} />
            </Column>
            <Column
              styles={{
                paddingLeft: 20
              }}
            >
              <H1>
                Create <H1 customColor={'#10b981'}>Account</H1>
              </H1>
            </Column>
          </Row>
        </Pressable>
      </Column>
      <Column>
        <LabeledInput
          label="Username"
          placeholder={'Example username'}
          value={username}
          onChangeText={setUsername}
          error={error}
          path={['username']}
        />
        <LabeledInput
          label="Password"
          placeholder={'Example password'}
          value={password}
          onChangeText={setPassword}
          secure
          error={error}
          path={['password']}
        />
        <LabeledInput
          label="Repeat Password"
          placeholder={'Example password'}
          value={passwordAgain}
          onChangeText={setPasswordAgain}
          secure
        />
      </Column>
      <MyButton accent text={'Register'} onPress={handleRegister} />
    </Column>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({});
