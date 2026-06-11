import { reactive, readonly, inject } from 'vue'
import type { App } from 'vue'

export interface ConfirmDialogOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  secondaryText?: string
  closeImmediately?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onSecondary?: () => void | Promise<void>
}

const CONFIRM_DIALOG_KEY = Symbol('CONFIRM_DIALOG_KEY')

export function createConfirmDialog() {
  const state = reactive({
    open: false,
    options: {} as ConfirmDialogOptions,
  })

  function confirm(options: ConfirmDialogOptions) {
    state.options = options
    state.open = true
  }

  function close() {
    state.open = false
  }

  return {
    install(app: App) {
      app.provide(CONFIRM_DIALOG_KEY, {
        state: readonly(state),
        confirm,
        close,
      })
    },
  }
}

export function useConfirmDialog() {
  const dialog = inject<{
    state: { open: boolean; options: ConfirmDialogOptions }
    confirm: (options: ConfirmDialogOptions) => void
    close: () => void
  }>(CONFIRM_DIALOG_KEY)

  if (!dialog) {
    throw new Error(
      'useConfirmDialog() was used but createConfirmDialog() plugin was not installed.',
    )
  }

  return dialog
}
