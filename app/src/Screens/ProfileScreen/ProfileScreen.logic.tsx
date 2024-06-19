import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { useState } from 'react';
import { getProfileData, profileSelector } from '../../redux/profile/ProfileStack';
import { authSelector, logout } from '../../redux/auth/AuthSlice';

export const useProfileScreenLogic = () => {
  const [refreshing, setrefreshing] = useState(true);
  const { loading, error, profile } = useAppSelector(profileSelector);
  const { user } = useAppSelector(authSelector);
  const dispatch = useAppDispatch();

  const getData = async () => {
    setrefreshing(true);
    await dispatch(getProfileData());
    setrefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return { loading, error, profile, getData, handleLogout, refreshing, user };
};
