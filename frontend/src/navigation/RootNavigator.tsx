import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { StudentNavigator } from './StudentNavigator';
import { AdminNavigator } from './AdminNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user.role === 'teacher' && <Stack.Screen name="TeacherApp" component={TeacherNavigator} />}
      {user.role === 'student' && <Stack.Screen name="StudentApp" component={StudentNavigator} />}
      {user.role === 'admin' && <Stack.Screen name="AdminApp" component={AdminNavigator} />}
    </Stack.Navigator>
  );
}
