import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { authSelector, loginSilently } from '../redux/auth/AuthSlice';
import { getExpoPushToken } from '../hooks/notifications';

export const useRootNavigationLogic = () => {
  const userState = useAppSelector(authSelector);
  const dispatch = useAppDispatch();

  const signInSilently = async () => {
    const pushToken = (await getExpoPushToken())?.data;
    dispatch(loginSilently(pushToken));
  };

  return {
    loading: userState.loading,
    user: userState.user,
    signInSilently
  };
};
