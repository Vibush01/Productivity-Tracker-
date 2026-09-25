import { create } from 'zustand';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

const REVENUECAT_API_KEY_IOS = 'YOUR_APPLE_API_KEY';
const REVENUECAT_API_KEY_ANDROID = 'YOUR_GOOGLE_API_KEY';

interface PurchaseState {
  isPremium: boolean;
  packages: PurchasesPackage[];
  isLoading: boolean;
  initialize: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  isPremium: false,
  packages: [],
  isLoading: false,

  initialize: async () => {
    if (isExpoGo) {
      console.log('[Purchases] Skipped — RevenueCat not available in Expo Go.');
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
      } else if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        set({ packages: offerings.current.availablePackages });
      }

      set({ isPremium });
    } catch (e) {
      console.error('Error initializing RevenueCat', e);
    }
  },

  purchasePackage: async (pkg: PurchasesPackage) => {
    set({ isLoading: true });
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      set({ isPremium, isLoading: false });
      return isPremium;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Error purchasing package', e);
      }
      set({ isLoading: false });
      return false;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true });
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      set({ isPremium, isLoading: false });
      return isPremium;
    } catch (e) {
      console.error('Error restoring purchases', e);
      set({ isLoading: false });
      return false;
    }
  },
}));
