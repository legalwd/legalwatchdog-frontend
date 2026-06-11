import { defineStore } from 'pinia'

import { projectService } from '@/api/project'
import type {
  CreateProjectPayload,
  Project,
  ProjectErrorResponse,
  ProjectStats,
  UpdateProjectPayload,
} from '@/types/project'

interface State {
  projects: Project[]
  projectStatsById: Record<string, ProjectStats>
  loading: boolean
  error: string | null
}

const resolveProjects = (payload: unknown): Project[] => {
  if (!payload || typeof payload !== 'object') return []
  const dataObj = payload as { projects?: unknown; data?: unknown }
  if (Array.isArray(dataObj.projects)) return dataObj.projects as Project[]
  if (dataObj.data && typeof dataObj.data === 'object') {
    const nested = dataObj.data as { projects?: unknown }
    if (Array.isArray(nested.projects)) return nested.projects as Project[]
  }
  return []
}

const resolveProject = (payload: unknown): Project | null => {
  if (!payload || typeof payload !== 'object') return null
  const dataObj = payload as { project?: unknown; data?: unknown }
  if (dataObj.project && typeof dataObj.project === 'object') return dataObj.project as Project
  if (dataObj.data && typeof dataObj.data === 'object') {
    const nested = dataObj.data as { project?: unknown }
    if (nested.project && typeof nested.project === 'object') return nested.project as Project
    if ((dataObj.data as Project).id) return dataObj.data as Project
  }
  return null
}

const resolveProjectStats = (payload: unknown): ProjectStats | null => {
  if (!payload || typeof payload !== 'object') return null
  const dataObj = payload as { data?: unknown }
  if (dataObj.data && typeof dataObj.data === 'object') return dataObj.data as ProjectStats
  return payload as ProjectStats
}

export const useProjectStore = defineStore('projects', {
  state: (): State => ({
    projects: [],
    projectStatsById: {},
    loading: false,
    error: null,
  }),

  actions: {
    setError(message: string | null) {
      this.error = message
    },

    async fetchProjects(
      organizationId: string,
      params?: { q?: string; page?: number; limit?: number },
    ) {
      this.projects = []
      this.projectStatsById = {}
      this.loading = true
      this.setError(null)
      try {
        const { data } = await projectService.listProjects(organizationId, params)
        this.projects = resolveProjects(data.data)
      } catch (error) {
        const err = error as ProjectErrorResponse
        if (!err.response) {
          this.setError('Network error: Unable to reach server')
        } else {
          this.setError(
            err.response.data?.message ||
              err.response.data?.detail?.[0]?.msg ||
              'Failed to load projects',
          )
        }
      } finally {
        this.loading = false
      }
    },

    async addProject(payload: CreateProjectPayload) {
      this.setError(null)
      if (!payload.organization_id) {
        this.setError('Select an organization before creating a project')
        return null
      }
      try {
        const { data } = await projectService.createProject(payload.organization_id, payload)
        const newProject = resolveProject(data)
        if (!newProject) {
          this.setError('Failed to create project')
          return null
        }
        this.projects.unshift(newProject)
        return newProject
      } catch (error) {
        const err = error as ProjectErrorResponse
        if (!err.response) {
          this.setError('Network error: Unable to reach server')
        } else {
          this.setError(
            err.response.data?.message ||
              err.response.data?.detail?.[0]?.msg ||
              'Failed to create project',
          )
        }
        return null
      }
    },

    async deleteProject(projectId: string, organizationId: string) {
      try {
        await projectService.deleteProject(organizationId, projectId)
        this.projects = this.projects.filter((p) => p.id !== projectId)
      } catch (error) {
        const err = error as ProjectErrorResponse
        if (!err.response) {
          this.setError('Network error: Unable to reach server')
        } else {
          this.setError(
            err.response.data?.message ||
              err.response.data?.detail?.[0]?.msg ||
              'Failed to delete project',
          )
        }
        throw error
      }
    },

    async updateProject(
      organizationId: string | null,
      projectId: string,
      payload: UpdateProjectPayload,
    ) {
      this.setError(null)

      try {
        const resolvedOrgId =
          organizationId || this.projects.find((p) => p.id === projectId)?.org_id || ''

        if (!resolvedOrgId) {
          this.setError(
            'Organization context missing. Please reopen this project from Organizations.',
          )
          return null
        }

        const { data } = await projectService.updateProject(resolvedOrgId, projectId, payload)
        const existing = this.projects.find((p) => p.id === projectId)
        const baseProject: Project = existing || {
          id: projectId,
          title: payload.title ?? '',
          description: payload.description ?? null,
          master_prompt: payload.master_prompt ?? null,
          org_id: resolvedOrgId,
          created_at: '',
          updated_at: '',
          assigned_users: [],
        }

        const updatedProject: Project = resolveProject(data) || {
          ...baseProject,
          title: payload.title ?? baseProject.title,
          description:
            payload.description !== undefined ? payload.description : baseProject.description,
          master_prompt:
            payload.master_prompt !== undefined
              ? payload.master_prompt
              : (baseProject.master_prompt ?? null),
          org_id: resolvedOrgId,
        }

        const index = this.projects.findIndex((p) => p.id === projectId)
        if (index !== -1) {
          this.projects[index] = updatedProject
        }

        return updatedProject
      } catch (error) {
        const err = error as ProjectErrorResponse
        if (!err.response) {
          this.setError('Network error: Unable to reach server')
        } else {
          this.setError(
            err.response.data?.message ||
              err.response.data?.detail?.[0]?.msg ||
              'Failed to update project',
          )
        }
        throw error
      }
    },

    async fetchProjectStats(organizationId: string, projectId: string) {
      if (!organizationId || !projectId) return null
      try {
        const { data } = await projectService.getProjectStats(organizationId, projectId)
        const stats = resolveProjectStats(data)
        if (stats) {
          this.projectStatsById = {
            ...this.projectStatsById,
            [projectId]: stats,
          }
        }
        return stats
      } catch (error) {
        void error
        return null
      }
    },

    async fetchProjectStatsForProjects(organizationId: string, projectIds: string[]) {
      if (!organizationId || projectIds.length === 0) return
      const idsToFetch = projectIds.filter((id) => !this.projectStatsById[id])
      if (!idsToFetch.length) return
      await Promise.allSettled(
        idsToFetch.map((projectId) => this.fetchProjectStats(organizationId, projectId)),
      )
    },
  },
})
