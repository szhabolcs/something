import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../../hooks/hooks';
import { authSelector } from '../../redux/auth/AuthSlice';
import RespositoryService from '../../services/RespositoryService';
import { useState } from 'react';

export type UserDetails = {
  badges: {
    icon: string;
    name: string;
    description: string;
  }[];
  things: {
    uuid: string;
    name: string;
    streakCount: number;
    startTime: string;
    endTime: string;
  }[];
  levels: {
    currentLevel: {
      level: string;
      minThreshold: number;
    };
    nextLevel: {
      level: string;
      minThreshold: number;
    };
    currentPoints: number;
  };
};

export const useProfileScreenLogic = () => {
  const authState = useAppSelector(authSelector);
  const user = authState.user;

  const [data, setData] = useState<UserDetails | null>(null);
  const [refreshing, setrefreshing] = useState(true);

  const getData = async () => {
    setrefreshing(true);
    const repositoryService = new RespositoryService();
    const token = (await AsyncStorage.getItem('token')) ?? '';
    const response = await repositoryService.authRespoitory.getUserDetails<UserDetails | null>(token);
    setData(response);
    setrefreshing(false);
  };

  return {
    user,
    data,
    getData,
    refreshing
  };
};
