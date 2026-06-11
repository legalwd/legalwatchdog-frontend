<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Campaign, CampaignCreatePayload, CampaignTargetDepth } from '@/types/campaign'

type OrganizationOption = {
  id: string
  label: string
}

const props = defineProps<{
  open: boolean
  mode?: 'create' | 'edit'
  organizations: OrganizationOption[]
  campaign?: Campaign | null
  loading?: boolean
  error?: string | null
  fieldErrors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: CampaignCreatePayload): void
}>()

const formState = ref({
  organization_id: '',
  name: '',
  industry: '',
  domain_description: '',
  project_id: '',
  target_depth: 'COUNTRY' as CampaignTargetDepth,
  target_countries: '',
  target_states: '',
  monitor_cadence: '0 9 * * 1',
  sources_per_jurisdiction: 5,
  max_jurisdictions: 15000,
})

const localError = ref<string | null>(null)

const targetDepthOptions: CampaignTargetDepth[] = ['COUNTRY', 'STATE', 'CITY']
const resolvedMode = computed(() => props.mode ?? 'create')

const canSubmit = computed(() => !props.loading)
const fieldErrorFor = (field: string) => props.fieldErrors?.[field]?.[0] ?? null

const parseListInput = (value: string) => {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length ? items : null
}

const listToInput = (value: string[] | null | undefined) => (value ?? []).join(', ')

const resetState = () => {
  formState.value = {
    organization_id: props.campaign?.organization_id || props.organizations[0]?.id || '',
    name: props.campaign?.name || '',
    industry: props.campaign?.industry || '',
    domain_description: props.campaign?.domain_description || '',
    project_id: props.campaign?.project_id || '',
    target_depth: props.campaign?.target_depth || 'COUNTRY',
    target_countries: listToInput(props.campaign?.target_countries),
    target_states: listToInput(props.campaign?.target_states),
    monitor_cadence: props.campaign?.monitor_cadence || '0 9 * * 1',
    sources_per_jurisdiction: props.campaign?.sources_per_jurisdiction || 5,
    max_jurisdictions: props.campaign?.max_jurisdictions || 15000,
  }
  localError.value = null
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetState()
    }
  },
)

const handleClose = () => {
  emit('close')
  localError.value = null
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  localError.value = null

  if (!formState.value.organization_id) {
    localError.value = 'Organization is required'
    return
  }
  if (!formState.value.name.trim()) {
    localError.value = 'Campaign name is required'
    return
  }
  if (!formState.value.industry.trim()) {
    localError.value = 'Industry is required'
    return
  }
  if (!formState.value.domain_description.trim()) {
    localError.value = 'Domain description is required'
    return
  }
  if (formState.value.sources_per_jurisdiction < 1) {
    localError.value = 'Sources per jurisdiction must be at least 1'
    return
  }
  if (formState.value.max_jurisdictions < 1) {
    localError.value = 'Max jurisdictions must be at least 1'
    return
  }

  emit('save', {
    organization_id: formState.value.organization_id,
    name: formState.value.name.trim(),
    industry: formState.value.industry.trim(),
    domain_description: formState.value.domain_description.trim(),
    project_id: formState.value.project_id.trim() || null,
    target_depth: formState.value.target_depth,
    monitor_backend: 'CELERY_BEAT',
    monitor_cadence: formState.value.monitor_cadence.trim(),
    sources_per_jurisdiction: Number(formState.value.sources_per_jurisdiction),
    max_jurisdictions: Number(formState.value.max_jurisdictions),
    target_countries: parseListInput(formState.value.target_countries),
    target_states: parseListInput(formState.value.target_states),
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && handleClose()">
    <DialogScrollContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{
          resolvedMode === 'edit' ? 'Edit Campaign' : 'Create Campaign'
        }}</DialogTitle>
        <DialogDescription>
          {{
            resolvedMode === 'edit'
              ? 'Update this draft campaign before taxonomy generation and launch.'
              : 'Set up a campaign draft before taxonomy generation and launch.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <div class="md:col-span-2">
          <label class="text-muted mb-2 block text-sm font-medium">Organization</label>
          <select
            v-model="formState.organization_id"
            :disabled="resolvedMode === 'edit'"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option disabled value="">Select organization</option>
            <option
              v-for="organization in organizations"
              :key="organization.id"
              :value="organization.id"
            >
              {{ organization.label }}
            </option>
          </select>
          <p v-if="fieldErrorFor('organization_id')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('organization_id') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Campaign Name</label>
          <input
            v-model="formState.name"
            type="text"
            placeholder="Global EOR Compliance"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('name')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('name') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Industry</label>
          <input
            v-model="formState.industry"
            type="text"
            placeholder="Employment"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('industry')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('industry') }}
          </p>
        </div>

        <div class="md:col-span-2">
          <label class="text-muted mb-2 block text-sm font-medium">Domain Description</label>
          <textarea
            v-model="formState.domain_description"
            rows="4"
            placeholder="Monitor EOR and employment law obligations across target jurisdictions."
            class="border-border bg-background w-full rounded-lg border px-3 py-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('domain_description')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('domain_description') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Project ID</label>
          <input
            v-model="formState.project_id"
            type="text"
            placeholder="Optional existing project id"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('project_id')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('project_id') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Target Depth</label>
          <select
            v-model="formState.target_depth"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option v-for="option in targetDepthOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <p v-if="fieldErrorFor('target_depth')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('target_depth') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Target Countries</label>
          <input
            v-model="formState.target_countries"
            type="text"
            placeholder="US, Mexico"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('target_countries')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('target_countries') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Target States</label>
          <input
            v-model="formState.target_states"
            type="text"
            placeholder="California, Nuevo Leon"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('target_states')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('target_states') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Monitor Cadence</label>
          <input
            v-model="formState.monitor_cadence"
            type="text"
            placeholder="0 9 * * 1"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('monitor_cadence')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('monitor_cadence') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Sources Per Jurisdiction</label>
          <input
            v-model.number="formState.sources_per_jurisdiction"
            type="number"
            min="1"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('sources_per_jurisdiction')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('sources_per_jurisdiction') }}
          </p>
        </div>

        <div>
          <label class="text-muted mb-2 block text-sm font-medium">Max Jurisdictions</label>
          <input
            v-model.number="formState.max_jurisdictions"
            type="number"
            min="1"
            class="border-border bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none"
          />
          <p v-if="fieldErrorFor('max_jurisdictions')" class="mt-2 text-sm text-red-600">
            {{ fieldErrorFor('max_jurisdictions') }}
          </p>
        </div>

        <div v-if="localError" class="text-error rounded-lg bg-red-50 p-3 text-sm md:col-span-2">
          {{ localError }}
        </div>
        <div v-else-if="error" class="text-error rounded-lg bg-red-50 p-3 text-sm md:col-span-2">
          {{ error }}
        </div>

        <DialogFooter class="md:col-span-2">
          <Button type="button" variant="secondary" @click="handleClose">Cancel</Button>
          <Button type="submit" :disabled="loading">
            {{
              loading
                ? resolvedMode === 'edit'
                  ? 'Saving...'
                  : 'Creating...'
                : resolvedMode === 'edit'
                  ? 'Save Changes'
                  : 'Create Campaign'
            }}
          </Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
