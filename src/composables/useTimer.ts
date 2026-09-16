import { computed, type Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import { useSchedule } from './useSchedule'
import type { AppSettings } from '../types/settings'
export type Phase = 'idle' | 'paused' | 'focus' | 'rest' | 'snooze'

interface TimerCallbacks {
  onFocusComplete?: (seconds: number) => void | Promise<void>
  onRestComplete?: () => void | Promise<void>
}

export function useTimer(settings: Ref<AppSettings>, callbacks: TimerCallbacks = {}) {
  const { t } = useI18n(),
    { isActiveNow } = useSchedule(settings),
    phase = ref<Phase>('idle'),
    remaining = ref(settings.value.focusMinutes * 60),
    pendingBreak = ref(false),
    dndUntil = ref<number | null>(null)
  let resumePhase: Phase = 'focus',
    endAt: number | null = null,
    ticker: number | null = null
  const running = computed(() => ['focus', 'rest', 'snooze'].includes(phase.value)),
    isDnd = computed(() => dndUntil.value !== null),
    title = computed(() => t(`timer.${phase.value}`)),
    clock = computed(
      () =>
        `${String(Math.floor(remaining.value / 60)).padStart(2, '0')}:${String(remaining.value % 60).padStart(2, '0')}`,
    )
  const clear = () => {
    if (ticker !== null) {
      clearInterval(ticker)
      ticker = null
    }
  }
  function playTone(rest: boolean) {
    if (!settings.value.soundEnabled || isDnd.value) return
    try {
      const context = new AudioContext()
      const frequencies = rest ? [392, 523] : [440]
      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const startAt = context.currentTime + index * 0.16
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.06, startAt)
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.25)
        oscillator.connect(gain).connect(context.destination)
        oscillator.start(startAt)
        oscillator.stop(startAt + 0.26)
      })
    } catch {}
  }
  async function notify(title: string, body: string) {
    if (!settings.value.notificationsEnabled || isDnd.value) return
    try {
      let granted = await isPermissionGranted()
      if (!granted) granted = (await requestPermission()) === 'granted'
      if (granted) sendNotification({ title, body })
    } catch {}
  }
  const startPhase = (next: Phase, seconds: number) => {
    phase.value = next
    remaining.value = seconds
    endAt = Date.now() + seconds * 1000
    if (ticker === null) ticker = window.setInterval(tick, 250)
  }
  const enterRest = () => {
    pendingBreak.value = false
    playTone(true)
    void notify(
      t('notification.restTitle'),
      t('notification.restBody', { seconds: settings.value.restSeconds }),
    )
    startPhase('rest', settings.value.restSeconds)
  }
  const advance = () => {
    if (phase.value === 'rest') {
      void callbacks.onRestComplete?.()
      playTone(false)
      void notify(t('notification.focusTitle'), t('notification.focusBody'))
      startPhase('focus', settings.value.focusMinutes * 60)
    } else if (isDnd.value) {
      if (phase.value === 'focus')
        void callbacks.onFocusComplete?.(settings.value.focusMinutes * 60)
      pendingBreak.value = true
      endAt = null
    } else {
      if (phase.value === 'focus')
        void callbacks.onFocusComplete?.(settings.value.focusMinutes * 60)
      enterRest()
    }
  }
  function tick() {
    if (dndUntil.value && Date.now() >= dndUntil.value) endDnd()
    if (!isActiveNow() && running.value) pause()
    if (endAt === null) return
    remaining.value = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
    if (!remaining.value) advance()
  }
  function start() {
    if (!isActiveNow()) return
    if (phase.value === 'paused') {
      startPhase(resumePhase, remaining.value)
      return
    }
    if (phase.value === 'idle') startPhase('focus', settings.value.focusMinutes * 60)
  }
  function pause() {
    if (!running.value) return
    remaining.value = Math.max(0, endAt ? Math.ceil((endAt - Date.now()) / 1000) : remaining.value)
    resumePhase = phase.value
    clear()
    endAt = null
    phase.value = 'paused'
  }
  function reset() {
    clear()
    endAt = null
    phase.value = 'idle'
    remaining.value = settings.value.focusMinutes * 60
    pendingBreak.value = false
    dndUntil.value = null
  }
  function startDnd(minutes: number | null) {
    dndUntil.value = minutes ? Date.now() + minutes * 60000 : Number.MAX_SAFE_INTEGER
    if (ticker === null) ticker = window.setInterval(tick, 250)
  }
  function endDnd() {
    dndUntil.value = null
    if (pendingBreak.value) enterRest()
  }
  return {
    phase,
    remaining,
    running,
    title,
    clock,
    pendingBreak,
    isDnd,
    dndUntil,
    start,
    pause,
    reset,
    startDnd,
    endDnd,
    snooze: (s: number) => startPhase('snooze', s),
    skipRest: () => startPhase('focus', settings.value.focusMinutes * 60),
    clear,
  }
}
