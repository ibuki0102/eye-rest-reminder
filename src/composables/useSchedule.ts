import type { Ref } from 'vue'
import type { AppSettings } from '../types/settings'
export function useSchedule(settings: Ref<AppSettings>) {
  const isActiveNow = () => {
    const schedule = settings.value.schedule
    if (!schedule.enabled) return true
    const now = new Date()
    if (!schedule.days.includes(now.getDay())) return false
    const time = now.toTimeString().slice(0, 5)
    return schedule.startTime <= schedule.endTime
      ? time >= schedule.startTime && time < schedule.endTime
      : time >= schedule.startTime || time < schedule.endTime
  }
  return { isActiveNow }
}
