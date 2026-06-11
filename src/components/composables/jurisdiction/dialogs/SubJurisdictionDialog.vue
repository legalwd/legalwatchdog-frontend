<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  open: boolean
  form: { name: string; description: string; prompt: string }
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:form', payload: Partial<{ name: string; description: string; prompt: string }>): void
  (e: 'submit' | 'cancel'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="sm:max-w-130">
      <DialogHeader>
        <DialogTitle>Define your Sub-Jurisdiction</DialogTitle>
        <DialogDescription>Define a specific domain or region to monitor</DialogDescription>
      </DialogHeader>

      <form class="space-y-5" @submit.prevent="emit('submit')">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-900">Sub-Jurisdiction Name</label>
          <input
            :value="form.name"
            type="text"
            required
            placeholder="e.g Global Visa Monitoring"
            class="focus:border-accent-main focus:ring-accent-main/20 h-12 w-full rounded-lg border border-gray-300 px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
            @input="emit('update:form', { name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-900">Description</label>
          <textarea
            :value="form.description"
            rows="4"
            required
            placeholder="What areas will you monitor?"
            class="focus:border-accent-main focus:ring-accent-main/20 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
            @input="
              emit('update:form', { description: ($event.target as HTMLTextAreaElement).value })
            "
          ></textarea>
        </div>

        <DialogFooter class="flex justify-end gap-3 pt-4">
          <button type="button" class="btn--secondary btn--lg" @click="emit('cancel')">
            Cancel
          </button>

          <button type="submit" class="btn--default btn--lg">Create Sub-Jurisdiction</button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
