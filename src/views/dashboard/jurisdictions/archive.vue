<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { toast } from 'vue-sonner'

import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useOrganizationStore } from '@/stores/organization-store'

const jurisdictionStore = useJurisdictionStore()
const orgStore = useOrganizationStore()

const loading = ref(false)
const orgId = computed(() => orgStore.currentOrganizationId || undefined)
const { confirm: openConfirm } = useConfirmDialog()

const archivedJurisdictions = computed(() => {
  return jurisdictionStore.archivedJurisdictions
})

onMounted(() => {
  jurisdictionStore.initializeArchived()
})

const restoreJurisdiction = async (jurisdictionId: string) => {
  openConfirm({
    title: 'Restore Jurisdiction?',
    description: 'This will make the jurisdiction active again.',
    confirmText: 'Restore',
    cancelText: 'Cancel',
    async onConfirm() {
      try {
        loading.value = true

        if (!orgId.value) {
          throw new Error('No organization selected')
        }

        await jurisdictionStore.restoreJurisdiction(jurisdictionId, orgId.value)

        toast.success('Jurisdiction restored successfully')
      } catch (error) {
        console.error('Restore failed:', error)
        toast.error('Failed to restore jurisdiction')
      } finally {
        loading.value = false
      }
    },
  })
}

const permanentDelete = async (jurisdictionId: string) => {
  openConfirm({
    title: 'Remove from Archive?',
    description: 'This will remove the jurisdiction from your archived list.',
    confirmText: 'Remove',
    cancelText: 'Cancel',
    async onConfirm() {
      try {
        jurisdictionStore.archivedJurisdictions = jurisdictionStore.archivedJurisdictions.filter(
          (j) => j.id !== jurisdictionId,
        )

        const ids = JSON.parse(localStorage.getItem('archived_jurisdiction_ids') || '[]')
        const updatedIds = ids.filter((id: string) => id !== jurisdictionId)

        localStorage.setItem('archived_jurisdiction_ids', JSON.stringify(updatedIds))
        localStorage.removeItem(`archived_jurisdiction_${jurisdictionId}`)

        toast.success('Jurisdiction removed from archive')
      } catch {
        toast.error('Failed to remove jurisdiction')
      }
    },
  })
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Archived Jurisdictions</h1>
            <p class="mt-1 text-sm sm:mt-2 sm:text-base">Manage your deleted jurisdictions</p>
          </div>
          <button
            class="bg-background w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            @click="$router.back()"
          >
            Back
          </button>
        </div>
      </div>

      <div v-if="!orgId" class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div class="flex items-start sm:items-center">
          <svg
            class="mt-0.5 mr-3 h-5 w-5 shrink-0 text-yellow-600 sm:mt-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-sm text-yellow-800">
            No organization selected. Please select an organization to view archived jurisdictions.
          </p>
        </div>
      </div>

      <div v-else-if="loading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="archivedJurisdictions.length === 0" class="py-12 text-center sm:py-16">
        <div class="mx-auto max-w-md px-4 sm:px-0">
          <div class="mx-auto mb-4 h-16 w-16 text-gray-400 sm:mb-6 sm:h-20 sm:w-20">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl">
            No Archived Jurisdictions
          </h3>
          <p class="mb-4 text-sm text-gray-500 sm:mb-6 sm:text-base">
            Jurisdictions you delete will appear here for restoration.
          </p>
          <button
            class="bg-accent-main w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white sm:w-auto"
            @click="$router.back()"
          >
            Return to Active Jurisdictions
          </button>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div class="flex items-start sm:items-center">
            <svg
              class="mt-0.5 mr-3 h-5 w-5 shrink-0 text-blue-600 sm:mt-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-blue-800">
              You have {{ archivedJurisdictions.length }} archived jurisdiction(s). Restore them to
              make them active again.
            </p>
          </div>
        </div>

        <div
          v-for="jurisdiction in archivedJurisdictions"
          :key="jurisdiction.id"
          class="bg-background rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex-1">
              <div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <span
                  class="inline-flex items-center self-start rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 sm:self-center"
                >
                  Archived
                </span>
                <h3 class="text-base font-semibold text-gray-900 sm:text-lg">
                  {{ jurisdiction.name }}
                </h3>
              </div>

              <p class="mb-3 text-sm sm:text-base">{{ jurisdiction.description }}</p>

              <div
                class="flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:gap-2 sm:text-sm"
              >
                <span>Created: {{ new Date(jurisdiction.created_at).toLocaleDateString() }}</span>
                <span class="hidden sm:inline">•</span>
                <span v-if="jurisdiction.deleted_at" class="sm:ml-0">
                  Archived: {{ new Date(jurisdiction.deleted_at).toLocaleDateString() }}
                </span>
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-2 sm:mt-0 sm:ml-6 sm:flex-row sm:items-center">
              <button
                class="bg-accent-main w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white sm:w-auto"
                @click="restoreJurisdiction(jurisdiction.id)"
              >
                Restore
              </button>
              <button
                class="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:w-auto"
                @click="permanentDelete(jurisdiction.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
