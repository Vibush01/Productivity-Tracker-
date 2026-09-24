import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = '@offline_action_queue';

export interface OfflineAction {
  id: string;
  method: 'post' | 'put' | 'delete' | 'patch';
  url: string;
  data?: any;
  timestamp: number;
}

/**
 * Add an API action to the offline queue
 */
export async function enqueueAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  try {
    const currentQueueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: OfflineAction[] = currentQueueStr ? JSON.parse(currentQueueStr) : [];
    
    queue.push({
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    });
    
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to enqueue offline action:', error);
  }
}

/**
 * Retrieve the current offline queue
 */
export async function getQueue(): Promise<OfflineAction[]> {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch {
    return [];
  }
}

/**
 * Clear the offline queue
 */
export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Process the entire queue in FIFO order.
 * If an action fails, it stops processing to maintain order.
 */
export async function processQueue() {
  const queue = await getQueue();
  if (queue.length === 0) return;

  console.log(`Processing ${queue.length} offline actions...`);
  
  const failedActions: OfflineAction[] = [];
  let allSuccess = true;

  for (const action of queue) {
    if (!allSuccess) {
      failedActions.push(action);
      continue;
    }

    try {
      await api.request({
        method: action.method,
        url: action.url,
        data: action.data,
        // Send a custom header so backend knows this is a delayed sync
        headers: { 'X-Offline-Sync-Time': new Date(action.timestamp).toISOString() }
      });
      console.log(`✅ Synced action: ${action.method.toUpperCase()} ${action.url}`);
    } catch (error) {
      console.error(`❌ Failed to sync action: ${action.method.toUpperCase()} ${action.url}`, error);
      allSuccess = false;
      failedActions.push(action);
    }
  }

  // Write remaining failed actions back to queue
  if (failedActions.length > 0) {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedActions));
  } else {
    await clearQueue();
  }
}
