<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProjectStore } from '@/stores/project-store'

const projectStore = useProjectStore()
const { projects, loading, error } = storeToRefs(projectStore)
const router = useRouter()

const showCreateModal = ref(false)
const formData = ref({
  title: '',
  description: '',
})

const openCreateModal = () => {
  showCreateModal.value = true
  formData.value = { title: '', description: '' }
  projectStore.setError(null)
}

const closeCreateModal = () => {
  showCreateModal.value = false
  formData.value = { title: '', description: '' }
  projectStore.setError(null)
}

const handleCreateModalToggle = (value: boolean) => {
  if (!value) closeCreateModal()
}

const handleCreateProject = async () => {
  projectStore.setError(null)

  if (!formData.value.title.trim()) return projectStore.setError('Project name is required')

  projectStore.setError(
    'Projects are scoped to organizations. Please create one from an organization.',
  )
}

const goToProject = (id: string) => {
  void id
  router.push({ name: 'organizations' })
}
</script>

<template>
  <main class="min-h-screen flex-1 bg-gray-50 p-6 lg:p-10">
    <!-- Empty State -->
    <div
      v-if="!loading && projects.length === 0 && !error"
      class="mx-auto max-w-4xl py-16 text-center lg:py-24"
    >
      <h1 class="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">No Project Created</h1>
      <p class="mx-auto mb-12 max-w-2xl text-lg leading-relaxed">
        Create a project to start tracking changes on any website.<br class="hidden sm:block" />
        Our AI will monitor the sites and send you summarized updates automatically.
      </p>
      <button
        class="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all"
        style="background-color: var(--color-accent-main)"
        @click="openCreateModal"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 4V16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 10H16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Create Project
      </button>
    </div>

    <!-- Projects View (when there are projects) -->
    <div v-else class="mx-auto max-w-7xl">
      <div
        class="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900 lg:text-4xl">My Projects</h1>
        <button
          class="flex items-center gap-3 rounded-full px-8 py-4 font-medium text-white shadow-md transition-all"
          style="background-color: var(--color-accent-main)"
          @click="openCreateModal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4V16"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 10H16"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Create Project
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="bg-background animate-pulse rounded-2xl p-8 shadow-sm">
          <div class="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
          <div class="space-y-2">
            <div class="h-4 w-full rounded bg-gray-200"></div>
            <div class="h-4 w-5/6 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-12 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button
          class="mt-4 underline"
          style="color: var(--color-accent-main)"
          @click="router.push({ name: 'organizations' })"
        >
          Go to Organizations
        </button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="project in projects"
          :key="project.id"
          class="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 transition-all duration-300 hover:shadow-lg"
          @click="goToProject(project.id)"
        >
          <div class="p-8">
            <h3 class="mb-3 text-xl font-bold text-gray-900 transition-colors">
              {{ project.title }}
            </h3>
            <p class="line-clamp-3 text-sm leading-relaxed">
              {{ project.description || 'No description provided' }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <Dialog :open="showCreateModal" @update:open="handleCreateModalToggle">
      <DialogScrollContent class="sm:max-w-160">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription> Set up a new project to track regulatory changes </DialogDescription>
        </DialogHeader>

        <form class="space-y-6" @submit.prevent="handleCreateProject">
          <div>
            <h4 class="mb-3 text-sm font-medium text-[#121110]">Project information</h4>

            <div class="relative">
              <input
                id="projName"
                v-model="formData.title"
                placeholder="e.g Global Visa Monitoring"
                required
                class="peer focus:border-accent-main focus:ring-accent-main/20 h-13 w-full rounded-lg border px-4 pt-5 pb-3 text-sm text-gray-900 focus:ring-2 focus:outline-none"
                style="border-color: #d5d7da"
              />
              <label
                for="projName"
                class="peer-focus:text-accent-main bg-background pointer-events-none absolute top-2.5 left-3 origin-left -translate-y-6 scale-75 transform px-1 text-xs font-medium text-[#1F1F1F] transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#717680] peer-focus:top-2.5 peer-focus:-translate-y-6 peer-focus:scale-75"
              >
                Project Name
              </label>
            </div>
            <p class="mt-1.5 pl-1 text-xs text-[#717680]">Give your project a descriptive name</p>

            <div class="relative mt-6">
              <textarea
                id="desc"
                v-model="formData.description"
                rows="4"
                placeholder="What regulatory areas will you monitor?"
                class="peer focus:border-accent-main focus:ring-accent-main/20 w-full resize-none rounded-lg border border-[#D5D7DA] px-4 pt-5 pb-3 text-sm text-gray-900 placeholder-[#717680] focus:ring-2 focus:outline-none"
              />
              <label
                for="desc"
                class="peer-focus:text-accent-main bg-background pointer-events-none absolute -top-2.5 left-3 px-1 text-xs font-medium text-[#1F1F1F] transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[#717680] peer-focus:-top-2.5 peer-focus:scale-75"
              >
                Description
              </label>
            </div>
          </div>

          <div v-if="error" class="text-error rounded-lg bg-red-50 p-4 text-sm">
            {{ error }}
          </div>

          <DialogFooter class="flex justify-end gap-3 pt-2">
            <button type="button" class="btn--secondary btn--lg" @click="closeCreateModal">
              Cancel
            </button>
            <button type="submit" class="btn--default btn--lg">Save Project</button>
          </DialogFooter>
        </form>
      </DialogScrollContent>
    </Dialog>
  </main>
</template>
