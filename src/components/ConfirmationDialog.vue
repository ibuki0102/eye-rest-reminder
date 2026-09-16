<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDialogFocus } from '../composables/useDialogFocus'

defineProps<{ title: string; message: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()

const { t } = useI18n()
const dialogFocus = useDialogFocus(() => emit('cancel'))
</script>

<template>
  <div class="dialog-backdrop" @click.self="$emit('cancel')">
    <section
      class="confirmation-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
      :ref="dialogFocus.dialogElement"
      @keydown="dialogFocus.handleKeydown"
    >
      <h2 id="confirmation-title">{{ title }}</h2>
      <p id="confirmation-message">{{ message }}</p>
      <div class="actions">
        <button class="danger" @click="$emit('confirm')">{{ t('dialog.confirm') }}</button>
        <button class="plain" @click="$emit('cancel')">{{ t('dialog.cancel') }}</button>
      </div>
    </section>
  </div>
</template>
