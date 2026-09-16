<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DailyStatistics } from '../types/statistics'

const props = defineProps<{
  today: DailyStatistics
  week: DailyStatistics[]
  entries: DailyStatistics[]
  feedback: string | null
}>()
defineEmits<{ close: []; clear: [] }>()

const { locale, t } = useI18n()
const weekTotals = computed(() =>
  props.week.reduce(
    (totals, entry) => {
      totals.focusSessions += entry.completedFocusSessions
      totals.restBreaks += entry.completedRestBreaks
      totals.focusSeconds += entry.focusSeconds
      return totals
    },
    { focusSessions: 0, restBreaks: 0, focusSeconds: 0 },
  ),
)

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return t('statistics.duration', { minutes, seconds: remainingSeconds })
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(locale.value, { month: 'numeric', day: 'numeric' }).format(
    new Date(`${date}T00:00:00`),
  )
}
</script>

<template>
  <section class="statistics">
    <h1>{{ t('statistics.title') }}</h1>
    <h2>{{ t('statistics.today') }}</h2>
    <div class="summary-grid">
      <article>
        <strong>{{ today.completedFocusSessions }}</strong
        ><span>{{ t('statistics.focusSessions') }}</span>
      </article>
      <article>
        <strong>{{ today.completedRestBreaks }}</strong
        ><span>{{ t('statistics.restBreaks') }}</span>
      </article>
      <article>
        <strong>{{ formatDuration(today.focusSeconds) }}</strong
        ><span>{{ t('statistics.focusTime') }}</span>
      </article>
    </div>
    <h2>{{ t('statistics.lastSevenDays') }}</h2>
    <div class="summary-grid compact">
      <article>
        <strong>{{ weekTotals.focusSessions }}</strong
        ><span>{{ t('statistics.focusSessions') }}</span>
      </article>
      <article>
        <strong>{{ weekTotals.restBreaks }}</strong
        ><span>{{ t('statistics.restBreaks') }}</span>
      </article>
      <article>
        <strong>{{ formatDuration(weekTotals.focusSeconds) }}</strong
        ><span>{{ t('statistics.focusTime') }}</span>
      </article>
    </div>
    <ul class="week-list week-details">
      <li v-for="entry in week" :key="entry.date">
        <span>{{ formatDate(entry.date) }}</span>
        <span>{{
          t('statistics.daySummary', {
            count: entry.completedFocusSessions,
            duration: formatDuration(entry.focusSeconds),
          })
        }}</span>
      </li>
      <li v-if="week.length === 0" class="empty">{{ t('statistics.empty') }}</li>
    </ul>
    <p v-if="week.length === 0" class="empty-description">{{ t('statistics.emptyDescription') }}</p>
    <div class="actions data-actions">
      <button class="danger" @click="$emit('clear')">{{ t('statistics.clear') }}</button>
      <button class="plain" @click="$emit('close')">{{ t('app.back') }}</button>
    </div>
    <p v-if="feedback" class="saved">{{ feedback }}</p>
  </section>
</template>
