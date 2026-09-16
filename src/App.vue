<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { useI18n } from 'vue-i18n'
import BreakActions from './components/BreakActions.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import RestOverlay from './components/RestOverlay.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import StatisticsPanel from './components/StatisticsPanel.vue'
import SystemTrayHintDialog from './components/SystemTrayHintDialog.vue'
import TimerCard from './components/TimerCard.vue'
import UnsavedChangesDialog from './components/UnsavedChangesDialog.vue'
import { useSchedule } from './composables/useSchedule'
import { useSettings } from './composables/useSettings'
import { useStatistics } from './composables/useStatistics'
import { useTimer } from './composables/useTimer'
import { useLocale } from './composables/useLocale'
import { useTheme } from './composables/useTheme'
import type { AppSettings } from './types/settings'
import {
  enableStrictRestWindow,
  hideCurrentWindow,
  restoreReminderWindow,
  showAndFocusCurrentWindow,
} from './services/nativeWindowService'

const { settings, initialize, save, restoreDefaults } = useSettings()
const statistics = useStatistics()
const {
  phase,
  running,
  title,
  clock,
  start,
  pause,
  reset,
  snooze,
  skipRest,
  clear,
  isDnd,
  pendingBreak,
  startDnd,
  endDnd,
  dndUntil,
} = useTimer(settings, {
  onFocusComplete: statistics.recordFocus,
  onRestComplete: statistics.recordRest,
})
const { setLocale } = useLocale(settings)
const { applyTheme } = useTheme(settings)
const { locale, t } = useI18n()
const { isActiveNow } = useSchedule(settings)
type ActivePanel = 'timer' | 'settings' | 'statistics'
type ConfirmationAction = 'restoreSettings' | 'clearStatistics'

const activePanel = ref<ActivePanel>('timer')
const feedback = ref<string | null>(null)
const statisticsFeedback = ref<string | null>(null)
const confirmationAction = ref<ConfirmationAction | null>(null)
const isCloseHintOpen = ref(false)
const isUnsavedDialogOpen = ref(false)
const settingsSnapshot = ref<AppSettings | null>(null)
const pendingPanel = ref<ActivePanel | null>(null)
const scheduleTick = ref(Date.now())
const isStrictRest = computed(
  () => phase.value === 'rest' && settings.value.reminderMode === 'strict',
)
const isOutsideSchedule = computed(() => {
  scheduleTick.value
  return settings.value.schedule.enabled && !isActiveNow()
})
const dndStatus = computed(() => {
  if (!isDnd.value) return ''
  if (dndUntil.value === Number.MAX_SAFE_INTEGER) return t('timer.dndContinuous')
  const time = new Intl.DateTimeFormat(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dndUntil.value ?? Date.now()))
  return t('timer.dndUntil', { time })
})
let stopCloseListener: UnlistenFn | null = null
let stopTrayToggleListener: UnlistenFn | null = null
let scheduleInterval: number | null = null
const confirmationTitle = computed(() => {
  if (confirmationAction.value === 'restoreSettings') return t('settings.restoreDefaultsTitle')
  return t('statistics.clearTitle')
})
const confirmationMessage = computed(() => {
  if (confirmationAction.value === 'restoreSettings') return t('settings.restoreDefaultsConfirm')
  return t('statistics.clearConfirm')
})

function togglePanel(panel: Exclude<ActivePanel, 'timer'>) {
  requestPanel(activePanel.value === panel ? 'timer' : panel)
}

function openSettings() {
  requestPanel('settings')
}

function cloneSettings(source: AppSettings): AppSettings {
  return {
    ...source,
    schedule: { ...source.schedule, days: [...source.schedule.days] },
  }
}

function openPanel(panel: ActivePanel) {
  activePanel.value = panel
  if (panel === 'settings') settingsSnapshot.value = cloneSettings(settings.value)
}

function hasUnsavedSettings() {
  return (
    activePanel.value === 'settings' &&
    settingsSnapshot.value !== null &&
    JSON.stringify(settings.value) !== JSON.stringify(settingsSnapshot.value)
  )
}

function requestPanel(panel: ActivePanel) {
  if (panel !== 'settings' && hasUnsavedSettings()) {
    pendingPanel.value = panel
    isUnsavedDialogOpen.value = true
    return
  }
  openPanel(panel)
}

function finishSettingsNavigation() {
  openPanel(pendingPanel.value ?? 'timer')
  pendingPanel.value = null
  isUnsavedDialogOpen.value = false
  settingsSnapshot.value = null
}

async function saveAndLeaveSettings() {
  await applySettings()
  finishSettingsNavigation()
}

function discardSettingsChanges() {
  if (settingsSnapshot.value) settings.value = cloneSettings(settingsSnapshot.value)
  finishSettingsNavigation()
}

function cancelSettingsNavigation() {
  pendingPanel.value = null
  isUnsavedDialogOpen.value = false
}

function toggleTimerFromTray() {
  if (running.value) pause()
  else start()
}

async function updateTrayState() {
  try {
    await invoke('set_tray_state', {
      statusLabel: `${title.value} · ${clock.value}`,
      toggleLabel: running.value ? t('tray.pause') : t('tray.start'),
    })
  } catch {
    /* Browser preview does not provide a system tray. */
  }
}

async function handleCloseRequest() {
  if (settings.value.hasSeenCloseHint) {
    await hideCurrentWindow()
    return
  }
  isCloseHintOpen.value = true
}

async function acknowledgeCloseHint() {
  settings.value.hasSeenCloseHint = true
  await save()
  isCloseHintOpen.value = false
  await hideCurrentWindow()
}

