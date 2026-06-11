<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { CampaignFailedDiscoveryNode, CampaignStatus } from '@/types/campaign'

defineProps<{
  status: CampaignStatus | null
  canRetryFailedJobs?: boolean
  canResetToDiscovery?: boolean
  canResetCampaign?: boolean
  canSmartReset?: boolean
  saving?: boolean
  loadingNodes?: boolean
  nodesLoaded?: boolean
  failedDiscoveryNodes?: CampaignFailedDiscoveryNode[]
}>()

const emit = defineEmits<{
  (
    e:
      | 'retry-failed-jobs'
      | 'reset-to-discovery'
      | 'reset-campaign'
      | 'smart-reset'
      | 'load-failed-discovery-nodes',
  ): void
}>()

const getNodeIdentifier = (node: CampaignFailedDiscoveryNode) => node.jurisdiction_id || node.id
</script>

<template>
  <section class="border-border bg-background rounded-xl border p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-muted text-xs font-semibold tracking-wide uppercase">Recovery</p>
        <h2 class="text-foreground mt-2 text-lg font-semibold">Campaign Recovery</h2>
        <p class="mt-2 text-sm text-slate-500">
          Use recovery actions when a run fails, stalls, or needs to be restarted from a safer
          phase.
        </p>
      </div>
      <p class="text-xs font-medium text-slate-500 uppercase">
        Current status: {{ status || 'Unavailable' }}
      </p>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2">
      <div class="border-border rounded-lg border p-4">
        <h3 class="text-sm font-semibold text-slate-800">Retry Failed Jobs</h3>
        <p class="mt-2 text-sm text-slate-500">
          Re-dispatch only the failed jurisdiction jobs without resetting the whole campaign.
        </p>
        <Button
          v-if="canRetryFailedJobs"
          class="mt-4"
          variant="secondary"
          :disabled="saving"
          @click="emit('retry-failed-jobs')"
        >
          Retry Failed Jobs
        </Button>
      </div>

      <div class="border-border rounded-lg border p-4">
        <h3 class="text-sm font-semibold text-slate-800">Reset To Discovery</h3>
        <p class="mt-2 text-sm text-slate-500">
          Send the campaign back to source discovery so jurisdictions can rebuild their source set.
        </p>
        <Button
          v-if="canResetToDiscovery"
          class="mt-4"
          variant="secondary"
          :disabled="saving"
          @click="emit('reset-to-discovery')"
        >
          Reset To Discovery
        </Button>
      </div>

      <div class="border-border rounded-lg border p-4">
        <h3 class="text-sm font-semibold text-slate-800">Smart Reset</h3>
        <p class="mt-2 text-sm text-slate-500">
          Let the backend choose the most appropriate recovery point from the failed phase.
        </p>
        <Button
          v-if="canSmartReset"
          class="mt-4"
          variant="secondary"
          :disabled="saving"
          @click="emit('smart-reset')"
        >
          Smart Reset
        </Button>
      </div>

      <div class="border-border rounded-lg border p-4">
        <h3 class="text-sm font-semibold text-slate-800">Full Reset</h3>
        <p class="mt-2 text-sm text-slate-500">
          Restart the campaign from a clean recovery path when the current state is no longer
          usable.
        </p>
        <Button
          v-if="canResetCampaign"
          class="mt-4"
          variant="destructive"
          :disabled="saving"
          @click="emit('reset-campaign')"
        >
          Reset Campaign
        </Button>
      </div>
    </div>

    <div class="border-border mt-6 rounded-lg border p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Failed Discovery Nodes</h3>
          <p class="mt-2 text-sm text-slate-500">
            Review jurisdictions that still need manual sources before retrying recovery work.
          </p>
        </div>
        <Button
          variant="secondary"
          :loading="loadingNodes"
          :disabled="saving"
          @click="emit('load-failed-discovery-nodes')"
        >
          {{ nodesLoaded ? 'Refresh Nodes' : 'Load Nodes' }}
        </Button>
      </div>

      <div v-if="loadingNodes" class="mt-4 space-y-3">
        <div class="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>

      <ul v-else-if="failedDiscoveryNodes?.length" class="mt-4 space-y-3">
        <li
          v-for="node in failedDiscoveryNodes"
          :key="node.id"
          class="border-border rounded-lg border px-4 py-3"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-800">
                {{ node.name || 'Unnamed jurisdiction' }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ getNodeIdentifier(node) }}
              </p>
              <p v-if="node.description" class="mt-2 text-sm text-slate-600">
                {{ node.description }}
              </p>
            </div>
            <p class="text-xs font-medium text-amber-700 uppercase">
              Missing sources: {{ node.missing_sources_count ?? 0 }}
            </p>
          </div>
        </li>
      </ul>

      <p v-else class="mt-4 text-sm text-slate-500">
        {{
          nodesLoaded
            ? 'No failed discovery nodes were returned for this campaign.'
            : 'Load failed discovery nodes to review jurisdictions that still need manual sources.'
        }}
      </p>
    </div>
  </section>
</template>
