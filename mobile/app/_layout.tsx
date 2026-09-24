/**
 * Root Layout — App entry point
 *
 * Responsibilities:
 * 1. Load fonts and hold splash screen
 * 2. Initialize auth store (check for saved JWT → auto-login)
 * 3. Initialize theme store (load saved preference)
 * 4. Auth gate: redirect to login if unauthenticated, tabs if authenticated
 * 5. Apply themed navigation chrome
 */
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { LoadingScreen } from '../components/common';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { registerBackgroundSync } from '../services/backgroundTasks';
import { registerForPushNotificationsAsync } from '../services/notifications';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

/**
 * AuthGate — watches auth state and redirects:
 * - Unauthenticated user on a protected route → push to login
 * - Authenticated user on an auth route → replace to tabs
 */
function useAuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return; // Wait until auth check is complete

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in and trying to access protected route
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but still on auth screen
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = useThemeStore((s) => s.colors);
  const initTheme = useThemeStore((s) => s.initialize);
  const initAuth = useAuthStore((s) => s.initialize);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize stores on mount
  useEffect(() => {
    async function bootstrap() {
      await initTheme();
      await initAuth();
      await registerBackgroundSync();
    }
    bootstrap();
  }, []);

  // Register push notifications when user becomes authenticated
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync();
    }
  }, [user]);

  // Handle font errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Hide splash when fonts loaded and auth check complete
  useEffect(() => {
    if (loaded && !isAuthLoading) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthLoading]);

  // Auth-based routing
  useAuthGate();

  // Background/Foreground sync queue processor
  useSyncQueue();

  if (!appReady) {
    return <LoadingScreen message="Starting up..." />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgPrimary },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
