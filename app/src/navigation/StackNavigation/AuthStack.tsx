import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../Screens/LoginScreen/LoginScreen';
import RegisterScreen from '../../Screens/RegisterScreen/RegisterScreen';

const AuthStack = createStackNavigator();

export const AuthStackNavigation = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: 'white' },
        headerShown: false
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};
