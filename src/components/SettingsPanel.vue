<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AppSettings } from '../types/settings'
const { settings } = defineProps<{ settings: AppSettings; feedback: string | null }>()
defineEmits<{ save: []; close: []; restore: [] }>()
const { t } = useI18n()
const days = [1, 2, 3, 4, 5, 6, 0]
function toggleDay(day: number) {
  const selected = settings.schedule.days
  settings.schedule.days = selected.includes(day)
    ? selected.filter((value) => value !== day)
    : [...selected, day].sort()
}
</script>
<template>
  <section class="settings">
    <h1>{{ t('app.settings') }}</h1>
    <label
      >{{ t('settings.focusMinutes')
      }}<input v-model.number="settings.focusMinutes" type="number" min="1" max="180" /></label
    ><label
      >{{ t('settings.restSeconds')
      }}<input v-model.number="settings.restSeconds" type="number" min="5" max="300" /></label
    ><label
      >{{ t('settings.language')
      }}<select v-model="settings.locale">
        <option value="zh-TW">{{ t('locale.zh-TW') }}</option>
        <option value="en-US">{{ t('locale.en-US') }}</option>
      </select></label
    ><label
      >{{ t('settings.theme')
      }}<select v-model="settings.theme">
        <option value="system">{{ t('settings.system') }}</option>
        <option value="light">{{ t('settings.light') }}</option>
        <option value="dark">{{ t('settings.dark') }}</option>
      </select></label
    ><label
      >{{ t('settings.reminderMode')
      }}<select v-model="settings.reminderMode">
        <option value="gentle">{{ t('settings.gentle') }}</option>
        <option value="focus">{{ t('settings.focusMode') }}</option>
        <option value="strict">{{ t('settings.strict') }}</option>
      </select></label
    >
    <p class="setting-description">
      {{ t(`settings.${settings.reminderMode}Description`) }}
    </p>
    <label class="switch"
      ><input v-model="settings.notificationsEnabled" type="checkbox" />{{
        t('settings.notifications')
      }}</label
    ><label class="switch"
      ><input v-model="settings.soundEnabled" type="checkbox" />{{ t('settings.sound') }}</label
    ><label class="switch"
      ><input v-model="settings.launchAtStartup" type="checkbox" />{{
        t('settings.autostart')
      }}</label
    >
    <fieldset class="schedule">
      <legend>{{ t('settings.schedule') }}</legend>
      <label class="switch"
        ><input v-model="settings.schedule.enabled" type="checkbox" />{{
          t('settings.scheduleEnabled')
        }}</label
      >
      <template v-if="settings.schedule.enabled">
        <span class="field-label">{{ t('settings.days') }}</span>
        <div class="day-picker">
          <button
            v-for="day in days"
            :key="day"
            type="button"
            :class="{ selected: settings.schedule.days.includes(day) }"
            @click="toggleDay(day)"
          >
            {{ t(`days.${day}`) }}
          </button>
        </div>
        <label
          >{{ t('settings.startTime') }}<input v-model="settings.schedule.startTime" type="time"
        /></label>
        <label
          >{{ t('settings.endTime') }}<input v-model="settings.schedule.endTime" type="time"
        /></label>
      </template>
    </fieldset>
    <p v-if="feedback" class="saved">{{ feedback }}</p>
    <div class="actions">
      <button @click="$emit('save')">{{ t('app.save') }}</button
      ><button class="plain" @click="$emit('close')">{{ t('app.back') }}</button>
    </div>
    <div class="reset-settings">
      <button class="danger" @click="$emit('restore')">{{ t('settings.restoreDefaults') }}</button>
    </div>
  </section>
</template>
