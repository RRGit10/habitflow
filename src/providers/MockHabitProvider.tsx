import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

import {
  activeHabits,
  allTodayComplete,
  archivedHabits,
  completedTodayCount,
  initialMockHabits,
  longestStreak,
  type Habit,
  type NotificationStatus,
  overallStreak,
} from "../data/mock-data";

type UndoState = {
  habitId: string;
  previousValue: boolean;
  text: string;
};

type MockHabitContextValue = {
  activeHabits: Habit[];
  allTodayComplete: boolean;
  archiveHabit: (habitId: string) => void;
  archivedHabits: Habit[];
  completedTodayCount: number;
  dismissUndo: () => void;
  habits: Habit[];
  longestStreak: number;
  notificationStatus: NotificationStatus;
  overallStreak: number;
  pushNotificationsEnabled: boolean;
  setNotificationStatus: (status: NotificationStatus) => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  toggleHabitCheckIn: (habitId: string) => void;
  undo: UndoState | null;
  undoLastCheckIn: () => void;
};

const MockHabitContext = createContext<MockHabitContextValue | null>(null);

export function MockHabitProvider({ children }: PropsWithChildren) {
  const [habits, setHabits] = useState<Habit[]>(initialMockHabits);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>("off");
  const [undo, setUndo] = useState<UndoState | null>(null);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!undo) return;

    undoTimeout.current = setTimeout(() => setUndo(null), 5000);
    return () => {
      if (undoTimeout.current) clearTimeout(undoTimeout.current);
    };
  }, [undo]);

  function dismissUndo() {
    setUndo(null);
  }

  function toggleHabitCheckIn(habitId: string) {
    const habit = habits.find((item) => item.id === habitId);
    if (!habit) return;

    const nextValue = !habit.completedToday;
    setHabits((current) => current.map((item) => (item.id === habitId ? { ...item, completedToday: nextValue } : item)));
    setUndo({
      habitId,
      previousValue: habit.completedToday,
      text: nextValue ? `${habit.name} marked complete` : `${habit.name} marked incomplete`,
    });
  }

  function undoLastCheckIn() {
    if (!undo) return;

    setHabits((current) => current.map((item) => (item.id === undo.habitId ? { ...item, completedToday: undo.previousValue } : item)));
    dismissUndo();
  }

  function archiveHabit(habitId: string) {
    setHabits((current) => current.map((item) => (item.id === habitId ? { ...item, archived: true } : item)));
  }

  const value: MockHabitContextValue = {
    activeHabits: activeHabits(habits),
    allTodayComplete: allTodayComplete(habits),
    archiveHabit,
    archivedHabits: archivedHabits(habits),
    completedTodayCount: completedTodayCount(habits),
    dismissUndo,
    habits,
    longestStreak: longestStreak(habits),
    notificationStatus,
    overallStreak: overallStreak(habits),
    pushNotificationsEnabled: notificationStatus === "on",
    setNotificationStatus,
    setPushNotificationsEnabled: (enabled) => setNotificationStatus(enabled ? "on" : "off"),
    toggleHabitCheckIn,
    undo,
    undoLastCheckIn,
  };

  return <MockHabitContext.Provider value={value}>{children}</MockHabitContext.Provider>;
}

export function useMockHabits() {
  const value = useContext(MockHabitContext);
  if (!value) throw new Error("useMockHabits must be used inside MockHabitProvider.");
  return value;
}
