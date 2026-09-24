import { useEffect, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { processQueue, getQueue } from '../services/sync';

export function useSyncQueue() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isProcessing = useRef(false);

  useEffect(() => {
    // When we transition to having internet, try processing
    if (isConnected && isInternetReachable !== false) {
      triggerSync();
    }
  }, [isConnected, isInternetReachable]);

  const triggerSync = async () => {
    if (isProcessing.current) return;
    
    try {
      const queue = await getQueue();
      if (queue.length === 0) return;
      
      isProcessing.current = true;
      await processQueue();
    } finally {
      isProcessing.current = false;
    }
  };

  return { triggerSync };
}
