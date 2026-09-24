import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Button, Card } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { usePurchaseStore } from '../../store/purchaseStore';
import { Spacing, BorderRadius } from '../../constants/layout';

export default function PaywallScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { packages, isLoading, purchasePackage, restorePurchases, isPremium } = usePurchaseStore();

  useEffect(() => {
    if (isPremium) {
      router.back();
    }
  }, [isPremium]);

  const handlePurchase = async (pkg: any) => {
    const success = await purchasePackage(pkg);
    if (success) {
      router.back();
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      router.back();
    } else {
      alert('No active subscription found to restore.');
    }
  };

  const features = [
    'Unlimited Habits',
    'Advanced Analytics & Insights',
    'Custom Notification Sounds',
    'Exclusive Themes & App Icons',
    'Priority Support'
  ];

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore}>
          <ThemedText variant="caption" color="secondary">Restore</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.neon}20` }]}>
            <Ionicons name="diamond" size={64} color={colors.neon} />
          </View>
          <ThemedText variant="title" style={styles.title}>Unlock Premium</ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.subtitle}>
            Supercharge your productivity with all Pro features.
          </ThemedText>
        </View>

        <Card style={styles.featuresCard}>
          {features.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={24} color={colors.neon} />
              <ThemedText variant="body" style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </Card>

        <View style={styles.packagesContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.neon} />
          ) : packages.length > 0 ? (
            packages.map((pkg) => (
              <Button
                key={pkg.identifier}
                variant="primary"
                fullWidth
                style={styles.packageBtn}
                onPress={() => handlePurchase(pkg)}
              >
                {pkg.product.title} - {pkg.product.priceString}
              </Button>
            ))
          ) : (
            <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
              No subscriptions available right now.
            </ThemedText>
          )}
        </View>

        <View style={styles.footer}>
          <ThemedText variant="caption" color="tertiary" style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy. Subscriptions auto-renew until canceled.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  closeBtn: { padding: Spacing.xs },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  featuresCard: {
    padding: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  packagesContainer: {
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  packageBtn: {
    paddingVertical: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  }
});
