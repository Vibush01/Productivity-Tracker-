/**
 * Timer Tab — Focus timer with presets and session history
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, Button, Card } from '../../components/common';
import { TimerDisplay } from '../../components/timer/TimerDisplay';
import { useTheme } from '../../hooks/useTheme';
import { useTimerStore } from '../../store/timerStore';
import { Spacing, BorderRadius } from '../../constants/layout';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';

const FOCUS_PRESETS = [15, 25, 30, 45, 60, 90, 120]; // in minutes

const MODE_DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function TimerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const saveSession = useTimerStore((s) => s.saveSession);
  const fetchSessions = useTimerStore((s) => s.fetchSessions);
  const sessions = useTimerStore((s) => s.sessions);

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [totalTime, setTotalTime] = useState(MODE_DURATIONS.pomodoro);
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Fetch today's sessions on mount
  useEffect(() => {
    // A simple query to get recent sessions
    fetchSessions({ limit: '10' });
  }, []);

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
      setTimeLeft(totalTime);
    } else {
      setTimeLeft(0);
    }
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    if (isActive) setIsActive(false);
    setMode(newMode);
    
    if (newMode !== 'stopwatch') {
      setTotalTime(MODE_DURATIONS[newMode]);
      setTimeLeft(MODE_DURATIONS[newMode]);
    } else {
      setTotalTime(0);
      setTimeLeft(0);
    }
    setSessionStartTime(null);
  };

  const handlePresetSelect = (minutes: number) => {
    if (isActive) setIsActive(false);
    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setSessionStartTime(null);
  };

  const adjustTime = (minutes: number) => {
    if (isActive) setIsActive(false);
    const newTotal = Math.max(60, totalTime + minutes * 60); // min 1 minute
    setTotalTime(newTotal);
    setTimeLeft(newTotal);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (sessionStartTime) {
      try {
        const actualDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
        
        await saveSession({
          type: mode === 'stopwatch' ? 'stopwatch' : 'pomodoro',
          duration: mode === 'stopwatch' ? actualDuration : totalTime,
          actualDuration,
          startedAt: sessionStartTime.toISOString(),
          endedAt: new Date().toISOString(),
        });
        
        // Refresh history
        fetchSessions({ limit: '10' });
      } catch (e) {
        console.error('Failed to save session', e);
      }
    }
    setSessionStartTime(null);
  };

  // Filter sessions to only show today's
  const today = new Date().toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => s.startedAt && s.startedAt.startsWith(today));

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Mode Selector */}
      <View style={[styles.modeRow, { paddingTop: Math.max(Spacing.md, insets.top) }]}>
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

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        
        <TimerDisplay
          mode={mode}
          timeLeft={timeLeft}
          totalTime={totalTime}
          isActive={isActive}
          onToggle={handleToggle}
          onReset={handleReset}
        />
        
        {/* Focus Presets */}
        {mode === 'pomodoro' && (
          <View style={styles.presetsContainer}>
            <ThemedText variant="caption" color="secondary" style={styles.presetsTitle}>
              PRESETS
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
              <TouchableOpacity
                style={[styles.presetChip, { backgroundColor: colors.bgTertiary }]}
                onPress={() => adjustTime(-5)}
              >
                <ThemedText style={{ color: colors.textSecondary, fontWeight: '600' }}>-5m</ThemedText>
              </TouchableOpacity>
              
              {FOCUS_PRESETS.map(mins => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.presetChip,
                    { 
                      backgroundColor: totalTime === mins * 60 ? `${colors.neon}20` : colors.bgTertiary,
                      borderColor: totalTime === mins * 60 ? colors.neon : 'transparent'
                    }
                  ]}
                  onPress={() => handlePresetSelect(mins)}
                >
                  <ThemedText 
                    style={{ 
                      color: totalTime === mins * 60 ? colors.neon : colors.textSecondary,
                      fontWeight: '600'
                    }}
                  >
                    {mins}m
                  </ThemedText>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.presetChip, { backgroundColor: colors.bgTertiary }]}
                onPress={() => adjustTime(5)}
              >
                <ThemedText style={{ color: colors.textSecondary, fontWeight: '600' }}>+5m</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Info Text */}
        <View style={styles.infoBox}>
          <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
            {mode === 'pomodoro' 
              ? 'Stay focused. Your session will be saved automatically when the timer ends.' 
              : mode === 'stopwatch' 
              ? 'Track your time freely without limits.' 
              : 'Take a breather. You earned it!'}
          </ThemedText>
        </View>

        {/* Today's Sessions */}
        <View style={styles.historyContainer}>
          <ThemedText variant="subtitle" style={styles.historyTitle}>Today's Sessions</ThemedText>
          
          {todaysSessions.length > 0 ? (
            todaysSessions.map(session => (
              <Card key={session._id} style={styles.sessionCard}>
                <View style={styles.sessionLeft}>
                  <View style={[styles.sessionIcon, { backgroundColor: session.type === 'pomodoro' ? `${colors.neon}20` : `${colors.warning}20` }]}>
                    <Ionicons 
                      name={session.type === 'pomodoro' ? 'flame' : 'stopwatch'} 
                      size={20} 
                      color={session.type === 'pomodoro' ? colors.neon : colors.warning} 
                    />
                  </View>
                  <View>
                    <ThemedText style={{ fontWeight: '600' }}>
                      {session.type === 'pomodoro' ? 'Focus Session' : 'Stopwatch'}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      {format(new Date(session.startedAt), 'h:mm a')}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={{ fontWeight: '700', fontFamily: 'SpaceMono' }}>
                  {Math.floor(session.actualDuration / 60)}m
                </ThemedText>
              </Card>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
                No sessions completed today. Start tracking to build your streak!
              </ThemedText>
            </View>
          )}
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
    paddingTop: Spacing.md,
  },
  presetsContainer: {
    marginBottom: Spacing.xl,
  },
  presetsTitle: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  presetsList: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  presetChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  infoBox: {
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  historyContainer: {
    marginTop: Spacing.md,
  },
  historyTitle: {
    marginBottom: Spacing.lg,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistory: {
    padding: Spacing.xl,
    alignItems: 'center',
  }
});
