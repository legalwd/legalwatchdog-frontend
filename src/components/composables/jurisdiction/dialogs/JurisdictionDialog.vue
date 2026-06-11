<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'

const props = withDefaults(
  defineProps<{
    open: boolean
    form: { name: string; description: string }
    title?: string
    description?: string
    nameLabel?: string
    namePlaceholder?: string
    descriptionLabel?: string
    descriptionPlaceholder?: string
    submitText?: string
    loading?: boolean
  }>(),
  {
    title: 'Define your Sub-Jurisdiction',
    description: 'Define a specific legal domain or region to monitor',
    nameLabel: 'Sub-Jurisdiction Name',
    namePlaceholder: 'e.g Global Visa Monitoring',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'What legal areas will you monitor?',
    submitText: 'Create Sub-Jurisdiction',
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:form', payload: Partial<{ name: string; description: string }>): void
  (e: 'submit' | 'cancel'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="sm:max-w-140">
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
        <DialogDescription>{{ props.description }}</DialogDescription>
      </DialogHeader>

      <form class="space-y-5" @submit.prevent="emit('submit')">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-900">{{ props.nameLabel }}</label>
          <input
            :value="form.name"
            type="text"
            required
            :placeholder="props.namePlaceholder"
            class="focus:border-accent-main focus:ring-accent-main/20 h-12 w-full rounded-lg border border-gray-300 px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
            @input="emit('update:form', { name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-900">{{
            props.descriptionLabel
          }}</label>
          <textarea
            :value="form.description"
            rows="4"
            :placeholder="props.descriptionPlaceholder"
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

          <button
            type="submit"
            class="btn--default btn--lg"
            :disabled="props.loading"
            :aria-busy="props.loading"
          >
            {{ props.loading ? 'Saving...' : props.submitText }}
          </button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
