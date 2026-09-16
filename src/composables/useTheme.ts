import type { Ref } from 'vue'
import type { AppSettings } from '../types/settings'
export function useTheme(settings: Ref<AppSettings>) {
  const applyTheme = () => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark =
      settings.value.theme === 'dark' || (settings.value.theme === 'system' && systemDark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }
  return { applyTheme }
}
