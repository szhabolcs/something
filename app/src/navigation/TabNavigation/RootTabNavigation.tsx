import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeStackNavigation } from "../StackNavigation/HomeStack";
import { useRootNavigationLogic } from "../RootNavigation.logic";
import SplashScreen from "../../Screens/SplashScreen/SplashScreen";
import { AuthStackNavigation } from "../StackNavigation/AuthStack";
import { Home, User, Users } from "react-native-feather";
import { useEffect } from "react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/core";
import { ProfileStackNavigation } from "../StackNavigation/ProfileStack";
import SocialThings from "../../Screens/SocialThings/SocialThings";

const Tab = createBottomTabNavigator();

export const RootTabNavigation = () => {
  const { loading, user, signInSilently } = useRootNavigationLogic();

  useEffect(() => {
    signInSilently();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthStackNavigation />;
  }

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigation}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            console.log(routeName);
            if (routeName === "Camera") {
              return { display: "none" };
            }
            return;
          })(route),
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} />,
        })}
      />
      <Tab.Screen
        name="SocialThings"
        component={SocialThings}
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => <Users color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigation}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
