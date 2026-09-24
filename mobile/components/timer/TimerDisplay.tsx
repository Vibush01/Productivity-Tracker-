import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/layout';

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

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: activeColor }]}>
        <ThemedText style={styles.timeText} color="primary">
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
    paddingVertical: Spacing['4xl'],
  },
  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  timeText: {
    fontSize: 64,
    fontWeight: '700',
    fontFamily: 'SpaceMono', // assuming we have a monospace font for timer
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
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  btnPlaceholder: {
    width: 56,
    height: 56,
  }
});
