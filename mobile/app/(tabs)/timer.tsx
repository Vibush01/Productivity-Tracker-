/**
 * Timer Tab — Focus timer
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView, ThemedText, Button } from '../../components/common';
import { TimerDisplay } from '../../components/timer/TimerDisplay';
import { useTheme } from '../../hooks/useTheme';
import { useTimerStore } from '../../store/timerStore';
import { Spacing } from '../../constants/layout';
import * as Haptics from 'expo-haptics';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';

const MODE_DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function TimerScreen() {
  const { colors } = useTheme();
  
  const saveSession = useTimerStore((s) => s.saveSession);

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0 && mode !== 'stopwatch') {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && mode === 'stopwatch') {
      interval = setInterval(() => {
        setTimeLeft((time) => time + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isActive && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setSessionStartTime(null);
    if (mode !== 'stopwatch') {
      setTimeLeft(MODE_DURATIONS[mode]);
    } else {
      setTimeLeft(0);
    }
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    if (isActive) {
      // Prompt user or auto-stop, for now just switch
      setIsActive(false);
    }
    setMode(newMode);
    if (newMode !== 'stopwatch') {
      setTimeLeft(MODE_DURATIONS[newMode]);
    } else {
      setTimeLeft(0);
    }
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (mode === 'pomodoro' && sessionStartTime) {
      try {
        const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
        await saveSession({
          mode,
          duration,
          completed: true,
          startTime: sessionStartTime.toISOString(),
          endTime: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to save session', e);
      }
    }
    setSessionStartTime(null);
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeRow}>
        {(['pomodoro', 'shortBreak', 'stopwatch'] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => handleModeSwitch(m)}
            style={styles.modeBtn}
          >
            {m === 'pomodoro' ? 'Focus' : m === 'shortBreak' ? 'Break' : 'Stopwatch'}
          </Button>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TimerDisplay
          mode={mode}
          timeLeft={timeLeft}
          isActive={isActive}
          onToggle={handleToggle}
          onReset={handleReset}
        />
        
        <View style={styles.infoBox}>
          <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
            {mode === 'pomodoro' 
              ? 'Stay focused. Your session will be saved automatically when the timer ends.' 
              : mode === 'stopwatch' 
              ? 'Track your time freely without limits.' 
              : 'Take a breather. You earned it!'}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  modeBtn: {
    flex: 1,
  },
  scroll: { 
    padding: Spacing.xl, 
    paddingBottom: Spacing['5xl'],
    alignItems: 'center',
  },
  infoBox: {
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  }
});
