import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Responsive circle: 65% of screen width, capped at 280
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.65, 280);
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

interface TimerDisplayProps {
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';
  timeLeft: number; // in seconds
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function TimerDisplay({ mode, timeLeft, isActive, onToggle, onReset }: TimerDisplayProps) {
  const { colors } = useTheme();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getColor = () => {
    if (mode === 'pomodoro') return colors.neon;
    if (mode === 'stopwatch') return colors.warning;
    return colors.info; // breaks
  };

  const activeColor = getColor();

  // Font size scales with circle
  const fontSize = CIRCLE_SIZE * 0.22;

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: activeColor, width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_RADIUS }]}>
        <ThemedText style={[styles.timeText, { fontSize }]} color="primary">
          {timeString}
        </ThemedText>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, styles.resetBtn, { backgroundColor: colors.bgTertiary }]}
          onPress={onReset}
        >
          <Ionicons name="refresh" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.playBtn, { backgroundColor: activeColor }]}
          onPress={onToggle}
        >
          <Ionicons name={isActive ? 'pause' : 'play'} size={32} color={colors.bgPrimary} />
        </TouchableOpacity>
        
        {/* Placeholder for future skip/stop button to maintain balance */}
        <View style={styles.btnPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  circle: {
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  timeText: {
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  btnPlaceholder: {
    width: 56,
    height: 56,
  }
});
