export interface DailyStatistics {
  date: string
  completedFocusSessions: number
  completedRestBreaks: number
  focusSeconds: number
}

export const emptyDailyStatistics = (date: string): DailyStatistics => ({
  date,
  completedFocusSessions: 0,
  completedRestBreaks: 0,
  focusSeconds: 0,
})
