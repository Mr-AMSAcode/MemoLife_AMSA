// ─────────────────────────────────────────
// FICHIER : frontend/app/_layout.tsx
// Coller EN DERNIER après tous les autres
// ─────────────────────────────────────────
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Colors } from '../Constants/theme';

function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (!user?.onboarding_ok) {
      router.replace('/(onboarding)/step1');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>

      {/* Splash */}
      <Stack.Screen name="index" />

      {/* Auth */}
      <Stack.Screen name="(auth)/welcome" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/login" />


      {/* Onboarding */}
      <Stack.Screen name="(onboarding)/step1" />

      {/* Tabs */}
      <Stack.Screen name="(tabs)" />

      {/* Chat */}
      <Stack.Screen
        name="(chat)/chat"
        options={{
          headerShown: true,
          headerTitle: 'Assistant MemoLife',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      {/* Historique */}
      <Stack.Screen
        name="(chat)/history"
        options={{
          headerShown: true,
          headerTitle: 'Historique',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      {/* Settings */}
      <Stack.Screen
        name="(settings)/index"
        options={{
          headerShown: true,
          headerTitle: 'Paramètres',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
