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
  instruction: string
  placeholder?: string
  saving?: boolean
  canSave?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:instruction', value: string): void
  (e: 'save' | 'cancel'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="project-instruction-modal">
      <DialogHeader class="space-y-2">
        <DialogTitle class="text-foreground text-xl font-semibold">Add Instruction</DialogTitle>
        <DialogDescription class="text-muted text-sm">
          Define a specific legal domain or region to monitor
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-5" @submit.prevent="emit('save')">
        <div class="space-y-2">
          <label class="text-foreground block text-sm font-medium">Instructions</label>
          <textarea
            :value="instruction"
            rows="8"
            :placeholder="placeholder"
            class="project-instruction-textarea"
            :disabled="saving"
            @input="emit('update:instruction', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <DialogFooter class="flex justify-end gap-3 pt-2">
          <button type="button" class="btn--secondary btn--md" @click="emit('cancel')">
            Cancel
          </button>
          <button type="submit" class="btn--default btn--md" :disabled="saving || !canSave">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
