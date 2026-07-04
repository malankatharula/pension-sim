import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';

export default function RootLayout() {
  // Phase 2: check real auth session here
  const isLoggedIn = false; // flip to true to test tabs

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="simulation" />
        <Stack.Screen name="compare" />
        <Stack.Screen name="inflation-calc" />
        <Stack.Screen name="fd-rates" />
        <Stack.Screen name="admin" />
      </Stack>
      {!isLoggedIn && <Redirect href="/(auth)/login" />}
    </>
  );
}