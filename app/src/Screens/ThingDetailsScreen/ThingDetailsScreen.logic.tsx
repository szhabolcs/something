import { useState } from 'react';
import ApiService, { ApiHeaders, ApiResponse } from '../../services/ApiService';

const api = new ApiService();
type ThingDTO = ApiResponse<(typeof api)['client']['things'][':uuid']['details']['$get'], 200>;

export const useThingDetailsScreenLogic = () => {
  const [thing, setThing] = useState<ThingDTO | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [headers, setHeaders] = useState<ApiHeaders>({ Authorization: '' });

  const getDetails = async (id: string) => {
    setRefreshing(true);
    const response = await api.call(api.client.things[':uuid'].details.$get, { param: { uuid: id } });
    if (response.ok) {
      const data = await response.json();
      setThing(data);

      const headers = await api.getAuthorizationHeaders();
      setHeaders(headers);
    }
    setRefreshing(false);
  };
  return {
    thing,
    getDetails,
    refreshing,
    headers
  };
};
