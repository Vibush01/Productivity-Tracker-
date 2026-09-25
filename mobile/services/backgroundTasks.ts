/**
 * Background Tasks Service
 *
 * Registers a background fetch task that periodically processes
 * the offline sync queue. Gracefully degrades in Expo Go where
 * background fetch is not fully supported.
 */
import Constants from 'expo-constants';
import { processQueue } from './sync';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';
const isExpoGo = Constants.appOwnership === 'expo';

let BackgroundFetch: typeof import('expo-background-fetch') | null = null;
let TaskManager: typeof import('expo-task-manager') | null = null;

if (!isExpoGo) {
  try {
    BackgroundFetch = require('expo-background-fetch');
    TaskManager = require('expo-task-manager');

    // Define the task only when TaskManager is available
    TaskManager!.defineTask(BACKGROUND_SYNC_TASK, async () => {
      try {
        console.log('[Background Fetch] Running offline sync...');
        await processQueue();
        return BackgroundFetch!.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('[Background Fetch] Failed:', error);
        return BackgroundFetch!.BackgroundFetchResult.Failed;
      }
    });
  } catch (e) {
    console.warn('[Background Tasks] Not available:', e);
  }
}

// Register the task
export async function registerBackgroundSync() {
  if (!BackgroundFetch || !TaskManager) {
    console.log('[Background Fetch] Skipped — not available in Expo Go.');
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false, // android only
        startOnBoot: true, // android only
      });
      console.log('[Background Fetch] Registered successfully');
    }
  } catch (err) {
    console.error('[Background Fetch] Registration failed:', err);
  }
}

export async function unregisterBackgroundSync() {
  if (!BackgroundFetch || !TaskManager) return;

  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log('[Background Fetch] Unregistered successfully');
  } catch (err) {
    console.error('[Background Fetch] Unregistration failed:', err);
  }
}
