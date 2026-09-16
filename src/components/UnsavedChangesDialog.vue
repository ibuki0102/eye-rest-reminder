<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDialogFocus } from '../composables/useDialogFocus'

const emit = defineEmits<{ save: []; discard: []; cancel: [] }>()

const { t } = useI18n()
const dialogFocus = useDialogFocus(() => emit('cancel'))
</script>

<template>
  <div class="dialog-backdrop" @click.self="$emit('cancel')">
    <section
      class="confirmation-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
      aria-describedby="unsaved-message"
      :ref="dialogFocus.dialogElement"
      @keydown="dialogFocus.handleKeydown"
    >
      <h2 id="unsaved-title">{{ t('settings.unsavedTitle') }}</h2>
      <p id="unsaved-message">{{ t('settings.unsavedMessage') }}</p>
      <div class="actions">
        <button @click="$emit('save')">{{ t('settings.saveAndLeave') }}</button>
        <button class="danger" @click="$emit('discard')">{{ t('settings.discardChanges') }}</button>
        <button class="plain" @click="$emit('cancel')">{{ t('dialog.cancel') }}</button>
      </div>
    </section>
  </div>
</template>
