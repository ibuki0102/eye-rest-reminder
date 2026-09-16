import { load } from '@tauri-apps/plugin-store'
import type { AppSettings } from '../types/settings'
import type { DailyStatistics } from '../types/statistics'
const STORE_FILE = 'settings.json'

async function getStore() {
  return load(STORE_FILE, { autoSave: true })
}

export async function readSettings() {
  const store = await getStore()
  return store.get<AppSettings>('settings')
}

export async function writeSettings(settings: AppSettings) {
  const store = await getStore()
  await store.set('settings', settings)
}

export async function readStatistics() {
  const store = await getStore()
  return (await store.get<DailyStatistics[]>('statistics')) ?? []
}

export async function writeStatistics(statistics: DailyStatistics[]) {
  const store = await getStore()
  await store.set('statistics', statistics)
}
