<script setup lang="ts">
import { useI18n } from 'vue-i18n'
defineEmits<{ snooze: [seconds: number]; skip: [] }>()
const { t } = useI18n()
</script>
<template>
  <section class="timer">
    <h1>{{ t('timer.rest') }}</h1>
    <slot />
    <p class="hint">{{ t('timer.restHint') }}</p>
    <div class="break-actions">
      <button @click="$emit('snooze', 60)">{{ t('timer.snoozeOne') }}</button
      ><button @click="$emit('snooze', 300)">{{ t('timer.snoozeFive') }}</button
      ><button class="danger" @click="$emit('skip')">{{ t('timer.skip') }}</button>
    </div>
  </section>
</template>
