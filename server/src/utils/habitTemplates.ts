// Habit template packs — pre-built habit collections for one-click import

export interface HabitTemplate {
  title: string;
  description: string;
  icon: string;
  color: string;
  frequency: { type: string; daysOfWeek?: number[] };
  goalType: string;
  goalValue?: number;
  goalUnit?: string;
}

export interface TemplatePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  habits: HabitTemplate[];
}

export const TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: 'fitness-starter',
    name: 'Fitness Starter',
    description: 'Build a solid foundation for your fitness journey',
    icon: '💪',
    color: '#FF6B6B',
    habits: [
      { title: 'Morning Workout', description: '30 min exercise routine', icon: '🏋️', color: '#FF6B6B', frequency: { type: 'daily' }, goalType: 'duration', goalValue: 30, goalUnit: 'minutes' },
      { title: 'Drink Water', description: 'Stay hydrated — 8 glasses', icon: '💧', color: '#00D1FF', frequency: { type: 'daily' }, goalType: 'count', goalValue: 8, goalUnit: 'glasses' },
      { title: '10K Steps', description: 'Walk at least 10,000 steps', icon: '🚶', color: '#39FF14', frequency: { type: 'daily' }, goalType: 'count', goalValue: 10000, goalUnit: 'steps' },
      { title: 'Stretch', description: '10 min flexibility routine', icon: '🧘', color: '#A855F7', frequency: { type: 'daily' }, goalType: 'duration', goalValue: 10, goalUnit: 'minutes' },
      { title: 'No Junk Food', description: 'Avoid processed snacks', icon: '🥗', color: '#2ECC0F', frequency: { type: 'daily' }, goalType: 'boolean' },
    ],
  },
  {
    id: 'study-routine',
    name: 'Study Routine',
    description: 'Optimize your learning with proven study habits',
    icon: '📚',
    color: '#00D1FF',
    habits: [
      { title: 'Focused Study', description: '2 hours deep study session', icon: '📖', color: '#00D1FF', frequency: { type: 'daily' }, goalType: 'duration', goalValue: 120, goalUnit: 'minutes' },
      { title: 'Review Notes', description: 'Review today\'s material', icon: '📝', color: '#FFB800', frequency: { type: 'daily' }, goalType: 'boolean' },
      { title: 'Read 20 Pages', description: 'Read non-fiction or coursework', icon: '📕', color: '#A855F7', frequency: { type: 'daily' }, goalType: 'count', goalValue: 20, goalUnit: 'pages' },
      { title: 'Practice Problems', description: 'Solve practice sets', icon: '🧮', color: '#FF6B6B', frequency: { type: 'weekly', daysOfWeek: [1, 3, 5] }, goalType: 'count', goalValue: 10, goalUnit: 'problems' },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Cultivate inner peace and mental clarity',
    icon: '🧘',
    color: '#A855F7',
    habits: [
      { title: 'Morning Meditation', description: '10 min guided meditation', icon: '🧘', color: '#A855F7', frequency: { type: 'daily' }, goalType: 'duration', goalValue: 10, goalUnit: 'minutes' },
      { title: 'Gratitude Journal', description: 'Write 3 things you\'re grateful for', icon: '🙏', color: '#FFB800', frequency: { type: 'daily' }, goalType: 'count', goalValue: 3, goalUnit: 'items' },
      { title: 'Digital Detox', description: 'No screens 1hr before bed', icon: '📵', color: '#FF6B6B', frequency: { type: 'daily' }, goalType: 'boolean' },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity Pro',
    description: 'Master your time and output',
    icon: '⚡',
    color: '#39FF14',
    habits: [
      { title: 'Morning Routine', description: 'Complete morning ritual (exercise, shower, breakfast)', icon: '🌅', color: '#FFB800', frequency: { type: 'daily' }, goalType: 'boolean' },
      { title: 'Plan Tomorrow', description: 'Write tomorrow\'s top 3 priorities', icon: '📋', color: '#00D1FF', frequency: { type: 'daily' }, goalType: 'boolean' },
      { title: 'Deep Work', description: '3 hours uninterrupted focus', icon: '🎯', color: '#39FF14', frequency: { type: 'daily' }, goalType: 'duration', goalValue: 180, goalUnit: 'minutes' },
      { title: 'Inbox Zero', description: 'Clear all emails and messages', icon: '📧', color: '#A855F7', frequency: { type: 'daily' }, goalType: 'boolean' },
      { title: 'Weekly Review', description: 'Review the week and plan ahead', icon: '📊', color: '#FF6B6B', frequency: { type: 'weekly', daysOfWeek: [0] }, goalType: 'boolean' },
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Take care of your body and mind',
    icon: '❤️',
    color: '#FF6B6B',
    habits: [
      { title: 'Sleep 8 Hours', description: 'Get quality sleep', icon: '😴', color: '#6366F1', frequency: { type: 'daily' }, goalType: 'duration', goalValue: 480, goalUnit: 'minutes' },
      { title: 'Eat Fruits', description: 'At least 2 servings of fruit', icon: '🍎', color: '#FF6B6B', frequency: { type: 'daily' }, goalType: 'count', goalValue: 2, goalUnit: 'servings' },
      { title: 'Take Vitamins', description: 'Daily supplement routine', icon: '💊', color: '#FFB800', frequency: { type: 'daily' }, goalType: 'boolean' },
      { title: 'Limit Caffeine', description: 'Max 2 cups of coffee', icon: '☕', color: '#8B4513', frequency: { type: 'daily' }, goalType: 'count', goalValue: 2, goalUnit: 'cups' },
    ],
  },
];

export default TEMPLATE_PACKS;
