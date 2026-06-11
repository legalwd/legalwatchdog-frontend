import api from '@/lib/api'
import type {
  CreateProjectPayload,
  Project,
  ProjectStats,
  UpdateProjectPayload,
} from '@/types/project'

type ApiResponse<T> = {
  status?: string
  status_code?: number
  message?: string
  data: T
}

type ProjectsList = {
  projects: Project[]
  total: number
  page: number
  limit: number
  total_pages: number | null
}

export const projectService = {
  listProjects: (organization_id: string, params?: { q?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<ProjectsList>>(`/organizations/${organization_id}/projects`, {
      params,
    }),

  createProject: (organization_id: string, payload: CreateProjectPayload) =>
    api.post<ApiResponse<Project>>(`/organizations/${organization_id}/projects`, payload),

  updateProject: (organization_id: string, project_id: string, payload: UpdateProjectPayload) =>
    api.patch<ApiResponse<Project>>(
      `/organizations/${organization_id}/projects/${project_id}`,
      payload,
    ),

  deleteProject: (organization_id: string, project_id: string) =>
    api.delete<ApiResponse<{ success?: boolean }>>(
      `/organizations/${organization_id}/projects/${project_id}`,
    ),

  getProjectStats: (organization_id: string, project_id: string) =>
    api.get<ApiResponse<ProjectStats>>(
      `/organizations/${organization_id}/projects/${project_id}/stats`,
    ),
}
