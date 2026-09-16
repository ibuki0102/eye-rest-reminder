export interface WeeklySchedule {
  enabled: boolean
  days: number[]
  startTime: string
  endTime: string
}
export const defaultSchedule: WeeklySchedule = {
  enabled: false,
  days: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '18:00',
}
