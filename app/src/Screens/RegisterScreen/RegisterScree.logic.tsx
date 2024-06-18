import { useState } from 'react';
import { authSelector, register } from '../../redux/auth/AuthSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

export const useRegisterScreenLogic = () => {
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [username, setUsername] = useState('');
  const { loading, error } = useAppSelector(authSelector);
  const dispatch = useAppDispatch();

  const handleRegister = () => {
    if (password !== passwordAgain) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        textBody: 'Passwords must match'
      });
      return;
    }
    dispatch(
      register({
        username,
        password
      })
    );
  };

  return {
    password,
    setPassword,
    username,
    setUsername,
    handleRegister,
    passwordAgain,
    setPasswordAgain,
    loading,
    error
  };
};
