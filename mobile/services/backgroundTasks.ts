import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { processQueue } from './sync';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

// 1. Define the task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('[Background Fetch] Running offline sync...');
    await processQueue();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[Background Fetch] Failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 2. Register the task
export async function registerBackgroundSync() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
      });
      console.log('[Background Fetch] Registered successfully');
    }
  } catch (err) {
    console.error('[Background Fetch] Registration failed:', err);
  }
}

export async function unregisterBackgroundSync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log('[Background Fetch] Unregistered successfully');
  } catch (err) {
    console.error('[Background Fetch] Unregistration failed:', err);
  }
}
