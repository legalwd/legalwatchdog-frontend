<script setup lang="ts">
import CampaignStatusBadge from '@/components/super-admin/campaigns/CampaignStatusBadge.vue'
import { Button } from '@/components/ui/button'
import type { CampaignStatus } from '@/types/campaign'

defineProps<{
  status: CampaignStatus
  canEdit?: boolean
  canDelete?: boolean
  canGenerateTaxonomy?: boolean
  canReviewTaxonomy?: boolean
  canLaunch?: boolean
  canPause?: boolean
  canResume?: boolean
  canCancel?: boolean
  canStartOver?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (
    e:
      | 'edit'
      | 'delete'
      | 'generate-taxonomy'
      | 'review-taxonomy'
      | 'launch'
      | 'pause'
      | 'resume'
      | 'cancel'
      | 'start-over',
  ): void
}>()
</script>

<template>
  <div class="border-border bg-background rounded-2xl border p-5">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p class="text-muted text-xs font-semibold tracking-wide uppercase">Action Bar</p>
        <h2 class="text-foreground mt-2 text-lg font-semibold">Available Actions</h2>
        <p class="mt-2 text-sm text-slate-500">
          Actions are constrained by the current backend status contract.
        </p>
      </div>

      <CampaignStatusBadge :status="status" />
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      <Button v-if="canEdit" variant="secondary" :disabled="saving" @click="emit('edit')">
        Edit Draft
      </Button>
      <Button v-if="canDelete" variant="destructive" :disabled="saving" @click="emit('delete')">
        Delete Draft
      </Button>
      <Button
        v-if="canGenerateTaxonomy"
        variant="secondary"
        :disabled="saving"
        @click="emit('generate-taxonomy')"
      >
        Generate Taxonomy
      </Button>
      <Button
        v-if="canReviewTaxonomy"
        variant="secondary"
        :disabled="saving"
        @click="emit('review-taxonomy')"
      >
        Review Taxonomy
      </Button>

      <Button v-if="canLaunch" :disabled="saving" @click="emit('launch')">Launch Campaign</Button>
      <Button v-if="canPause" variant="secondary" :disabled="saving" @click="emit('pause')">
        Pause Campaign
      </Button>
      <Button v-if="canResume" :disabled="saving" @click="emit('resume')">Resume Campaign</Button>
      <Button v-if="canCancel" variant="destructive" :disabled="saving" @click="emit('cancel')">
        Cancel Campaign
      </Button>
      <Button
        v-if="canStartOver || status === 'CANCELLED'"
        variant="secondary"
        :disabled="saving"
        @click="emit('start-over')"
      >
        Start Over
      </Button>

      <p
        v-if="
          !canEdit &&
          !canDelete &&
          !canGenerateTaxonomy &&
          !canReviewTaxonomy &&
          !canLaunch &&
          !canPause &&
          !canResume &&
          !canCancel &&
          !canStartOver &&
          status !== 'CANCELLED'
        "
        class="text-sm text-slate-500"
      >
        No actions are available for this campaign status.
      </p>
    </div>
  </div>
</template>
