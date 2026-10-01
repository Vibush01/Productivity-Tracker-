import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.65, 280);
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerDisplayProps {
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';
  timeLeft: number; // in seconds
  totalTime: number; // total duration for the circle (in seconds)
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function TimerDisplay({ mode, timeLeft, totalTime, isActive, onToggle, onReset }: TimerDisplayProps) {
  const { colors } = useTheme();
  
  // Need local state for animated offset to make it smooth, 
  // but since we update every second, we can just compute it directly for now.
  const progress = mode === 'stopwatch' 
    ? 0 // No progress ring for stopwatch
    : totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getColor = () => {
    if (mode === 'pomodoro') return colors.neon;
    if (mode === 'stopwatch') return colors.warning;
    return colors.info; // breaks
  };

  const activeColor = getColor();
  const fontSize = CIRCLE_SIZE * 0.22;

  return (
    <View style={styles.container}>
      <View style={[styles.svgContainer, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
          {/* Background Circle */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            stroke={colors.bgTertiary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress Circle */}
          {mode !== 'stopwatch' && (
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke={activeColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              // Rotate -90deg so it starts at the top
              transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
            />
          )}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.textContainer]}>
          <ThemedText style={[styles.timeText, { fontSize }]} color="primary">
            {timeString}
          </ThemedText>
        </View>
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
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
