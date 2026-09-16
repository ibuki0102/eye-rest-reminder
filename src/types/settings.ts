import type { WeeklySchedule } from './schedule'

export type AppLocale = 'zh-TW' | 'en-US'
export type ThemePreference = 'system' | 'light' | 'dark'
export type ReminderMode = 'gentle' | 'focus' | 'strict'
export interface AppSettings {
  focusMinutes: number
  restSeconds: number
  notificationsEnabled: boolean
  soundEnabled: boolean
  launchAtStartup: boolean
  locale: AppLocale
  theme: ThemePreference
  reminderMode: ReminderMode
  hasSeenCloseHint: boolean
  schedule: WeeklySchedule
}

export const defaultSettings: AppSettings = {
  focusMinutes: 20,
  restSeconds: 20,
  notificationsEnabled: true,
  soundEnabled: false,
  launchAtStartup: false,
  locale: 'zh-TW',
  theme: 'system',
  reminderMode: 'gentle',
  hasSeenCloseHint: false,
  schedule: { enabled: false, days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '18:00' },
}
