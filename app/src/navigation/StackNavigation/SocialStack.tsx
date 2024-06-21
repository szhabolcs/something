import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from '../../Screens/CameraScreen/CameraScreen';
import SocialThings from '../../Screens/SocialThings/SocialThings';
import CreateSocialThingScreen from '../../Screens/CreateSocialThingScreen/CreateSocialThingScreen';
import SetSocialTimeIntervals from '../../Screens/CreateSocialThingScreen/SetSocialTimeIntervals';
import SocialThingDetailsScreen from '../../Screens/SocialThingDetailsScreen/SocialThingDetailsScreen';

const HomeStack = createStackNavigator();

export const SocialStackNavigation = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: 'white' },
        headerShown: false
      }}
    >
      <HomeStack.Screen name="SocialThings" component={SocialThings} />
      <HomeStack.Screen name="CreateSocialThing" component={CreateSocialThingScreen} />
      <HomeStack.Screen name="SetSocialTime" component={SetSocialTimeIntervals} />
      <HomeStack.Screen name="Camera" component={CameraScreen} />
      <HomeStack.Screen name="SocialDetails" component={SocialThingDetailsScreen} />
    </HomeStack.Navigator>
  );
};
