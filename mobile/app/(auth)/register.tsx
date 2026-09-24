/**
 * Register Screen
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Input, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize } from '../../constants/layout';
import { api } from '../../services/api';
import { secureStorage, storage } from '../../services/storage';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.success) {
        await secureStorage.setToken(data.data.token);
        await storage.set('user', data.data.user);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="flash" size={48} color={colors.neon} />
            <ThemedText variant="title" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Start building better habits today.
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <ThemedText variant="caption" color="danger" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              autoComplete="name"
              icon={<Ionicons name="person-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              icon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              secureTextEntry
              autoComplete="new-password"
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleRegister}
              style={styles.registerBtn}
            >
              Create Account
            </Button>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <ThemedText variant="body" color="secondary">
              Already have an account?{' '}
            </ThemedText>
            <Link href="/(auth)/login">
              <ThemedText variant="body" color="neon" bold>
                Log In
              </ThemedText>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  title: {
    marginTop: Spacing.lg,
  },
  form: {
    gap: Spacing.lg,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  registerBtn: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
});
