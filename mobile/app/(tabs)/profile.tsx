/**
 * Profile Tab — User profile, settings, logout
 */
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView, ThemedText, Button, Card } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/layout';

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.userCard}>
          <ThemedText variant="title">Guest</ThemedText>
          <ThemedText variant="caption" color="secondary" style={styles.email}>
            Log in to sync your data
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Theme, notifications, backup options will appear here.
          </ThemedText>
        </Card>

        <Button
          variant="secondary"
          fullWidth
          style={styles.loginBtn}
          onPress={() => {}}
        >
          Log In
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  userCard: { marginBottom: Spacing.lg },
  email: { marginTop: Spacing.xs },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.sm },
  loginBtn: { marginTop: Spacing.lg },
});
