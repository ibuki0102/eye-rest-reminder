<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDialogFocus } from '../composables/useDialogFocus'

const emit = defineEmits<{ acknowledge: [] }>()

const { t } = useI18n()
const dialogFocus = useDialogFocus(() => emit('acknowledge'))
</script>

<template>
  <div class="dialog-backdrop">
    <section
      class="confirmation-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tray-hint-title"
      aria-describedby="tray-hint-message"
      :ref="dialogFocus.dialogElement"
      @keydown="dialogFocus.handleKeydown"
    >
      <h2 id="tray-hint-title">{{ t('trayHint.title') }}</h2>
      <p id="tray-hint-message">{{ t('trayHint.message') }}</p>
      <div class="actions">
        <button @click="$emit('acknowledge')">{{ t('trayHint.acknowledge') }}</button>
      </div>
    </section>
  </div>
</template>
