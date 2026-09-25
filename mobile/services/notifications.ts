/**
 * Push Notifications Service
 *
 * Wraps expo-notifications with safety checks for Expo Go,
 * where push notifications are not supported (SDK 53+).
 * All calls gracefully degrade to no-ops in Expo Go.
 */
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api';

// Dynamically check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;

// Only load expo-notifications in dev builds (not Expo Go)
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.warn('[Notifications] expo-notifications not available:', e);
  }
}

// Set notification handler only if available
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  // Gracefully skip in Expo Go
  if (!Notifications) {
    console.log('[Notifications] Skipped — not available in Expo Go. Use a development build for push notifications.');
    return undefined;
  }

  let token: string | undefined;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00FFA3', // neon green
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      token = pushTokenString;

      // Send token to backend
      if (token) {
        await api.post('/auth/push-token', { token });
        console.log('[Notifications] Token saved to server:', token);
      }
    } catch (e: unknown) {
      console.error('[Notifications] Error getting/saving token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
