<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { toast } from 'vue-sonner'

import type { Jurisdiction } from '@/api/jurisdiction'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'

import JurisdictionAnalysisSection from './components/JurisdictionAnalysisSection.vue'
import JurisdictionDataPageSection from './components/JurisdictionDataPageSection.vue'
import JurisdictionHeaderSection from './components/JurisdictionHeaderSection.vue'
import JurisdictionOnboardingSection from './components/JurisdictionOnboardingSection.vue'
import JurisdictionScrapeSection from './components/JurisdictionScrapeSection.vue'
import JurisdictionSourcesSection from './components/JurisdictionSourcesSection.vue'
// import SubJurisdictionsSection from './components/SubJurisdictionsSection.vue'

const LAST_JURISDICTION_KEY = 'lwd:last-jurisdiction-id'
const LAST_ORG_KEY = 'lwd:last-organization-id'

const saveLastJurisdictionId = (jurisdictionId: string) => {
  if (!jurisdictionId || typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_JURISDICTION_KEY, jurisdictionId)
  } catch {
    // Ignore persistence errors
  }
}

const readLastOrganizationId = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LAST_ORG_KEY)
  } catch {
    return null
  }
}

const route = useRoute()
const router = useRouter()

const jurisdictionStore = useJurisdictionStore()
const projectStore = useProjectStore()
const orgStore = useOrganizationStore()

const storedOrganizationId = ref(readLastOrganizationId() || '')
const activeOrganizationId = computed<string>(() => {
  if (typeof route.query.organizationId === 'string' && route.query.organizationId) {
    return route.query.organizationId
  }
  return storedOrganizationId.value || orgStore.currentOrganizationId || ''
})

const jurisdictionId = computed(() => route.params.id as string)
const jurisdiction = ref<Jurisdiction | null>(null)
const loading = ref(true)
const jurisdictionRequested = ref(false)
type JurisdictionTab = 'analysis' | 'data-page' | 'sources'

const activeTab = ref<JurisdictionTab>('data-page')
const dataPageRefreshKey = ref(0)

const normalizeTab = (tab: unknown): JurisdictionTab =>
  tab === 'analysis' || tab === 'sources' ? tab : 'data-page'

const syncTabToRoute = (tab: JurisdictionTab) => {
  const current = normalizeTab(route.query.tab)
  if (current === tab) return
  const nextQuery: Record<string, unknown> = { ...route.query, tab }
  if (tab !== 'analysis') {
    delete nextQuery.revisionId
  }
  router.replace({ query: nextQuery as LocationQueryRaw })
}

const projectName = computed(() => {
  const projId = jurisdiction.value?.project_id
  if (!projId) return ''
  const project = projectStore.projects.find((p) => p.id === projId)
  return project?.title || ''
})

const parentJurisdiction = computed(() => {
  if (!jurisdiction.value) return null
  return jurisdictionStore.jurisdictions.find((j) => j.id === jurisdiction.value?.parent_id) || null
})

const parseApiError = (err: unknown, fallback: string) => {
  const apiErr = err as {
    response?: { data?: { message?: string; detail?: string | Array<{ msg?: string }> } }
    message?: string
  }

  const detail = apiErr.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  if (apiErr.response?.data?.message) return apiErr.response.data.message
  if (apiErr.message) return apiErr.message
  return fallback
}

const loadJurisdiction = async (id: string) => {
  jurisdictionRequested.value = true
  loading.value = true

  try {
    let orgId = activeOrganizationId.value || orgStore.currentOrganizationId || ''

    const existing = jurisdictionStore.jurisdictions.find((j) => j.id === id)
    jurisdiction.value = existing || (await jurisdictionStore.fetchOne(id, orgId || undefined))

    if (!projectStore.projects.length && orgId) {
      await projectStore.fetchProjects(orgId)
    }

    if (jurisdiction.value) {
      const project =
        projectStore.projects.find((p) => p.id === jurisdiction.value?.project_id) || null
      orgId = orgId || project?.org_id || ''
      if (orgId && orgId !== activeOrganizationId.value) {
        orgStore.setCurrentOrganization(orgId)
        storedOrganizationId.value = orgId
      }

      if (orgId) {
        await jurisdictionStore.fetchJurisdictions(jurisdiction.value.project_id, orgId)
        jurisdiction.value =
          jurisdictionStore.jurisdictions.find((j) => j.id === id) || jurisdiction.value
      }
    }
  } catch (err) {
    console.error('Failed to load jurisdiction', err)
    toast.error(parseApiError(err, 'Failed to load jurisdiction'))
    jurisdiction.value = null
  } finally {
    loading.value = false
  }
}

const pageLoading = computed(() => !jurisdictionRequested.value || loading.value)
const hasInstruction = computed(() => Boolean(jurisdiction.value?.prompt?.trim()))
const onboardingInProgress = ref(false)
const showOnboarding = computed(() =>
  Boolean(
    jurisdiction.value &&
    !pageLoading.value &&
    (onboardingInProgress.value || !hasInstruction.value),
  ),
)

const redirectToJurisdiction = () => {
  if (!jurisdictionId.value) return
  onboardingInProgress.value = false
  const nextQuery = { ...route.query, tab: 'data-page' }
  router.push({
    name: 'jurisdiction-detail',
    params: { id: jurisdictionId.value },
    query: nextQuery,
  })
}

const handleScrapeCompleted = () => {
  dataPageRefreshKey.value += 1
}

const goBack = () => {
  router.push({
    name: 'organization-projects',
    params: { organizationId: activeOrganizationId.value },
  })
}

watch(
  () => jurisdictionId.value,
  (id) => {
    if (id) {
      loadJurisdiction(id)
    }
  },
)

