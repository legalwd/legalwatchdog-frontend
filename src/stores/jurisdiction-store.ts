import { defineStore } from 'pinia'
import { ref } from 'vue'

import { jurisdictionApi, type Jurisdiction } from '@/api/jurisdiction'
import { useOrganizationStore } from '@/stores/organization-store'
import { useProjectStore } from '@/stores/project-store'
import type { JurisdictionStats } from '@/types/jurisdiction'

type JurisdictionWithChildren = Jurisdiction & { children?: JurisdictionWithChildren[] }

interface ApiError {
  response?: {
    data?: {
      detail?: string
      message?: string
    }
  }
}

const uniqById = (arr: Jurisdiction[]) => {
  const map = new Map<string, Jurisdiction>()
  for (const it of arr) map.set(it.id, it)
  return Array.from(map.values())
}

const cloneJurisdiction = (j: Jurisdiction) => {
  // Flattened store representation should not retain nested children arrays
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, ...rest } = j as JurisdictionWithChildren
  return { ...rest }
}

const flattenJurisdictions = (items: JurisdictionWithChildren[]): Jurisdiction[] => {
  const flattened: Jurisdiction[] = []

  const walk = (list: JurisdictionWithChildren[]) => {
    for (const item of list) {
      flattened.push(cloneJurisdiction(item))
      if (item.children?.length) walk(item.children)
    }
  }

  walk(items)
  return flattened
}

const LOCAL_ARCHIVE_KEY = 'archived_jurisdiction_ids'
const LOCAL_ARCHIVED_ITEMS_PREFIX = 'archived_jurisdiction_'

const loadArchivedIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ARCHIVE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveArchivedIds = (ids: string[]) => {
  localStorage.setItem(LOCAL_ARCHIVE_KEY, JSON.stringify(ids))
}

const saveArchivedJurisdiction = (jurisdiction: Jurisdiction) => {
  try {
    const key = `${LOCAL_ARCHIVED_ITEMS_PREFIX}${jurisdiction.id}`
    localStorage.setItem(key, JSON.stringify(jurisdiction))

    const archivedIds = loadArchivedIds()
    if (!archivedIds.includes(jurisdiction.id)) {
      archivedIds.push(jurisdiction.id)
      saveArchivedIds(archivedIds)
    }
  } catch (error) {
    console.error('Failed to save archived jurisdiction:', error)
  }
}

const removeArchivedJurisdiction = (jurisdictionId: string) => {
  try {
    localStorage.removeItem(`${LOCAL_ARCHIVED_ITEMS_PREFIX}${jurisdictionId}`)

    const archivedIds = loadArchivedIds()
    const updatedIds = archivedIds.filter((id) => id !== jurisdictionId)
    saveArchivedIds(updatedIds)
  } catch (error) {
    console.error('Failed to remove archived jurisdiction:', error)
  }
}

const loadArchivedFromLocalStorage = (): Jurisdiction[] => {
  try {
    const archivedIds = loadArchivedIds()
    const archivedItems: Jurisdiction[] = []

    for (const id of archivedIds) {
      const item = localStorage.getItem(`${LOCAL_ARCHIVED_ITEMS_PREFIX}${id}`)
      if (item) {
        archivedItems.push(JSON.parse(item))
      }
    }

    return archivedItems
  } catch (error) {
    console.error('Failed to load archived from localStorage:', error)
    return []
  }
}

