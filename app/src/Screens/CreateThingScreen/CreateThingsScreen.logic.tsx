import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import {
  createThing,
  resetNewPersonalThing,
  thingSelector
} from '../../redux/thing/ThingStack';
import { scheduleAllNotifications } from '../../navigation/RootNavigation.logic';

export const useCreateThingScreenLogic = () => {
  const [thingName, setThingName] = useState('');
  const [thingDescription, setThingDescription] = useState('');
  const [sharedUsernames, setSharedUsernames] = useState<string[]>([]);
  const [currentSharedUsername, setCurrentSharedUsername] =
    useState<string>('');
  const thingState = useAppSelector(thingSelector);
  const dispatch = useAppDispatch();

  const newThing = thingState.personalThings.today.new;

  const handleCreateThing = async () => {
    if (thingName && newThing && newThing?.occurances) {
      await dispatch(
        createThing({
          name: thingName,
          description: thingDescription ?? '',
          occurances: newThing.occurances,
          sharedUsernames: sharedUsernames
        })
      );

      await scheduleAllNotifications();

      handleCanel();
    }
  };

  const handleCanel = () => {
    setThingName('');
    setThingDescription('');
    setSharedUsernames([]);
    setCurrentSharedUsername('');
    dispatch(resetNewPersonalThing());
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
    handleCanel
  };
};