watch(
  () => activeOrganizationId.value,
  (orgId) => {
    if (orgId) {
      orgStore.setCurrentOrganization(orgId)
    }
  },
  { immediate: true },
)

watch(
  () => jurisdiction.value?.id,
  (id) => {
    if (id) saveLastJurisdictionId(id)
  },
)

watch(
  () => [pageLoading.value, hasInstruction.value, jurisdiction.value?.id],
  ([loadingValue, instructionSet]) => {
    if (!loadingValue && !instructionSet) {
      onboardingInProgress.value = true
    }
  },
  { immediate: true },
)

watch(
  () => jurisdictionStore.jurisdictions,
  () => {
    const found = jurisdictionStore.jurisdictions.find((j) => j.id === jurisdictionId.value)
    if (found) jurisdiction.value = found
  },
  { deep: true },
)

watch(
  () => route.query.tab,
  (tab) => {
    const normalized = normalizeTab(tab)
    if (activeTab.value !== normalized) activeTab.value = normalized
  },
  { immediate: true },
)

watch(activeTab, (tab) => {
  syncTabToRoute(tab)
})

onMounted(() => {
  if (!activeOrganizationId.value) {
    const storedOrgId = readLastOrganizationId()
    if (storedOrgId) {
      orgStore.setCurrentOrganization(storedOrgId)
      storedOrganizationId.value = storedOrgId
    }
  }
  loadJurisdiction(jurisdictionId.value)
})
</script>

<template>
  <main class="min-h-screen flex-1 bg-[#F8F7F5] px-4 py-6 sm:px-6 lg:px-10 lg:py-12">
    <div
      v-if="!pageLoading && !jurisdiction"
      class="bg-background mx-auto max-w-4xl rounded-2xl p-10 text-center shadow-sm"
    >
      <h1 class="text-2xl font-semibold text-gray-900">Jurisdiction not found</h1>
      <button
        class="text-accent-main mt-4 inline-flex items-center gap-2 hover:underline"
        @click="goBack"
      >
        Back to Projects
      </button>
    </div>

    <div v-else class="mx-auto space-y-6 lg:space-y-8">
      <JurisdictionHeaderSection
        v-model:jurisdiction="jurisdiction"
        :project-name="projectName"
        :active-organization-id="activeOrganizationId"
        :parent-jurisdiction="parentJurisdiction"
        :is-loading="pageLoading"
        :hide-instruction-button="showOnboarding"
      />

      <JurisdictionOnboardingSection
        v-if="showOnboarding"
        :jurisdiction="jurisdiction"
        :active-organization-id="activeOrganizationId"
        :is-loading="pageLoading"
        @update:jurisdiction="jurisdiction = $event"
        @complete="redirectToJurisdiction"
      />

      <div v-else class="space-y-6 lg:space-y-8">
        <JurisdictionScrapeSection
          :organization-id="activeOrganizationId"
          :jurisdiction-id="jurisdiction?.id || ''"
          v-bind="jurisdiction?.sources ? { sourcesCount: jurisdiction.sources.length } : {}"
          :is-loading="pageLoading"
          @scrape:completed="handleScrapeCompleted"
        />

        <section class="bg-background rounded-2xl shadow-sm ring-1 ring-gray-100">
          <div class="border-b border-gray-100 px-6 py-4">
            <div class="flex gap-8">
              <button
                :class="[
                  'text-preset-body-lg relative pb-1 transition-colors',
                  activeTab === 'data-page'
                    ? 'text-foreground'
                    : 'hover:text-foreground cursor-pointer text-gray-500',
                ]"
                @click="activeTab = 'data-page'"
              >
                Data Page
                <span
                  v-if="activeTab === 'data-page'"
                  class="bg-accent-main absolute inset-x-0 -bottom-px h-0.5"
                ></span>
              </button>

              <button
                :class="[
                  'text-preset-body-lg relative pb-1 transition-colors',
                  activeTab === 'sources'
                    ? 'text-foreground'
                    : 'hover:text-foreground cursor-pointer text-gray-500',
                ]"
                @click="activeTab = 'sources'"
              >
                Sources
                <span
                  v-if="activeTab === 'sources'"
                  class="bg-accent-main absolute inset-x-0 -bottom-px h-0.5"
                ></span>
              </button>

              <button
                :class="[
                  'text-preset-body-lg relative pb-1 transition-colors',
                  activeTab === 'analysis'
                    ? 'text-foreground'
                    : 'hover:text-foreground cursor-pointer text-gray-500',
                ]"
                @click="activeTab = 'analysis'"
              >
                Analysis
                <span
                  v-if="activeTab === 'analysis'"
                  class="bg-accent-main absolute inset-x-0 -bottom-px h-0.5"
                ></span>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'data-page'">
            <JurisdictionDataPageSection
              :organization-id="activeOrganizationId"
              :jurisdiction-id="jurisdiction?.id || ''"
              :is-loading="pageLoading"
              :refresh-key="dataPageRefreshKey"
            />
          </div>

          <div v-else-if="activeTab === 'sources'">
            <JurisdictionSourcesSection
              :jurisdiction="jurisdiction"
              :project-name="projectName"
              :is-loading="pageLoading"
            />
          </div>

          <div v-else>
            <JurisdictionAnalysisSection
              :jurisdiction="jurisdiction"
              :active-organization-id="activeOrganizationId"
              :is-loading="pageLoading"
            />
          </div>
        </section>

        <!-- <SubJurisdictionsSection
          :jurisdiction="jurisdiction"
          :active-organization-id="activeOrganizationId"
          :is-loading="pageLoading"
        /> -->
      </div>
    </div>
  </main>
</template>
