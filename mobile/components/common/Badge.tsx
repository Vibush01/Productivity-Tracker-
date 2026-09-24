/**
 * Badge — Small status indicator with themed colors.
 *
 * Usage:
 *   <Badge type="streak" value={14} />
 *   <Badge type="level" value={5} />
 *   <Badge type="priority" value="urgent" />
 *   <Badge type="xp" value="+25 XP" />
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';

type BadgeType = 'streak' | 'level' | 'xp' | 'priority' | 'custom';

interface BadgeProps {
  type?: BadgeType;
  value: string | number;
  color?: string;
  textColor?: string;
}

export function Badge({ type = 'custom', value, color, textColor }: BadgeProps) {
  const { colors } = useTheme();

  const getColors = (): { bg: string; fg: string } => {
    switch (type) {
      case 'streak':
        return { bg: `${colors.warning}20`, fg: colors.warning };
      case 'level':
        return { bg: `${colors.neon}20`, fg: colors.neon };
      case 'xp':
        return { bg: `${colors.info}20`, fg: colors.info };
      case 'priority': {
        const p = String(value).toLowerCase();
        if (p === 'urgent') return { bg: `${colors.danger}20`, fg: colors.danger };
        if (p === 'high') return { bg: `${colors.priorityHigh}20`, fg: colors.priorityHigh };
        if (p === 'medium') return { bg: `${colors.warning}20`, fg: colors.warning };
        return { bg: `${colors.textTertiary}20`, fg: colors.textTertiary };
      }
      default:
        return { bg: color || `${colors.neon}20`, fg: textColor || colors.neon };
    }
  };

  const { bg, fg } = getColors();

  const displayValue = type === 'streak' ? `🔥 ${value}` : type === 'level' ? `Lv.${value}` : String(value);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
