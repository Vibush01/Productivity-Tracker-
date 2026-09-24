import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import User from '../models/User.js';

const expo = new Expo();

interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Sends a push notification to all devices for a given user
 */
export async function sendPushNotification(userId: string, notification: PushNotificationData) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      return; // No tokens to send to
    }

    const messages: ExpoPushMessage[] = [];

    for (const pushToken of user.pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }
  } catch (error) {
    console.error('Failed to send push notification to user', userId, error);
  }
}