export const useJurisdictionStore = defineStore('jurisdiction', () => {
  const orgStore = useOrganizationStore()
  const projectStore = useProjectStore()

  const jurisdictions = ref<Jurisdiction[]>([])
  const archivedJurisdictions = ref<Jurisdiction[]>([])
  const jurisdictionStatsById = ref<Record<string, JurisdictionStats>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getOrgId = (explicitOrgId?: string, projectId?: string): string => {
    if (explicitOrgId) return explicitOrgId

    const current = orgStore.currentOrganizationId
    if (current) return current

    if (projectId) {
      const project = projectStore.projects.find((p) => p.id === projectId)
      if (project?.org_id) return project.org_id
    }

    throw new Error('No active organization selected')
  }

  const fetchJurisdictions = async (projectId?: string, organizationId?: string) => {
    let orgId: string
    try {
      orgId = getOrgId(organizationId, projectId)
    } catch (e) {
      error.value = (e as Error).message
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = projectId
        ? await jurisdictionApi.getByProject(orgId, projectId)
        : await jurisdictionApi.getAll(orgId)

      const all = flattenJurisdictions(response.data?.data?.jurisdictions || [])

      jurisdictions.value = uniqById(all.filter((j) => !j.is_deleted).map(cloneJurisdiction))

      // Load archived items from localStorage to ensure persistence
      const localArchived = loadArchivedFromLocalStorage()
      archivedJurisdictions.value = uniqById([...archivedJurisdictions.value, ...localArchived])
    } catch (err) {
      const apiErr = err as ApiError
      error.value =
        apiErr.response?.data?.message ||
        apiErr.response?.data?.detail ||
        'Failed to load jurisdictions'
    } finally {
      loading.value = false
    }
  }

  const resolveJurisdictionStats = (payload: unknown): JurisdictionStats | null => {
    if (!payload || typeof payload !== 'object') return null
    const dataObj = payload as { data?: unknown }
    if (dataObj.data && typeof dataObj.data === 'object') {
      return dataObj.data as JurisdictionStats
    }
    return payload as JurisdictionStats
  }

  const fetchJurisdictionStats = async (
    jurisdictionId: string,
    organizationId?: string,
    projectId?: string,
  ) => {
    if (!jurisdictionId) return null
    let orgId: string
    try {
      orgId = getOrgId(organizationId, projectId)
    } catch (e) {
      error.value = (e as Error).message
      return null
    }

    try {
      const response = await jurisdictionApi.getStats(orgId, jurisdictionId)
      const stats = resolveJurisdictionStats(response.data)
      if (stats) {
        jurisdictionStatsById.value = {
          ...jurisdictionStatsById.value,
          [jurisdictionId]: stats,
        }
      }
      return stats
    } catch (err) {
      void err
      return null
    }
  }

  const fetchJurisdictionStatsForIds = async (
    jurisdictionIds: string[],
    organizationId?: string,
    projectId?: string,
  ) => {
    if (!jurisdictionIds.length) return
    let orgId: string
    try {
      orgId = getOrgId(organizationId, projectId)
    } catch (e) {
      error.value = (e as Error).message
      return
    }

    const idsToFetch = jurisdictionIds.filter((id) => !jurisdictionStatsById.value[id])
    if (!idsToFetch.length) return
    await Promise.allSettled(idsToFetch.map((id) => fetchJurisdictionStats(id, orgId, projectId)))
  }

  const fetchArchived = async (projectId?: string, organizationId?: string) => {
    try {
      getOrgId(organizationId, projectId)
    } catch (e) {
      error.value = (e as Error).message
      return
    }

    loading.value = true
    error.value = null

    try {
      // Load from localStorage instead of API (since API doesn't return archived items)
      const localArchived = loadArchivedFromLocalStorage()
      archivedJurisdictions.value = uniqById(localArchived.map(cloneJurisdiction))

      console.log('📦 Loaded archived from localStorage:', archivedJurisdictions.value.length)
    } catch (err) {
      const apiErr = err as ApiError
      error.value = apiErr.response?.data?.detail || 'Failed to load archived items'
    } finally {
      loading.value = false
    }
  }

  const fetchOne = async (jurisdictionId: string, organizationId?: string) => {
    let orgId: string
    try {
      orgId = getOrgId(organizationId)
    } catch (e) {
      error.value = (e as Error).message
      return null
    }

    loading.value = true
    error.value = null

    try {
      const response = await jurisdictionApi.getOne(orgId, jurisdictionId)
      const j = response.data?.data?.jurisdiction as JurisdictionWithChildren

      if (!j) return null

      const flattened = flattenJurisdictions([j])
      const flattenedIds = new Set(flattened.map((x) => x.id))

      jurisdictions.value = jurisdictions.value.filter((x) => !flattenedIds.has(x.id))
      archivedJurisdictions.value = archivedJurisdictions.value.filter(
        (x) => !flattenedIds.has(x.id),
      )

      const active = flattened.filter((item) => !item.is_deleted).map(cloneJurisdiction)
      const deleted = flattened.filter((item) => item.is_deleted).map(cloneJurisdiction)

      jurisdictions.value = uniqById([...jurisdictions.value, ...active])
      archivedJurisdictions.value = uniqById([...archivedJurisdictions.value, ...deleted])

      return j
    } catch (err) {
      const apiErr = err as ApiError
      error.value = apiErr.response?.data?.detail || 'Failed to load jurisdiction'
      return null
    } finally {
      loading.value = false
    }
  }

  const addJurisdiction = async (
    projectId: string,
    data: {
      name: string
      description?: string | null
      parent_id?: string | null
      prompt?: string | null
    },
    organizationId?: string,
  ) => {
    let orgId: string
    try {
      orgId = getOrgId(organizationId, projectId)
    } catch (e) {
      error.value = (e as Error).message
      return null
    }

    try {
      const response = await jurisdictionApi.create(orgId, {
        project_id: projectId,
        ...data,
      })

      const newJ = response.data?.data?.jurisdiction as Jurisdiction

      if (newJ) {
        jurisdictions.value = uniqById([...jurisdictions.value, cloneJurisdiction(newJ)])
      }

      return newJ
    } catch (err) {
      const apiErr = err as ApiError
      error.value = apiErr.response?.data?.detail || 'Failed to create jurisdiction'
      return null
    }
  }

  const updateJurisdiction = async (
    jurisdictionId: string,
    data: { name?: string; description?: string; prompt?: string | null },
    organizationId?: string,
  ) => {
    let orgId: string
    try {
      orgId = getOrgId(organizationId)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }

    try {
      const response = await jurisdictionApi.update(orgId, jurisdictionId, data)
      const updated = response.data?.data?.jurisdiction as Jurisdiction | undefined

      jurisdictions.value = jurisdictions.value.filter((j) => j.id !== jurisdictionId)
      archivedJurisdictions.value = archivedJurisdictions.value.filter(
        (j) => j.id !== jurisdictionId,
      )

      if (updated) {
        if (updated.is_deleted) archivedJurisdictions.value.push(cloneJurisdiction(updated))
        else jurisdictions.value.push(cloneJurisdiction(updated))
      }

      jurisdictions.value = uniqById(jurisdictions.value)
      archivedJurisdictions.value = uniqById(archivedJurisdictions.value)

      return updated ?? null
    } catch (err) {
      const apiErr = err as ApiError
      error.value = apiErr.response?.data?.detail || 'Failed to update jurisdiction'
      throw err
    }
  }

  const deleteJurisdiction = async (jurisdictionId: string, organizationId?: string) => {
    const orgId = getOrgId(organizationId)

    try {
      const itemToArchive = jurisdictions.value.find((j) => j.id === jurisdictionId)

      if (!itemToArchive) {
        throw new Error('Jurisdiction not found')
      }

      await jurisdictionApi.delete(orgId, jurisdictionId)

      const archivedItem = {
        ...itemToArchive,
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      }

      jurisdictions.value = jurisdictions.value.filter((j) => j.id !== jurisdictionId)
      archivedJurisdictions.value = uniqById([
        ...archivedJurisdictions.value,
        cloneJurisdiction(archivedItem),
      ])

      saveArchivedJurisdiction(archivedItem)

      console.log('✅ Jurisdiction archived locally:', jurisdictionId)
    } catch (err) {
      console.error('❌ Delete failed:', err)
      const apiErr = err as ApiError
      error.value = apiErr.response?.data?.detail || 'Failed to delete jurisdiction'
      throw err
    }
  }

  const restoreJurisdiction = async (jurisdictionId: string, organizationId?: string) => {
    const orgId = getOrgId(organizationId)

    try {
      const response = await jurisdictionApi.restore(orgId, jurisdictionId)

      const restored = response.data?.data?.jurisdiction as Jurisdiction

      archivedJurisdictions.value = archivedJurisdictions.value.filter(
        (j) => j.id !== jurisdictionId,
      )
      removeArchivedJurisdiction(jurisdictionId)

      jurisdictions.value = uniqById([...jurisdictions.value, cloneJurisdiction(restored)])

      return restored
    } catch (err) {
      console.error(' Restore failed:', err)
      const apiErr = err as ApiError
      error.value = apiErr.response?.data?.detail || 'Failed to restore jurisdiction'
      throw err
    }
  }

  const initializeArchived = () => {
    const localArchived = loadArchivedFromLocalStorage()
    archivedJurisdictions.value = uniqById(localArchived.map(cloneJurisdiction))
    console.log('Initialized archived from localStorage:', archivedJurisdictions.value.length)
  }

  const setError = (msg: string | null) => {
    error.value = msg
  }

  const resetStore = () => {
    jurisdictions.value = []
    archivedJurisdictions.value = []
    jurisdictionStatsById.value = {}
    loading.value = false
    error.value = null
  }

  return {
    jurisdictions,
    archivedJurisdictions,
    jurisdictionStatsById,
    loading,
    error,

    fetchJurisdictions,
    fetchArchived,
    fetchOne,
    fetchJurisdictionStats,
    fetchJurisdictionStatsForIds,
    addJurisdiction,
    updateJurisdiction,
    deleteJurisdiction,
    restoreJurisdiction,
    initializeArchived,

    setError,
    resetStore,
  }
})
