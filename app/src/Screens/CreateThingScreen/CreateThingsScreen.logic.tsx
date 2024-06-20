import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import {
  createThing,
  resetNewPersonalThing,
  setDescriptionForNewPersonalThing,
  setNameForNewPersonalThing,
  thingSelector
} from '../../redux/thing/ThingStack';
import { authSelector } from '../../redux/auth/AuthSlice';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ApiService from '../../services/ApiService';

const api = new ApiService();

export const useCreateThingScreenLogic = (navigation: any) => {
  const [thingName, setThingName] = useState('');
  const [thingDescription, setThingDescription] = useState('');
  const [sharedUsernames, setSharedUsernames] = useState<string[]>([]);
  const [currentSharedUsername, setCurrentSharedUsername] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const userState = useAppSelector(authSelector);
  const thingState = useAppSelector(thingSelector);
  const dispatch = useAppDispatch();

  const { error, newThing, newThingSent } = thingState;

  const handleCreateThing = async () => {
    setLoading(true);
    // throws error when failing
    await dispatch(createThing());
    setLoading(false);
  };

  const handleCanel = () => {
    dispatch(resetNewPersonalThing());
    navigation.pop();
  };

  useEffect(() => {
    dispatch(setNameForNewPersonalThing(thingName));
  }, [thingName]);

  useEffect(() => {
    dispatch(setDescriptionForNewPersonalThing(thingDescription));
  }, [thingDescription]);

  useEffect(() => {
    if (newThingSent) {
      handleCanel();
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        textBody: 'Thing created!'
      });
    }
  }, [newThingSent]);

  const handleUsernameAdd = async () => {
    const username = currentSharedUsername.trim();

    if (username.length === 0) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Please enter a username'
      });
      return;
    }

    if (username === userState.user?.username) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Please enter somone else than yourself'
      });
      return;
    }

    console.log('[handleUsernameAdd]', username);

    setLoading(true);
    const response = await api.call(api.client.user.username[':username'].$get, { param: { username } });
    if (response.ok) {
      const set = new Set([...sharedUsernames, username]);
      setSharedUsernames([...set.values()]);
      setCurrentSharedUsername('');
    } else {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Username does not exist'
      });
    }
    setLoading(false);
  };

  return {
    thingName,
    setThingName,
    thingDescription,
    setThingDescription,
    handleCreateThing,
    newThing,
    sharedUsernames,
    setSharedUsernames,
    currentSharedUsername,
    setCurrentSharedUsername,
    handleCanel,
    handleUsernameAdd,
    loading,
    error
  };
};
