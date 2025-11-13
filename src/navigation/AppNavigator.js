import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PostsListScreen } from '../screens/PostsListScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { colors, typography } from '../styles/theme';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: typography.weights.semibold,
            fontSize: typography.sizes.lg,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="PostsList"
          component={PostsListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={({ route }) => ({
            title: route.params?.post ? 'Detalle del Post' : 'Nuevo Post',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}