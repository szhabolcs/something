import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { authSelector, login } from '../../redux/auth/AuthSlice';

export const useLoginScreenLogic = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error } = useAppSelector(authSelector);
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    dispatch(login({ username, password }));
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
    loading,
    error
  };
};
