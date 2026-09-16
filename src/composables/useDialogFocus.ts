import { nextTick, onMounted, ref } from 'vue'

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useDialogFocus(onEscape?: () => void) {
  const dialogElement = ref<HTMLElement | null>(null)

  function getFocusableElements() {
    return Array.from(dialogElement.value?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault()
      onEscape()
      return
    }
    if (event.key !== 'Tab') return

    const elements = getFocusableElements()
    const first = elements.at(0)
    const last = elements.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  onMounted(async () => {
    await nextTick()
    getFocusableElements().at(0)?.focus()
  })

  return { dialogElement, handleKeydown }
}
