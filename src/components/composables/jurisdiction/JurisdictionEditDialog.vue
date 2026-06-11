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
  (e: 'save' | 'cancel'): void
  (e: 'update:form', payload: Partial<{ name: string; description: string; prompt: string }>): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="sm:max-w-140">
      <DialogHeader>
        <DialogTitle>Edit Jurisdiction</DialogTitle>
        <DialogDescription>Update the name, description, and instructions.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="emit('save')">
        <div>
          <label class="mb-2 block text-sm font-medium text-[#1F1F1F]">Name</label>
          <input
            :value="form.name"
            class="focus:border-accent-main focus:ring-accent-main/20 h-12 w-full rounded-lg border px-4 text-sm focus:ring-2 focus:outline-none"
            @input="emit('update:form', { name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-[#1F1F1F]">Description</label>
          <textarea
            :value="form.description"
            rows="3"
            class="focus:border-accent-main focus:ring-accent-main/20 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            @input="
              emit('update:form', { description: ($event.target as HTMLTextAreaElement).value })
            "
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-[#1F1F1F]">Instructions</label>
          <textarea
            :value="form.prompt"
            rows="3"
            class="focus:border-accent-main focus:ring-accent-main/20 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            @input="emit('update:form', { prompt: ($event.target as HTMLTextAreaElement).value })"
          />
        </div>

        <DialogFooter class="flex justify-end gap-3 pt-2">
          <button type="button" class="btn--secondary btn--lg" @click="emit('cancel')">
            Cancel
          </button>
          <button type="submit" class="btn--default btn--lg">Save Changes</button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
