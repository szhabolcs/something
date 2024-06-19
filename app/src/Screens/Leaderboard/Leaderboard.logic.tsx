import { useState } from 'react';
import ApiService, { ApiResponse } from '../../services/ApiService';

const api = new ApiService();
type LeaderboardDTO = ApiResponse<typeof api.client.user.leaderboard.all.$get, 200>;

export const useLeaderboardLogic = () => {
  const [visibility, setVisibility] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardDTO['leaderboard']>([]);

  const getData = async () => {
    setRefreshing(true);

    const response = await api.call(api.client.user.leaderboard.all.$get, {});
    if (response.ok) {
      const data = await response.json();
      setLeaderBoard(data.leaderboard);
      setVisibility(data.currentVisibility);
    }

    setRefreshing(false);
  };

  const toggleVisibility = async () => {
    setVisibility((value) => !value);

    await api.call(api.client.user.leaderboard['toggle-visibility'].$patch, {});
    await getData();
  };

  return {
    visibility,
    leaderBoard,
    getData,
    toggleVisibility,
    refreshing
  };
};
