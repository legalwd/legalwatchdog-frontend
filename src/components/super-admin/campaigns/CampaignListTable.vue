<script setup lang="ts">
import CampaignStatusBadge from '@/components/super-admin/campaigns/CampaignStatusBadge.vue'
import type { Campaign } from '@/types/campaign'

defineProps<{
  campaigns: Campaign[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', campaignId: string): void
}>()

const openCampaign = (campaignId: string) => {
  emit('select', campaignId)
}
</script>

<template>
  <div class="border-border bg-background overflow-hidden rounded-2xl border">
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-muted-background/40 border-border border-b">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Campaign
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Organization
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Industry
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Target Depth
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Status
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Updated
            </th>
          </tr>
        </thead>

        <tbody class="divide-border divide-y">
          <template v-if="loading">
            <tr v-for="i in 6" :key="`campaign-skeleton-${i}`" class="animate-pulse">
              <td class="px-4 py-4"><div class="h-4 w-40 rounded bg-slate-200" /></td>
              <td class="px-4 py-4"><div class="h-4 w-24 rounded bg-slate-200" /></td>
              <td class="px-4 py-4"><div class="h-4 w-24 rounded bg-slate-200" /></td>
              <td class="px-4 py-4"><div class="h-4 w-20 rounded bg-slate-200" /></td>
              <td class="px-4 py-4"><div class="h-6 w-24 rounded-full bg-slate-200" /></td>
              <td class="px-4 py-4"><div class="h-4 w-28 rounded bg-slate-200" /></td>
            </tr>
          </template>

          <tr v-else-if="campaigns.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">
              No campaigns found for the current filters.
            </td>
          </tr>

          <tr
            v-for="campaign in campaigns"
            v-else
            :key="campaign.id"
            class="hover:bg-muted-background/30 cursor-pointer transition-colors"
            @click="openCampaign(campaign.id)"
          >
            <td class="px-4 py-4">
              <div class="text-sm font-semibold text-slate-900">{{ campaign.name }}</div>
              <div class="mt-1 line-clamp-2 text-xs text-slate-500">
                {{ campaign.domain_description }}
              </div>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ campaign.organization_id }}</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ campaign.industry }}</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ campaign.target_depth }}</td>
            <td class="px-4 py-4">
              <CampaignStatusBadge :status="campaign.status" />
            </td>
            <td class="px-4 py-4 text-sm text-slate-600">
              {{ new Date(campaign.updated_at).toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