function showFeedback(message: string) {
  feedback.value = message
  window.setTimeout(() => (feedback.value = null), 1800)
}

function showStatisticsFeedback(message: string) {
  statisticsFeedback.value = message
  window.setTimeout(() => (statisticsFeedback.value = null), 1800)
}

async function applySettings() {
  settings.value.focusMinutes = Math.max(1, Math.floor(settings.value.focusMinutes))
  settings.value.restSeconds = Math.max(5, Math.floor(settings.value.restSeconds))
  await setLocale(settings.value.locale)
  applyTheme()
  await save()
  reset()
  settingsSnapshot.value = cloneSettings(settings.value)
  showFeedback(t('app.saved'))
}

async function restoreDefaultSettings() {
  restoreDefaults()
  await setLocale(settings.value.locale)
  applyTheme()
  await save()
  reset()
  settingsSnapshot.value = cloneSettings(settings.value)
  showFeedback(t('app.restored'))
}

async function confirmAction() {
  const action = confirmationAction.value
  confirmationAction.value = null
  if (action === 'restoreSettings') await restoreDefaultSettings()
  if (action === 'clearStatistics') {
    await statistics.clear()
    showStatisticsFeedback(t('statistics.cleared'))
  }
}
onMounted(async () => {
  await Promise.all([initialize(), statistics.initialize()])
  await setLocale(settings.value.locale)
  applyTheme()
  reset()
  stopCloseListener = await listen('close-requested', handleCloseRequest)
  stopTrayToggleListener = await listen('tray-toggle-timer', toggleTimerFromTray)
  scheduleInterval = window.setInterval(() => (scheduleTick.value = Date.now()), 30000)
})

watch([title, clock, running, locale], () => void updateTrayState(), { immediate: true })

watch(phase, (nextPhase, previousPhase) => {
  if (nextPhase === 'rest') {
    activePanel.value = 'timer'
    if (settings.value.reminderMode === 'strict') {
      void enableStrictRestWindow()
    } else if (settings.value.reminderMode === 'focus') {
      void showAndFocusCurrentWindow()
    }
  }
  if (previousPhase === 'rest' && nextPhase !== 'rest') {
    void restoreReminderWindow()
  }
})

onBeforeUnmount(() => {
  clear()
  stopCloseListener?.()
  stopTrayToggleListener?.()
  if (scheduleInterval !== null) clearInterval(scheduleInterval)
  void restoreReminderWindow()
})
</script>
<template>
  <main class="card" :class="{ rest: phase === 'rest', snooze: phase === 'snooze' }">
    <header>
      <p class="eyebrow">{{ t('app.name') }}</p>
      <span class="tooltip">
        <button class="icon" :aria-label="t('app.settings')" @click="togglePanel('settings')">
          ⚙
        </button>
        <span class="tooltip-content" role="tooltip">{{ t('app.settings') }}</span>
      </span>
      <span class="tooltip">
        <button class="icon" :aria-label="t('statistics.title')" @click="togglePanel('statistics')">
          ◷
        </button>
        <span class="tooltip-content" role="tooltip">{{ t('statistics.title') }}</span>
      </span>
    </header>
    <SettingsPanel
      v-if="activePanel === 'settings'"
      :settings="settings"
      :feedback="feedback"
      @save="applySettings"
      @restore="confirmationAction = 'restoreSettings'"
      @close="requestPanel('timer')"
    />
    <StatisticsPanel
      v-else-if="activePanel === 'statistics'"
      :today="statistics.today.value"
      :week="statistics.week.value"
      :entries="statistics.entries.value"
      :feedback="statisticsFeedback"
      @close="openPanel('timer')"
      @clear="confirmationAction = 'clearStatistics'"
    />
    <BreakActions v-else-if="phase === 'rest'" @snooze="snooze" @skip="skipRest">
      <output aria-live="polite">{{ clock }}</output>
    </BreakActions>
    <TimerCard
      v-else
      :phase="phase"
      :title="title"
      :clock="clock"
      :running="running"
      @start="start"
      @pause="pause"
      @reset="reset"
    />
    <div v-if="activePanel === 'timer'" class="dnd-actions">
      <p v-if="isOutsideSchedule" class="schedule-status">
        {{ t('timer.outsideSchedule') }}
        <button class="text-button" @click="openSettings">{{ t('timer.openSettings') }}</button>
      </p>
      <p v-if="isDnd" class="dnd-status">{{ dndStatus }}</p>
      <p v-if="pendingBreak">{{ t('timer.pendingBreak') }}</p>
      <button v-if="!isDnd" class="plain" @click="startDnd(30)">{{ t('timer.dnd30') }}</button>
      <button v-if="!isDnd" class="plain" @click="startDnd(60)">{{ t('timer.dnd60') }}</button>
      <button v-if="!isDnd" class="plain" @click="startDnd(null)">
        {{ t('timer.dndUntilEnded') }}
      </button>
      <button v-else class="plain" @click="endDnd">{{ t('timer.endDnd') }}</button>
    </div>
  </main>
  <RestOverlay v-if="isStrictRest" :clock="clock" />
  <ConfirmationDialog
    v-if="confirmationAction"
    :title="confirmationTitle"
    :message="confirmationMessage"
    @confirm="confirmAction"
    @cancel="confirmationAction = null"
  />
  <SystemTrayHintDialog v-if="isCloseHintOpen" @acknowledge="acknowledgeCloseHint" />
  <UnsavedChangesDialog
    v-if="isUnsavedDialogOpen"
    @save="saveAndLeaveSettings"
    @discard="discardSettingsChanges"
    @cancel="cancelSettingsNavigation"
  />
</template>
