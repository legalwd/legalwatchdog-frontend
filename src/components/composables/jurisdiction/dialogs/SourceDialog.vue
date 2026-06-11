<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SourceType, ScrapeFrequency } from '@/types/source'

type SourceForm = {
  name: string
  url: string
  source_type: SourceType
  scrape_frequency: ScrapeFrequency
  is_active: boolean
}

defineProps<{
  open: boolean
  editingId: string | null
  form: SourceForm
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:form', payload: Partial<SourceForm>): void
  (e: 'submit' | 'cancel'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="sm:max-w-130">
      <DialogHeader>
        <DialogTitle>{{ editingId ? 'Edit Source' : 'Add Source' }}</DialogTitle>
        <DialogDescription>Attach a source to monitor for this jurisdiction.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="emit('submit')">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-800">Name</label>
          <input
            :value="form.name"
            class="focus:border-accent-main focus:ring-accent-main/20 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:outline-none"
            placeholder="e.g. Supreme Court Opinions"
            @input="emit('update:form', { name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-800">URL</label>
          <input
            :value="form.url"
            type="url"
            required
            class="focus:border-accent-main focus:ring-accent-main/20 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:outline-none"
            placeholder="https://example.com"
            @input="emit('update:form', { url: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-800">Source Type</label>
            <select
              :value="form.source_type"
              class="focus:border-accent-main focus:ring-accent-main/20 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:outline-none"
              @change="
                emit('update:form', {
                  source_type: ($event.target as HTMLSelectElement).value as SourceType,
                })
              "
            >
              <option value="web">Web</option>
              <option value="api">API</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-800">Scrape Frequency</label>
            <select
              :value="form.scrape_frequency"
              class="focus:border-accent-main focus:ring-accent-main/20 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:outline-none"
              @change="
                emit('update:form', {
                  scrape_frequency: ($event.target as HTMLSelectElement).value as ScrapeFrequency,
                })
              "
            >
              <option value="HOURLY">Hourly</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        <div v-if="error" class="text-error rounded-lg bg-red-50 px-3 py-2 text-sm">
          {{ error }}
        </div>

        <DialogFooter class="flex justify-end gap-3 pt-2">
          <button type="button" class="btn--secondary btn--lg" @click="emit('cancel')">
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="btn--default btn--lg btn--with-icon disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>{{ editingId ? 'Save Changes' : 'Add Source' }}</span>
          </button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
