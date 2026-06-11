<script setup lang="ts">
import { computed } from 'vue'

import type { Campaign } from '@/types/campaign'

const props = defineProps<{
  campaign: Campaign | null
  loading?: boolean
}>()

const formatList = (items: string[] | null | undefined) => {
  if (!items?.length) return 'Global'
  return items.join(', ')
}

const contentPipeline = computed(() => props.campaign?.stats?.content_pipeline ?? null)

const contentPipelineScope = computed(() => {
  const pipeline = contentPipeline.value
  if (!pipeline?.target_countries?.length && !pipeline?.target_states?.length) return null

  const countryLabel = formatList(pipeline.target_countries)
  const stateLabel = pipeline.target_states?.length
    ? ` -> ${pipeline.target_states.join(', ')}`
    : ''
  return `${countryLabel}${stateLabel}`
})
</script>

<template>
  <div class="border-border bg-background rounded-xl border p-6">
    <template v-if="loading && !campaign">
      <div class="space-y-3">
        <div class="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      </div>
    </template>

    <template v-else-if="campaign">
      <dl class="grid gap-4 md:grid-cols-2">
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Campaign ID</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ campaign.id }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Organization ID</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ campaign.organization_id }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Industry</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ campaign.industry }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Target Depth</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ campaign.target_depth }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Target Countries</dt>
          <dd class="mt-1 text-sm text-slate-700">
            {{ formatList(campaign.target_countries) }}
          </dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Target States</dt>
          <dd class="mt-1 text-sm text-slate-700">
            {{ formatList(campaign.target_states) }}
          </dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Monitor Cadence</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ campaign.monitor_cadence }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Sources Per Jurisdiction</dt>
          <dd class="mt-1 text-sm text-slate-700">
            {{ campaign.sources_per_jurisdiction }}
          </dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Max Jurisdictions</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ campaign.max_jurisdictions }}</dd>
        </div>
        <div>
          <dt class="text-muted text-xs font-semibold uppercase">Updated</dt>
          <dd class="mt-1 text-sm text-slate-700">
            {{ new Date(campaign.updated_at).toLocaleString() }}
          </dd>
        </div>
        <div class="md:col-span-2">
          <dt class="text-muted text-xs font-semibold uppercase">Domain Description</dt>
          <dd class="mt-1 text-sm leading-6 text-slate-700">
            {{ campaign.domain_description }}
          </dd>
        </div>
        <div v-if="contentPipeline" class="md:col-span-2">
          <dt class="text-muted text-xs font-semibold uppercase">Latest Content Pipeline</dt>
          <dd class="mt-2 flex flex-wrap gap-2 text-sm text-slate-700">
            <span
              v-if="contentPipeline.status"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              {{ contentPipeline.status }}
            </span>
            <span
              v-if="contentPipeline.mode"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              {{ contentPipeline.mode }}
            </span>
            <span
              v-if="contentPipelineScope"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              Targeted Run: {{ contentPipelineScope }}
            </span>
            <span
              v-if="contentPipeline.generated_count !== undefined"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              Generated: {{ contentPipeline.generated_count }}
            </span>
            <span
              v-if="contentPipeline.eligible_jurisdictions !== undefined"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            >
              Eligible: {{ contentPipeline.eligible_jurisdictions }}
            </span>
          </dd>
        </div>
      </dl>
    </template>

    <template v-else>
      <p class="text-sm text-slate-500">Campaign not found or unavailable.</p>
    </template>
  </div>
</template>
