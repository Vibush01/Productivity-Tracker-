/**
 * Profile Tab — User profile, theme toggle, settings, logout
 */
import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Button, Card, Badge } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, type ThemePreference } from '../../store/themeStore';
import { Spacing, BorderRadius, FontSize } from '../../constants/layout';

const themeOptions: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const preference = useThemeStore((s) => s.preference);
  const setThemePref = useThemeStore((s) => s.setPreference);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.userCard} variant="neon">
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: `${colors.neon}20` }]}>
              <ThemedText variant="title" color="neon">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText variant="title">{user?.name || 'Guest'}</ThemedText>
              <ThemedText variant="caption" color="secondary">
                {user?.email || 'Not logged in'}
              </ThemedText>
              <View style={styles.badges}>
                {user && <Badge type="level" value={user.level} />}
                {user && <Badge type="xp" value={`${user.xp} XP`} />}
              </View>
            </View>
          </View>
        </Card>

        {/* Theme Selector */}
        <ThemedText variant="label" color="secondary" style={styles.sectionLabel}>
          APPEARANCE
        </ThemedText>
        <Card style={styles.themeCard}>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => {
              const isActive = preference === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: isActive ? `${colors.neon}15` : colors.bgTertiary,
                      borderColor: isActive ? colors.neon : 'transparent',
                    },
                  ]}
                  onPress={() => setThemePref(opt.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={22}
                    color={isActive ? colors.neon : colors.textSecondary}
                  />
                  <ThemedText
                    variant="caption"
                    color={isActive ? 'neon' : 'secondary'}
                    style={styles.themeLabel}
                  >
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Settings List */}
        <ThemedText variant="label" color="secondary" style={styles.sectionLabel}>
          SETTINGS
        </ThemedText>
        <Card>
          <SettingsRow icon="notifications-outline" label="Notifications" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="cloud-download-outline" label="Backup & Export" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="information-circle-outline" label="About" colors={colors} />
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          fullWidth
          style={styles.logoutBtn}
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
        >
          Log Out
        </Button>

        <ThemedText variant="caption" color="tertiary" style={styles.version}>
          Productivity Tracker v1.0.0
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function SettingsRow({ icon, label, colors }: { icon: string; label: string; colors: any }) {
  return (
    <TouchableOpacity style={styles.settingsRow} activeOpacity={0.6}>
      <Ionicons name={icon as any} size={22} color={colors.textSecondary} />
      <ThemedText variant="body" style={styles.settingsLabel}>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  userCard: { marginBottom: Spacing.lg },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: { flex: 1 },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  sectionLabel: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  themeCard: {},
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.xs,
  },
  themeLabel: {
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  settingsLabel: { flex: 1 },
  divider: { height: 1 },
  logoutBtn: { marginTop: Spacing['3xl'] },
  version: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
