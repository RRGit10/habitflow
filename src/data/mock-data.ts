export type Habit = {
  archived: boolean;
  category: "drink" | "eat" | "read" | "sleep" | "workout";
  completedToday: boolean;
  id: string;
  longestStreak: number;
  name: string;
  reminderTime?: string;
  scheduledDaysPerWeek: number;
  schedule: string;
  streak: number;
};

export type NotificationStatus = "blocked" | "off" | "on";

export const initialMockHabits: Habit[] = [
  {
    archived: false,
    category: "drink",
    completedToday: true,
    id: "drink-water",
    longestStreak: 10,
    name: "Drink Water",
    reminderTime: "7:00 AM",
    scheduledDaysPerWeek: 7,
    schedule: "Every day",
    streak: 6,
  },
  {
    archived: false,
    category: "workout",
    completedToday: true,
    id: "workout",
    longestStreak: 12,
    name: "Workout",
    reminderTime: "9:00 AM",
    scheduledDaysPerWeek: 5,
    schedule: "Mon, Wed, Fri, Sat, Sun",
    streak: 5,
  },
  {
    archived: false,
    category: "read",
    completedToday: true,
    id: "read",
    longestStreak: 9,
    name: "Read",
    reminderTime: "1:00 PM",
    scheduledDaysPerWeek: 7,
    schedule: "Every day",
    streak: 5,
  },
  {
    archived: false,
    category: "eat",
    completedToday: false,
    id: "healthy-eating",
    longestStreak: 8,
    name: "Healthy Eating",
    reminderTime: "6:00 PM",
    scheduledDaysPerWeek: 4,
    schedule: "Mon, Tue, Thu, Sat",
    streak: 5,
  },
  {
    archived: false,
    category: "sleep",
    completedToday: false,
    id: "sleep-7-hours",
    longestStreak: 11,
    name: "Sleep 7+ Hours",
    reminderTime: "10:00 PM",
    scheduledDaysPerWeek: 7,
    schedule: "Every day",
    streak: 5,
  },
];

export const mockUser = {
  email: "rabinregmi@example.com",
  firstName: "Rabin",
  fullName: "Rabin Regmi",
};

export const mockPartner = {
  inviteCode: "HABIT-JD",
  isConnected: false,
  lastUpdatedMinutes: 8,
  name: "Jordan Davis",
  privateHabitCount: 1,
  sharedHabitIds: ["workout", "read", "drink-water"],
  timezone: "America/Los_Angeles",
};

export function activeHabits(habits: Habit[]) {
  return habits.filter((habit) => !habit.archived);
}

export function archivedHabits(habits: Habit[]) {
  return habits.filter((habit) => habit.archived);
}

export function completedTodayCount(habits: Habit[]) {
  return activeHabits(habits).filter((habit) => habit.completedToday).length;
}

export function scheduledHabitCount(habits: Habit[]) {
  return activeHabits(habits).filter((habit) => habit.scheduledDaysPerWeek > 0).length;
}

export function overallStreak(habits: Habit[]) {
  const streaks = activeHabits(habits)
    .filter((habit) => habit.scheduledDaysPerWeek > 0)
    .map((habit) => habit.streak);

  return streaks.length ? Math.min(...streaks) : 0;
}

export function longestStreak(habits: Habit[]) {
  const streaks = activeHabits(habits).map((habit) => habit.longestStreak);
  return streaks.length ? Math.max(...streaks) : 0;
}

export function allTodayComplete(habits: Habit[]) {
  const active = activeHabits(habits);
  return active.length > 0 && active.every((habit) => habit.completedToday);
}

export function progressForHabit(habit: Habit) {
  return Math.round((habit.scheduledDaysPerWeek / 7) * 100);
}

export function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function greetingForTime(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
