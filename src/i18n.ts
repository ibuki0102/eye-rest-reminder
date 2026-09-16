import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US.json'
import zhTW from './locales/zh-TW.json'
export const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: { 'zh-TW': zhTW, 'en-US': enUS },
})
