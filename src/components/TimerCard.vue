<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Phase } from '../composables/useTimer'
defineProps<{ phase: Phase; title: string; clock: string; running: boolean }>()
defineEmits<{ start: []; pause: []; reset: [] }>()
const { t } = useI18n()
</script>
<template>
  <section class="timer">
    <h1>{{ title }}</h1>
    <output aria-live="polite">{{ clock }}</output>
    <p class="hint">{{ phase === 'snooze' ? t('timer.snoozeHint') : t('timer.focusHint') }}</p>
    <div class="actions">
      <button v-if="!running" @click="$emit('start')">{{ t('timer.start') }}</button
      ><button v-else @click="$emit('pause')">{{ t('timer.pause') }}</button
      ><button class="plain" @click="$emit('reset')">{{ t('timer.reset') }}</button>
    </div>
  </section>
</template>
