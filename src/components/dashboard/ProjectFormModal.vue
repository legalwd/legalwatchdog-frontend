<script setup lang="ts">
import { watch, ref } from 'vue'

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrganizationOption {
  id: string
  name: string
}

type Mode = 'create' | 'edit'

const props = defineProps<{
  open: boolean
  mode: Mode
  organizations: OrganizationOption[]
  defaultOrganizationId?: string
  loading?: boolean
  project?: {
    id?: string
    title?: string
    description?: string | null
    org_id?: string
  }
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'save',
    payload: {
      title: string
      description: string | null
      organizationId: string
      projectId?: string
    },
  ): void
}>()

const formState = ref({
  title: '',
  description: '',
  organizationId: '',
})

const localError = ref<string | null>(null)

const resetState = () => {
  formState.value = {
    title: props.project?.title || '',
    description: props.project?.description || '',
    organizationId:
      props.project?.org_id || props.defaultOrganizationId || props.organizations[0]?.id || '',
  }
  localError.value = null
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetState()
    }
  },
)

const handleClose = () => {
  emit('close')
  localError.value = null
}

const handleSubmit = () => {
  if (props.loading) return
  localError.value = null
  if (!formState.value.title.trim()) {
    localError.value = 'Project name is required'
    return
  }

  const description = formState.value.description.trim()

  emit('save', {
    title: formState.value.title.trim(),
    description: description || null,
    organizationId: formState.value.organizationId,
    ...(props.project?.id ? { projectId: props.project.id } : {}),
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && handleClose()">
    <DialogScrollContent class="sm:max-w-135">
      <DialogHeader>
        <DialogTitle>{{ mode === 'edit' ? 'Edit Project' : 'Create New Project' }}</DialogTitle>
        <DialogDescription>
          {{
            mode === 'edit' ? 'Update project details.' : 'Set up a new project to track changes.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="projName" class="text-muted mb-2 block text-sm font-medium">
            Project Name
          </label>
          <input
            id="projName"
            v-model="formState.title"
            placeholder="EU Travel Policy Updates"
            required
            class="focus:border-accent-main focus:ring-accent-main/20 border-border placeholder-muted h-12 w-full rounded-lg border px-4 text-sm text-gray-900 focus:ring-2 focus:outline-none"
          />
          <p class="text-muted mt-1.5 text-xs">Give your project a descriptive name</p>
        </div>

        <div>
          <label for="desc" class="text-muted mb-2 block text-sm font-medium"> Description </label>
          <textarea
            id="desc"
            v-model="formState.description"
            rows="3"
            placeholder="Automated tracking of fee changes, document mandates..."
            class="focus:border-accent-main focus:ring-accent-main/20 border-border placeholder-muted w-full resize-none rounded-lg border px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:outline-none"
          />
        </div>

        <div v-if="localError" class="text-error rounded-lg bg-red-50 p-4 text-sm">
          {{ localError }}
        </div>
        <div v-else-if="error" class="text-error rounded-lg bg-red-50 p-4 text-sm">
          {{ error }}
        </div>

        <DialogFooter class="flex justify-end gap-3 pt-2">
          <button type="button" class="btn--secondary btn--lg" @click="handleClose">Cancel</button>
          <button
            type="submit"
            class="btn--default btn--lg"
            :disabled="loading"
            :aria-busy="loading"
          >
            {{
              loading
                ? mode === 'edit'
                  ? 'Saving...'
                  : 'Creating...'
                : mode === 'edit'
                  ? 'Save Changes'
                  : 'Save Project'
            }}
          </button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
