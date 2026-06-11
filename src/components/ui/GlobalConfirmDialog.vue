<script setup lang="ts">
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const dialog = useConfirmDialog()

const handleConfirm = async () => {
  if (dialog.state.options.closeImmediately) {
    dialog.close()
  }
  if (dialog.state.options.onConfirm) {
    await dialog.state.options.onConfirm()
  }
  if (!dialog.state.options.closeImmediately) {
    dialog.close()
  }
}

const handleCancel = () => {
  dialog.state.options.onCancel?.()
  dialog.close()
}

const handleSecondary = async () => {
  if (dialog.state.options.onSecondary) {
    await dialog.state.options.onSecondary()
  }
  dialog.close()
}
</script>

<template>
  <div
    v-if="dialog.state.open"
    class="fixed inset-0 z-999 flex items-center justify-center bg-black/50"
  >
    <div class="bg-background w-[90%] max-w-md rounded-xl p-6 shadow-xl">
      <h2 class="text-lg font-bold text-gray-900">
        {{ dialog.state.options.title || 'Confirm Action' }}
      </h2>

      <p class="mt-2 text-sm">
        {{ dialog.state.options.description || 'Are you sure you want to continue?' }}
      </p>

      <div class="mt-6 flex flex-col justify-start gap-3 sm:flex-row">
        <button
          class="btn border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="handleCancel"
        >
          {{ dialog.state.options.cancelText || 'Cancel' }}
        </button>

        <button
          v-if="dialog.state.options.secondaryText"
          class="btn border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          @click="handleSecondary"
        >
          {{ dialog.state.options.secondaryText }}
        </button>

        <button
          class="btn bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          @click="handleConfirm"
        >
          {{ dialog.state.options.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>
