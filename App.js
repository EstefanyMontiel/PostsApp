import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PostsProvider } from './src/context/PostsContext';
import { SyncProvider } from './src/context/SyncContext';
import { PostsListScreen } from './src/screens/PostsListScreen';
import { PostDetailScreen } from './src/screens/PostDetailScreen';
import { colors, typography, spacing } from './src/styles/theme';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SyncProvider>
      <PostsProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.primary,
              headerTitleStyle: {
                fontWeight: typography.weights.bold,
                fontSize: typography.sizes.lg,
              },
              headerShadowVisible: true,
              headerBackTitleVisible: false,
              // Ajustar padding superior para que se vea bien
              contentStyle: {
                backgroundColor: colors.background,
              },
              // Para iOS: agregar más espacio arriba
              ...(Platform.OS === 'ios' && {
                headerLargeTitle: false,
                headerTransparent: false,
              }),
            }}
          >
            <Stack.Screen 
              name="PostsList" 
              component={PostsListScreen}
              options={{
                title: 'Posts',
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen 
              name="PostDetail" 
              component={PostDetailScreen}
              options={{
                title: 'Detalle',
                headerBackTitle: 'Volver',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PostsProvider>
    </SyncProvider>
  );
}