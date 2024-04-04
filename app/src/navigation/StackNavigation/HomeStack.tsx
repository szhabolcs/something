import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../../Screens/HomeScreen/HomeScreen";
import CreateThingScreen from "../../Screens/CreateThingScreen/CreateThingScreen";
import SetTimeIntervals from "../../Screens/CreateThingScreen/SetTimeIntervals";
import CameraScreen from "../../Screens/CameraScreen/CameraScreen";
import ThingDetailsScreen from "../../Screens/ThingDetailsScreen/ThingDetailsScreen";

const HomeStack = createStackNavigator();

export const HomeStackNavigation = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: "white" },
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="CreateThing" component={CreateThingScreen} />
      <HomeStack.Screen name="SetTime" component={SetTimeIntervals} />
      <HomeStack.Screen name="Camera" component={CameraScreen} />
      <HomeStack.Screen name="Details" component={ThingDetailsScreen} />
    </HomeStack.Navigator>
  );
};
