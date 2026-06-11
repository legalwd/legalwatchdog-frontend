<script setup lang="ts">
import { computed } from 'vue'

import type { Project } from '@/types/project'

import ProjectCard from './ProjectCard.vue'

type ChangeSeverity = 'none' | 'minor' | 'major'

interface Props {
  projects?: Project[]
  loading?: boolean
  changeItemsByProjectId?: Record<string, string[]>
  changeCountByProjectId?: Record<string, number>
  changeSeverityByProjectId?: Record<string, ChangeSeverity>
  lastChangeLabelByProjectId?: Record<string, string>
  expandedProjectIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  loading: false,
  changeItemsByProjectId: () => ({}),
  changeCountByProjectId: () => ({}),
  changeSeverityByProjectId: () => ({}),
  lastChangeLabelByProjectId: () => ({}),
  expandedProjectIds: () => [],
})

const emit = defineEmits<{
  'project-click': [project: Project]
  'project-menu-click': [project: Project]
}>()

const resolveStats = (project?: Project) => {
  return {
    jurisdictionCount: project?.jurisdictions_count ?? project?.jurisdiction_count ?? 0,
    sourceCount: project?.sources_count ?? project?.source_count ?? 0,
    revisionCount: project?.revisions_count ?? project?.revision_count ?? 0,
  }
}

const resolveChangeSeverity = (count: number) => {
  if (count === 0) return 'none'
  return count >= 3 ? 'major' : 'minor'
}

const resolveChangeItems = (project?: Project) => {
  if (!project) return []
  return props.changeItemsByProjectId[project.id] ?? []
}

const resolveChangeCount = (project?: Project) => {
  if (!project) return 0
  return props.changeCountByProjectId[project.id] ?? resolveStats(project).revisionCount
}

const resolveChangeSeverityForProject = (project?: Project) => {
  if (!project) return 'none'
  return (
    props.changeSeverityByProjectId[project.id] ??
    resolveChangeSeverity(resolveChangeCount(project))
  )
}

const resolveLastChangeLabel = (project?: Project) => {
  if (!project) return ''
  return props.lastChangeLabelByProjectId[project.id] ?? 'Not available'
}

const resolveExpandedState = (project?: Project) => {
  if (!project) return false
  return props.expandedProjectIds.includes(project.id)
}

const filteredProjects = computed(() => {
  return [...props.projects].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )
})
</script>

<template>
  <div>
    <div
      v-if="loading || filteredProjects.length > 0"
      class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      <ProjectCard
        v-for="(project, index) in loading ? Array(6).fill(null) : filteredProjects"
        :key="loading ? `skeleton-${index}` : project?.id"
        :project="loading ? undefined : project"
        :revision-count="resolveStats(project || undefined).revisionCount"
        :change-count="resolveChangeCount(project || undefined)"
        :change-severity="resolveChangeSeverityForProject(project || undefined)"
        :change-items="resolveChangeItems(project || undefined)"
        :last-change-label="resolveLastChangeLabel(project || undefined)"
        :show-change-details="resolveExpandedState(project || undefined)"
        :is-loading="loading"
        @click="!loading && emit('project-click', project!)"
        @menu-click="!loading && emit('project-menu-click', project!)"
      />
    </div>

    <div v-else class="px-4 py-12 text-center">
      <div class="mx-auto max-w-md space-y-3">
        <div class="bg-muted/50 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <span class="text-muted-foreground text-lg">No projects yet</span>
        </div>
        <h3 class="text-foreground text-lg font-semibold">No projects found</h3>
        <p class="text-muted-foreground">
          Create a project to start tracking changes on any website.
        </p>
        <p>Our AI will monitor the sites and send you summarized updates automatically.</p>
      </div>
    </div>
  </div>
</template>
