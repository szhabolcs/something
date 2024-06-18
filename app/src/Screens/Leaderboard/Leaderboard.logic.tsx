import { useState } from 'react';
import RespositoryService from '../../services/RespositoryService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLeaderboardLogic = () => {
  const [visibility, setVisibility] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [leaderBoard, setLeaderBoard] = useState<
    {
      username: string;
      points: number;
    }[]
  >([]);

  const getData = async () => {
    setRefreshing(true);
    const repositoryService = new RespositoryService();
    const response = await repositoryService.leaderboardResository.getLeaderboard<{
      leaderboard: {
        username: string;
        points: number;
      }[];
      currentVisibility: boolean;
    }>((await AsyncStorage.getItem('accessToken')) || '');

    setLeaderBoard(response.leaderboard);
    setVisibility(response.currentVisibility);
    setRefreshing(false);
  };

  const toggleVisibility = async () => {
    const repositoryService = new RespositoryService();
    const response = await repositoryService.leaderboardResository.toggleVisibility<{
      currentVisibility: boolean;
    }>((await AsyncStorage.getItem('accessToken')) || '');

    getData();

    setVisibility((o) => !o);
  };

  return {
    visibility,
    leaderBoard,
    getData,
    toggleVisibility,
    refreshing
  };
};
