<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ clock: string }>()

const { t } = useI18n()
</script>

<template>
  <section class="rest-overlay" role="dialog" aria-modal="true">
    <p class="eyebrow">{{ t('app.name') }}</p>
    <h1>{{ t('timer.rest') }}</h1>
    <output aria-live="assertive">{{ clock }}</output>
    <p>{{ t('timer.restHint') }}</p>
  </section>
</template>
