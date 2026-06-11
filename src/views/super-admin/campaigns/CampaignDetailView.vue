<script setup lang="ts">
import CampaignActionBar from '@/components/super-admin/campaigns/CampaignActionBar.vue'
import CampaignContentActionsPanel from '@/components/super-admin/campaigns/CampaignContentActionsPanel.vue'
import CampaignCreateDialog from '@/components/super-admin/campaigns/CampaignCreateDialog.vue'
import CampaignExecutionTimeline from '@/components/super-admin/campaigns/CampaignExecutionTimeline.vue'
import CampaignGeneratedBlogsPanel from '@/components/super-admin/campaigns/CampaignGeneratedBlogsPanel.vue'
import CampaignProgressCard from '@/components/super-admin/campaigns/CampaignProgressCard.vue'
import CampaignRecoveryPanel from '@/components/super-admin/campaigns/CampaignRecoveryPanel.vue'
import CampaignSummaryPanel from '@/components/super-admin/campaigns/CampaignSummaryPanel.vue'
import { useCampaignDetailController } from '@/views/super-admin/campaigns/composables/useCampaignDetailController'

const {
  campaignStore,
  activeCampaign,
  campaignBlogs,
  executionLogs,
  failedDiscoveryNodes,
  runtimeStatus,
  streamConnected,
  loading,
  loadingStatus,
  saving,
  error,
  requestError,
  organizationOptions,
  showEditDialog,
  loadingCampaignBlogs,
  loadingFailedDiscoveryNodes,
  loadedCampaignBlogs,
  loadedFailedDiscoveryNodes,
  remediationStatus,
  canRetryFailedJobs,
  canResetToDiscovery,
  canResetCampaign,
  canSmartReset,
  canStartOver,
  openEditDialog,
  closeEditDialog,
  handleSaveCampaign,
  handleDeleteCampaign,
  navigateToTaxonomy,
  handleGenerateTaxonomy,
  handleLaunchCampaign,
  handlePauseCampaign,
  handleResumeCampaign,
  handleCancelCampaign,
  handleStartOver,
  loadCampaignBlogs,
  loadFailedDiscoveryNodes,
  handleRunContentGeneration,
  handleRetryFailedContent,
  handleBackfillMissingContent,
  handlePublishCampaignBlogs,
  handlePreviewCampaignBlog,
  handleRetryFailedJobs,
  handleResetToDiscovery,
  handleResetCampaign,
  handleSmartReset,
} = useCampaignDetailController()
</script>

<template>
  <main class="bg-page-bg min-h-[calc(100vh-72px)] p-6">
    <section class="mx-auto max-w-5xl">
      <header class="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 class="text-foreground text-2xl font-semibold">
            {{ activeCampaign?.name || 'Campaign Detail' }}
          </h1>
          <p class="text-muted mt-2 text-sm">
            Review draft details and manage draft-only actions before launch.
          </p>
        </div>
      </header>

      <div
        v-if="error"
        class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <p>{{ error }}</p>
        <p v-if="campaignStore.isResourceLockedError" class="mt-1 text-xs text-red-600">
          This campaign is locked by its current backend status and cannot be modified from this
          screen.
        </p>
        <p v-if="campaignStore.isNotFoundError" class="mt-1 text-xs text-red-600">
          The requested campaign could not be found.
        </p>
      </div>

      <div class="mb-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <CampaignSummaryPanel :campaign="activeCampaign" :loading="loading" />
        <CampaignProgressCard
          :status="runtimeStatus || activeCampaign?.status || null"
          :loading="loadingStatus"
          :stream-connected="streamConnected"
          :updated-at="activeCampaign?.updated_at || null"
        />
      </div>

      <div v-if="activeCampaign" class="mb-6">
        <CampaignActionBar
          :status="runtimeStatus || activeCampaign.status"
          :can-edit="campaignStore.canEditCampaign"
          :can-delete="campaignStore.canDeleteCampaign"
          :can-generate-taxonomy="campaignStore.canGenerateTaxonomy"
          :can-review-taxonomy="campaignStore.isTaxonomyReady"
          :can-launch="campaignStore.canLaunchCampaign"
          :can-pause="campaignStore.canPauseCampaign"
          :can-resume="campaignStore.canResumeCampaign"
          :can-cancel="campaignStore.canCancelCampaign"
          :can-start-over="canStartOver"
          :saving="saving"
          @edit="openEditDialog"
          @delete="handleDeleteCampaign"
          @generate-taxonomy="handleGenerateTaxonomy"
          @review-taxonomy="navigateToTaxonomy"
          @launch="handleLaunchCampaign"
          @pause="handlePauseCampaign"
          @resume="handleResumeCampaign"
          @cancel="handleCancelCampaign"
          @start-over="handleStartOver"
        />
      </div>

      <CampaignContentActionsPanel
        v-if="activeCampaign"
        :saving="saving"
        @run-content="handleRunContentGeneration"
        @retry-failed-content="handleRetryFailedContent"
        @backfill-missing-content="handleBackfillMissingContent"
      />

      <div class="mb-6 grid gap-6 lg:grid-cols-2">
        <CampaignRecoveryPanel
          :status="remediationStatus"
          :can-retry-failed-jobs="canRetryFailedJobs"
          :can-reset-to-discovery="canResetToDiscovery"
          :can-reset-campaign="canResetCampaign"
          :can-smart-reset="canSmartReset"
          :saving="saving"
          :loading-nodes="loadingFailedDiscoveryNodes"
          :nodes-loaded="loadedFailedDiscoveryNodes"
          :failed-discovery-nodes="failedDiscoveryNodes"
          @retry-failed-jobs="handleRetryFailedJobs"
          @reset-to-discovery="handleResetToDiscovery"
          @reset-campaign="handleResetCampaign"
          @smart-reset="handleSmartReset"
          @load-failed-discovery-nodes="loadFailedDiscoveryNodes"
        />

        <CampaignGeneratedBlogsPanel
          :blogs="campaignBlogs"
          :loading-blogs="loadingCampaignBlogs"
          :loaded-blogs="loadedCampaignBlogs"
          :saving="saving"
          :preview-loading="loading"
          @load="loadCampaignBlogs"
          @publish-all="handlePublishCampaignBlogs(true)"
          @unpublish-all="handlePublishCampaignBlogs(false)"
          @preview="handlePreviewCampaignBlog"
          @publish="(blog) => handlePublishCampaignBlogs(true, blog)"
          @unpublish="(blog) => handlePublishCampaignBlogs(false, blog)"
        />
      </div>

      <CampaignExecutionTimeline :logs="executionLogs" :loading="loading" />
    </section>

    <CampaignCreateDialog
      :open="showEditDialog"
      mode="edit"
      :campaign="activeCampaign"
      :organizations="organizationOptions"
      :loading="saving"
      :error="error"
      :field-errors="requestError?.fieldErrors ?? {}"
      @close="closeEditDialog"
      @save="handleSaveCampaign"
    />
  </main>
</template>
