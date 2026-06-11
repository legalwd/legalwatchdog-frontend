import { defineStore } from 'pinia'
import { ref } from 'vue'

import { sourceApi } from '@/api/source'
import type {
  Source,
  CreateSourcePayload,
  UpdateSourcePayload,
  SourceRevision,
  RevisionsResponse,
  ScrapeJob,
  ScrapeJobsResponse,
  ScrapeJobStatus,
} from '@/types/source'

interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
      detail?: string | Array<{ msg?: string }>
    }
  }
}

export const useSourceStore = defineStore('source', () => {
  const sources = ref<Source[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const revisions = ref<Record<string, SourceRevision[]>>({})
  const revisionsLoading = ref<Record<string, boolean>>({})
  const revisionsError = ref<Record<string, string | null>>({})
  const revisionsPagination = ref<Record<string, RevisionsResponse['pagination']>>({})
  const scrapeJobs = ref<Record<string, ScrapeJob[]>>({})
  const scrapeJobsLoading = ref<Record<string, boolean>>({})
  const scrapeJobsError = ref<Record<string, string | null>>({})
  const scrapeJobsPagination = ref<Record<string, Omit<ScrapeJobsResponse, 'items'>>>({})
  const activeScrapeJobs = ref<Record<string, ScrapeJob | null>>({})
  const scrapeJobStatusLoading = ref<Record<string, boolean>>({})
  const requestControllers = ref<Record<string, Set<AbortController>>>({})

  const getErrorMessage = (err: unknown, fallback: string) => {
    const apiErr = err as ApiError
    const detail = apiErr.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
    return apiErr.response?.data?.message ?? fallback
  }

  const isCanceled = (err: unknown) => {
    const maybeErr = err as { code?: string; name?: string }
    return maybeErr?.code === 'ERR_CANCELED' || maybeErr?.name === 'CanceledError'
  }

  const trackRequest = (sourceId: string) => {
    const controller = new AbortController()
    const controllers = requestControllers.value[sourceId] ?? new Set<AbortController>()
    controllers.add(controller)
    requestControllers.value = {
      ...requestControllers.value,
      [sourceId]: controllers,
    }

    const cleanup = () => {
      const current = requestControllers.value[sourceId]
      if (!current) return
      current.delete(controller)
      requestControllers.value =
        current.size === 0
          ? (({ [sourceId]: _omit, ...rest }) => rest)(requestControllers.value)
          : { ...requestControllers.value, [sourceId]: current }
    }

    return { controller, cleanup }
  }

  const cancelRequestsForSource = (sourceId: string) => {
    const controllers = requestControllers.value[sourceId]
    if (!controllers) return
    controllers.forEach((controller) => controller.abort())
    controllers.clear()
    requestControllers.value = (({ [sourceId]: _omit, ...rest }) => rest)(requestControllers.value)
  }

  const fetchSources = async (jurisdictionId: string, isActive?: boolean) => {
    loading.value = true
    error.value = null
    try {
      const params: { jurisdiction_id: string; is_active?: boolean } = {
        jurisdiction_id: jurisdictionId,
      }
      if (typeof isActive === 'boolean') params.is_active = isActive
      const res = await sourceApi.list(params)
      sources.value = res?.data?.data?.sources ?? []
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to load sources')
    } finally {
      loading.value = false
    }
  }

  const normalizeJob = (job?: ScrapeJob | (ScrapeJob & { job_id?: string }) | null) => {
    if (!job) return null
    const id = (job as { job_id?: string }).job_id || job.id
    if (!id) return null

    return {
      ...job,
      id,
      is_baseline: job.is_baseline ?? false,
    } as ScrapeJob
  }

  const isJobActive = (status?: ScrapeJobStatus) => status === 'PENDING' || status === 'IN_PROGRESS'

  const upsertJob = (sourceId: string, job: ScrapeJob | null) => {
    if (!job) return
    const normalized = normalizeJob(job)
    if (!normalized) return

    const list = scrapeJobs.value[sourceId] ? [...scrapeJobs.value[sourceId]] : []
    const idx = list.findIndex((item) => item.id === normalized.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...normalized }
    } else {
      list.unshift(normalized)
    }
    scrapeJobs.value[sourceId] = list

    activeScrapeJobs.value[sourceId] = isJobActive(normalized.status) ? normalized : null
  }

  const createSource = async (payload: CreateSourcePayload) => {
    loading.value = true
    error.value = null
    try {
      const res = await sourceApi.create(payload)
      const created = res?.data?.data?.source
      if (created) {
        sources.value.unshift(created)
      }
      return created
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to create source')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateSource = async (sourceId: string, payload: UpdateSourcePayload) => {
    loading.value = true
    error.value = null
    try {
      const res = await sourceApi.update(sourceId, payload)
      const updated = res?.data?.data?.source

      if (updated) {
        sources.value = sources.value.map((s) => (s.id === updated.id ? updated : s))
      }

      return updated
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to update source')
      return null
    } finally {
      loading.value = false
    }
  }

  const patchSource = async (sourceId: string, payload: UpdateSourcePayload) => {
    loading.value = true
    error.value = null
    try {
      const res = await sourceApi.patch(sourceId, payload)
      const updated = res?.data?.data?.source
      if (updated) {
        sources.value = sources.value.map((s) => (s.id === updated.id ? updated : s))
      }
      return updated
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to update source')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteSource = async (sourceId: string, permanent?: boolean) => {
    loading.value = true
    error.value = null
    cancelRequestsForSource(sourceId)
    try {
      await sourceApi.delete(sourceId, permanent)
      sources.value = sources.value.filter((s) => s.id !== sourceId)
      return true
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to delete source')
      return false
    } finally {
      loading.value = false
    }
  }

  const scrapeSource = async (sourceId: string) => {
    error.value = null
    const { controller, cleanup } = trackRequest(sourceId)
    try {
      const res = await sourceApi.triggerScrape(sourceId, { signal: controller.signal })
      const job = normalizeJob(res?.data?.data as ScrapeJob)
      if (job) {
        upsertJob(sourceId, job)
      }
      return job
    } catch (err) {
      if (isCanceled(err)) return null
      error.value = getErrorMessage(err, 'Failed to scrape source')
      throw err
    } finally {
      cleanup()
    }
  }

  const fetchRevisions = async (sourceId: string, params?: { skip?: number; limit?: number }) => {
    revisionsLoading.value[sourceId] = true
    revisionsError.value[sourceId] = null
    const { controller, cleanup } = trackRequest(sourceId)

    try {
      const res = await sourceApi.getRevisions(sourceId, params, { signal: controller.signal })
      const data = res?.data?.data

      if (data?.revisions) {
        revisions.value[sourceId] = data.revisions
      }

      if (data?.pagination) {
        revisionsPagination.value[sourceId] = data.pagination
      }

      return data
    } catch (err) {
      if (isCanceled(err)) return null
      const msg = getErrorMessage(err, 'Failed to load revisions')
      revisionsError.value[sourceId] = msg
      throw err
    } finally {
      cleanup()
      revisionsLoading.value[sourceId] = false
    }
  }

  const fetchScrapeJobs = async (
    sourceId: string,
    params?: { page?: number; per_page?: number },
  ) => {
    scrapeJobsLoading.value[sourceId] = true
    scrapeJobsError.value[sourceId] = null
    const { controller, cleanup } = trackRequest(sourceId)

    try {
      const res = await sourceApi.listScrapeJobs(sourceId, params, { signal: controller.signal })
      const data = res?.data?.data

      if (data?.items) {
        scrapeJobs.value[sourceId] = data.items
          .map((item) => normalizeJob(item))
          .filter(Boolean) as ScrapeJob[]
        const active = scrapeJobs.value[sourceId].find((job) => isJobActive(job.status))
        activeScrapeJobs.value[sourceId] = active || null
      } else {
        scrapeJobs.value[sourceId] = []
        activeScrapeJobs.value[sourceId] = null
      }

      if (data) {
        const { ...pagination } = data
        scrapeJobsPagination.value[sourceId] = pagination
      }

      return data
    } catch (err) {
      if (isCanceled(err)) return null
      const msg = getErrorMessage(err, 'Failed to load scrape jobs')
      scrapeJobsError.value[sourceId] = msg
      activeScrapeJobs.value[sourceId] = null
      throw err
    } finally {
      cleanup()
      scrapeJobsLoading.value[sourceId] = false
    }
  }

  const fetchActiveScrapeJob = async (sourceId: string) => {
    scrapeJobStatusLoading.value[sourceId] = true
    scrapeJobsError.value[sourceId] = null
    const { controller, cleanup } = trackRequest(sourceId)
    try {
      const res = await sourceApi.getActiveScrapeJob(sourceId, { signal: controller.signal })
      const job = normalizeJob(res?.data?.data as ScrapeJob | null)
      activeScrapeJobs.value[sourceId] = job && isJobActive(job.status) ? job : null
      if (job) upsertJob(sourceId, job)
      return job
    } catch (err) {
      if (isCanceled(err)) return null
      const status = (err as ApiError).response?.status
      if (status === 404) {
        activeScrapeJobs.value[sourceId] = null
        return null
      }
      const msg = getErrorMessage(err, 'Failed to fetch active scrape job')
      scrapeJobsError.value[sourceId] = msg
      throw err
    } finally {
      cleanup()
      scrapeJobStatusLoading.value[sourceId] = false
    }
  }

  const fetchScrapeJobStatus = async (
    sourceId: string,
    jobId: string,
  ): Promise<{ job: ScrapeJob | null; notFound: boolean }> => {
    scrapeJobStatusLoading.value[sourceId] = true
    scrapeJobsError.value[sourceId] = null
    const { controller, cleanup } = trackRequest(sourceId)
    try {
      const res = await sourceApi.getScrapeJobStatus(sourceId, jobId, {
        signal: controller.signal,
      })
      const job = normalizeJob(res?.data?.data as ScrapeJob | null)
      if (job) {
        upsertJob(sourceId, job)
        activeScrapeJobs.value[sourceId] = isJobActive(job.status) ? job : null
      } else {
        activeScrapeJobs.value[sourceId] = null
      }
      return { job, notFound: false }
    } catch (err) {
      if (isCanceled(err)) throw err
      const status = (err as ApiError).response?.status
      if (status === 404) {
        activeScrapeJobs.value[sourceId] = null
        return { job: null, notFound: true }
      }
      const msg = getErrorMessage(err, 'Failed to fetch scrape status')
      scrapeJobsError.value[sourceId] = msg
      throw err
    } finally {
      cleanup()
      scrapeJobStatusLoading.value[sourceId] = false
    }
  }

  const setError = (msg: string | null) => {
    error.value = msg
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    sources.value = []
    loading.value = false
    error.value = null
    revisions.value = {}
    revisionsLoading.value = {}
    revisionsError.value = {}
    revisionsPagination.value = {}
    scrapeJobs.value = {}
    scrapeJobsLoading.value = {}
    scrapeJobsError.value = {}
    scrapeJobsPagination.value = {}
    activeScrapeJobs.value = {}
    scrapeJobStatusLoading.value = {}
    requestControllers.value = {}
  }

  return {
    sources,
    loading,
    error,
    revisions,
    revisionsLoading,
    revisionsError,
    revisionsPagination,
    scrapeJobs,
    scrapeJobsLoading,
    scrapeJobsError,
    scrapeJobsPagination,
    activeScrapeJobs,
    scrapeJobStatusLoading,

    fetchSources,
    createSource,
    updateSource,
    patchSource,
    deleteSource,
    scrapeSource,
    fetchRevisions,
    fetchScrapeJobs,
    fetchActiveScrapeJob,
    fetchScrapeJobStatus,

    setError,
    clearError,
    cancelRequestsForSource,
    resetStore,
  }
})
