import { useEffect } from 'react';
import { RootTabNavigation } from './TabNavigation/RootTabNavigation';

import { createNavigationContainerRef } from '@react-navigation/native';
import { useAppSelector } from '../hooks/hooks';
import { authSelector } from '../redux/auth/AuthSlice';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { thingSelector } from '../redux/thing/ThingStack';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params: any) {
  if (navigationRef.isReady()) {
    // @ts-expect-error
    navigationRef.navigate(name, params);
  }
}

export const RootNavigation = () => {
  const { error: authError } = useAppSelector(authSelector);
  const { error: thingError } = useAppSelector(thingSelector);

  useEffect(() => {
    if (authError?.type === 'general') {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        textBody: authError.message
      });
    }
  }, [authError]);

  useEffect(() => {
    if (thingError?.type === 'general') {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        textBody: thingError.message
      });
    }
  }, [thingError]);

  return <RootTabNavigation />;
};
