import { computed, ref } from 'vue'
import { readStatistics, writeStatistics } from '../services/storageService'
import { emptyDailyStatistics, type DailyStatistics } from '../types/statistics'
const dayKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useStatistics() {
  const entries = ref<DailyStatistics[]>([])
  const today = computed(
    () => entries.value.find((entry) => entry.date === dayKey()) ?? emptyDailyStatistics(dayKey()),
  )
  const week = computed(() => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    return entries.value.filter((entry) => entry.date >= dayKey(start))
  })

  async function initialize() {
    try {
      entries.value = await readStatistics()
    } catch {
      /* Browser preview uses in-memory statistics. */
    }
  }

  async function update(mutator: (entry: DailyStatistics) => void) {
    const date = dayKey()
    let entry = entries.value.find((item) => item.date === date)
    if (!entry) {
      entry = emptyDailyStatistics(date)
      entries.value.push(entry)
    }
    mutator(entry)
    entries.value = [...entries.value]
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-90)
    try {
      await writeStatistics(entries.value)
    } catch {
      /* Browser preview uses in-memory statistics. */
    }
  }

  const recordFocus = (seconds: number) =>
    update((entry) => {
      entry.completedFocusSessions += 1
      entry.focusSeconds += seconds
    })
  const recordRest = () =>
    update((entry) => {
      entry.completedRestBreaks += 1
    })

  async function clear() {
    entries.value = []
    try {
      await writeStatistics([])
    } catch {
      /* Browser preview uses in-memory statistics. */
    }
  }

  return { entries, today, week, initialize, recordFocus, recordRest, clear }
}
