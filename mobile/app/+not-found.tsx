import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText, Button } from '../components/common';
import { Spacing } from '../constants/layout';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView variant="primary" style={styles.container}>
        <ThemedText variant="title">Page not found</ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.sub}>
          This screen doesn't exist.
        </ThemedText>
        <Link href="/(tabs)" asChild>
          <Button variant="primary" style={styles.btn}>
            Go to Dashboard
          </Button>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  sub: { marginTop: Spacing.sm },
  btn: { marginTop: Spacing['2xl'] },
});
