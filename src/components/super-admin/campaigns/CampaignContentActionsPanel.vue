<script setup lang="ts">
import { computed, ref } from 'vue'

import { Button } from '@/components/ui/button'
import type { CampaignContentTriggerPayload } from '@/types/campaign'

defineProps<{
  saving?: boolean
}>()

const emit = defineEmits<{
  (
    e: 'run-content' | 'retry-failed-content' | 'backfill-missing-content',
    payload: CampaignContentTriggerPayload | null,
  ): void
}>()

const countriesInput = ref('')
const statesInput = ref('')

const parseListInput = (value: string) => {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length ? items : null
}

const runtimePayload = computed<CampaignContentTriggerPayload | null>(() => {
  const countries = parseListInput(countriesInput.value)
  const states = parseListInput(statesInput.value)

  if (!countries && !states) return null

  return {
    countries,
    states,
  }
})
</script>

<template>
  <section class="border-border bg-background mb-6 rounded-xl border p-6">
    <div class="flex flex-col gap-6">
      <div>
        <p class="text-muted text-xs font-semibold tracking-wide uppercase">Content Pipeline</p>
        <h2 class="text-foreground mt-2 text-lg font-semibold">Campaign Content Actions</h2>
        <p class="mt-2 max-w-2xl text-sm text-slate-500">
          Queue content generation jobs for this campaign and refresh generated blog output after
          the backend accepts the job.
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Runtime Countries</label>
          <input
            v-model="countriesInput"
            type="text"
            placeholder="MX, United States"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Runtime States</label>
          <input
            v-model="statesInput"
            type="text"
            placeholder="Nuevo Leon, CA"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            :disabled="saving"
            @click="emit('run-content', runtimePayload)"
          >
            Run Content
          </Button>
          <Button
            variant="secondary"
            :disabled="saving"
            @click="emit('retry-failed-content', runtimePayload)"
          >
            Retry Failed Content
          </Button>
          <Button
            variant="secondary"
            :disabled="saving"
            @click="emit('backfill-missing-content', runtimePayload)"
          >
            Backfill Missing Content
          </Button>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
          v-if="runtimePayload?.countries?.length"
          class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
        >
          Countries: {{ runtimePayload.countries.join(', ') }}
        </span>
        <span
          v-if="runtimePayload?.states?.length"
          class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
        >
          States: {{ runtimePayload.states.join(', ') }}
        </span>
        <span v-if="!runtimePayload" class="text-sm text-slate-500">
          Blank runtime scope runs globally.
        </span>
      </div>
    </div>
  </section>
</template>
