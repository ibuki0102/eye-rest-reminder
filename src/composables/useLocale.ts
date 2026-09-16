import type { Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { i18n } from '../i18n'
import type { AppLocale, AppSettings } from '../types/settings'
export function detectLocale(): AppLocale {
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en-US'
}
export function useLocale(settings: Ref<AppSettings>) {
  const setLocale = async (locale: AppLocale) => {
    settings.value.locale = locale
    i18n.global.locale.value = locale
    document.documentElement.lang = locale
    try {
      await invoke('set_tray_labels', {
        appName: i18n.global.t('app.name'),
        quitLabel: i18n.global.t('tray.quit'),
      })
    } catch {}
  }
  return { setLocale }
}
