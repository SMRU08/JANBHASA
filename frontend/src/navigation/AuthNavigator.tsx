import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../pages/auth/SplashScreen';
import { WelcomeScreen } from '../pages/auth/WelcomeScreen';
import { RoleSelectionScreen } from '../pages/auth/RoleSelectionScreen';
import { TeacherLoginScreen } from '../pages/auth/TeacherLoginScreen';
import { TeacherRegisterScreen } from '../pages/auth/TeacherRegisterScreen';
import { StudentLoginScreen } from '../pages/auth/StudentLoginScreen';
import { AdminLoginScreen } from '../pages/auth/AdminLoginScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
      <Stack.Screen name="TeacherRegister" component={TeacherRegisterScreen} />
      <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}
