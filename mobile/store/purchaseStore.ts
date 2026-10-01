import { create } from 'zustand';

/**
 * Purchase Store
 * 
 * Currently all users are default premium.
 * Subscription model will be added later via RevenueCat.
 * For now, isPremium is always true and purchase/restore are no-ops.
 */

interface PurchaseState {
  isPremium: boolean;
  packages: any[];
  isLoading: boolean;
  initialize: () => Promise<void>;
  purchasePackage: (pkg: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  // All users are premium by default
  isPremium: true,
  packages: [],
  isLoading: false,

  initialize: async () => {
    // All users get premium access by default
    // RevenueCat will be configured here when subscription model is added
    console.log('[Purchases] All users are premium by default.');
    set({ isPremium: true });
  },

  purchasePackage: async () => {
    // No-op — all users are already premium
    return true;
  },

  restorePurchases: async () => {
    // No-op — all users are already premium
    set({ isPremium: true });
    return true;
  },
}));
