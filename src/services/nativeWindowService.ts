import { getCurrentWindow } from '@tauri-apps/api/window'

function reportWindowErrors(results: PromiseSettledResult<void>[]) {
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Unable to update the reminder window.', result.reason)
    }
  }
}

export async function showAndFocusCurrentWindow() {
  try {
    const appWindow = getCurrentWindow()
    const results = await Promise.allSettled([
      appWindow.show(),
      appWindow.unminimize(),
      appWindow.setFocus(),
    ])
    reportWindowErrors(results)
  } catch {
    console.error('Unable to access the reminder window.')
  }
}

export async function enableStrictRestWindow() {
  try {
    const appWindow = getCurrentWindow()
    await showAndFocusCurrentWindow()
    await appWindow.setAlwaysOnTop(true)
  } catch {
    console.error('Unable to enable strict rest mode.')
  }
}

export async function restoreReminderWindow() {
  try {
    await getCurrentWindow().setAlwaysOnTop(false)
  } catch {
    console.error('Unable to restore the reminder window.')
  }
}

export async function hideCurrentWindow() {
  try {
    await getCurrentWindow().hide()
  } catch {
    console.error('Unable to hide the reminder window.')
  }
}
