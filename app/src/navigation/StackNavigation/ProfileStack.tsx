import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../Screens/ProfileScreen/ProfileScreen';
import Leaderboard from '../../Screens/Leaderboard/Leaderboard';
import ThingDetailsScreen from '../../Screens/ThingDetailsScreen/ThingDetailsScreen';

const ProfileStack = createStackNavigator();

export const ProfileStackNavigation = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: 'white' },
        headerShown: false
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Leaderboard" component={Leaderboard} />
      <ProfileStack.Screen name="Details" component={ThingDetailsScreen} />
    </ProfileStack.Navigator>
  );
};
