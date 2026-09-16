import { ref } from 'vue'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'
import { defaultSettings, type AppSettings } from '../types/settings'
import { readSettings, writeSettings } from '../services/storageService'
import { detectLocale } from './useLocale'

function createDefaultSettings(): AppSettings {
  return {
    ...defaultSettings,
    schedule: {
      ...defaultSettings.schedule,
      days: [...defaultSettings.schedule.days],
    },
  }
}

export function useSettings() {
  const settings = ref<AppSettings>(createDefaultSettings())

  async function initialize() {
    try {
      const stored = await readSettings()
      settings.value = {
        ...createDefaultSettings(),
        locale: stored ? defaultSettings.locale : detectLocale(),
        ...stored,
        schedule: {
          ...createDefaultSettings().schedule,
          ...stored?.schedule,
          days: stored?.schedule?.days ?? [...defaultSettings.schedule.days],
        },
      }
      settings.value.launchAtStartup = await isEnabled()
    } catch {
      /* Browser preview uses defaults. */
    }
  }

  async function save() {
    try {
      await writeSettings({ ...settings.value })
      if (settings.value.launchAtStartup) await enable()
      else await disable()
    } catch {
      /* Settings panel remains usable in browser preview. */
    }
  }

  function restoreDefaults() {
    settings.value = createDefaultSettings()
  }

  return { settings, initialize, save, restoreDefaults }
}
