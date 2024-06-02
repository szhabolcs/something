import { useState } from 'react';
import { authSelector, register } from '../../redux/auth/AuthSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';

export const useRegisterScreenLogic = () => {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const dispatch = useAppDispatch();
  const userState = useAppSelector(authSelector);
  const [error, setError] = useState(userState.error);

  const handleRegister = () => {
    if (username === '' || password === '') {
      setError('Please fill in all fields');
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
    error
  };
};
