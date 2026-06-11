<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import type { Jurisdiction } from '@/api/jurisdiction'
import ProjectInstructionDialog from '@/components/composables/project/ProjectInstructionDialog.vue'
import DetailHeader from '@/components/dashboard/DetailHeader.vue'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useJurisdictionStore } from '@/stores/jurisdiction-store'

const props = withDefaults(
  defineProps<{
    jurisdiction: Jurisdiction | null
    projectName: string
    activeOrganizationId: string
    parentJurisdiction: Jurisdiction | null
    isLoading?: boolean
    hideInstructionButton?: boolean
  }>(),
  {
    isLoading: false,
    hideInstructionButton: false,
  },
)

const emit = defineEmits<{
  (e: 'update:jurisdiction', value: Jurisdiction): void
}>()

const router = useRouter()
const { confirm: openConfirm } = useConfirmDialog()
const jurisdictionStore = useJurisdictionStore()

const hasOrganization = computed(() => Boolean(props.activeOrganizationId))

const backTo = computed(() => {
  if (!hasOrganization.value) {
    return null
  }
  if (props.jurisdiction?.project_id) {
    return {
      name: 'project-detail',
      params: { organizationId: props.activeOrganizationId, id: props.jurisdiction.project_id },
    }
  }

  return {
    name: 'organization-projects',
    params: { organizationId: props.activeOrganizationId },
  }
})

const jurisdictionInstruction = ref('')
const originalJurisdictionInstruction = ref('')
const instructionSaving = ref(false)
const instructionModalOpen = ref(false)
const showInlineEdit = ref(false)
const editSaving = ref(false)
const editForm = ref({ name: '', description: '' })

const isInstructionValid = computed(() => jurisdictionInstruction.value.trim().length > 0)
const isInstructionDirty = computed(
  () => jurisdictionInstruction.value.trim() !== originalJurisdictionInstruction.value.trim(),
)
const instructionActionLabel = computed(() =>
  jurisdictionInstruction.value.trim() ? 'Edit Instruction' : 'Add Instruction',
)
const instructionPlaceholder = computed(() =>
  jurisdictionInstruction.value.trim()
    ? 'Describe the monitoring focus, keywords, and context that apply to this jurisdiction.'
    : 'No instruction set. Add guidance for this jurisdiction.',
)

const openInstructionModal = () => {
  if (!props.jurisdiction?.id) return
  instructionModalOpen.value = true
}

const closeInstructionModal = () => {
  instructionModalOpen.value = false
}

watch(
  () => props.jurisdiction,
  (val) => {
    const incoming = val?.prompt || ''
    jurisdictionInstruction.value = incoming
    originalJurisdictionInstruction.value = incoming
  },
  { immediate: true },
)

const saveJurisdictionInstruction = async () => {
  if (!props.jurisdiction?.id) return
  if (!isInstructionValid.value) {
    toast.error('Jurisdiction instruction is required')
    return
  }

  instructionSaving.value = true
  try {
    const updated = await jurisdictionStore.updateJurisdiction(
      props.jurisdiction.id,
      { prompt: jurisdictionInstruction.value.trim() || null },
      props.activeOrganizationId,
    )

    if (updated) {
      emit('update:jurisdiction', updated)
      toast.success('Jurisdiction instruction updated')
      const saved = jurisdictionInstruction.value.trim()
      originalJurisdictionInstruction.value = saved
      jurisdictionInstruction.value = saved
      instructionModalOpen.value = false
    }
  } catch (err) {
    console.error(err)
    toast.error(jurisdictionStore.error || 'Failed to update jurisdiction instruction')
  } finally {
    instructionSaving.value = false
  }
}

const startEdit = () => {
  if (!props.jurisdiction?.id) return
  editForm.value = {
    name: props.jurisdiction?.name ?? '',
    description: props.jurisdiction?.description ?? '',
  }
  showInlineEdit.value = true
}

const saveEdit = async () => {
  if (editSaving.value || !props.jurisdiction?.id) return
  editSaving.value = true
  const payload = {
    name: editForm.value.name,
    description: editForm.value.description,
  }

  try {
    const updated = await jurisdictionStore.updateJurisdiction(
      props.jurisdiction.id,
      payload,
      props.activeOrganizationId,
    )

    if (updated) {
      emit('update:jurisdiction', updated)
      toast.success('Jurisdiction updated')
      showInlineEdit.value = false
    } else if (jurisdictionStore.error) {
      toast.error(jurisdictionStore.error)
    }
  } catch (error) {
    const msg = jurisdictionStore.error || 'Failed to update jurisdiction'
    toast.error(msg)
    void error
  } finally {
    editSaving.value = false
  }
}

const deleteJurisdiction = async () => {
  if (!props.jurisdiction?.id) return
  openConfirm({
    title: 'Delete Jurisdiction?',
    description: `Are you sure you want to delete "${props.jurisdiction?.name}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    async onConfirm() {
      if (props.jurisdiction) {
        await jurisdictionStore.deleteJurisdiction(props.jurisdiction.id)
        toast.success('Jurisdiction deleted')
        if (props.jurisdiction?.project_id) {
          router.push({
            name: 'project-detail',
            params: {
              organizationId: props.activeOrganizationId,
              id: props.jurisdiction.project_id,
            },
          })
        } else {
          router.push({
            name: 'organization-projects',
            params: { organizationId: props.activeOrganizationId },
          })
        }
      }
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <DetailHeader :back-to="backTo" back-label="Back to project">
      <BreadcrumbItem>
        <template v-if="isLoading">
          <span class="skeleton-line inline-block h-4 w-20"></span>
        </template>
        <BreadcrumbLink v-else-if="hasOrganization" as-child>
          <RouterLink
            :to="{
              name: 'organization-projects',
              params: { organizationId: activeOrganizationId },
            }"
          >
            Projects
          </RouterLink>
        </BreadcrumbLink>
        <BreadcrumbPage v-else class="text-foreground">Projects</BreadcrumbPage>
      </BreadcrumbItem>

      <BreadcrumbSeparator />

      <BreadcrumbItem v-if="isLoading || (jurisdiction?.project_id && projectName)">
        <template v-if="isLoading">
          <span class="skeleton-line inline-block h-4 w-24"></span>
        </template>
        <BreadcrumbLink v-else-if="hasOrganization" as-child>
          <RouterLink
            :to="{
              name: 'project-detail',
              params: {
                organizationId: activeOrganizationId,
                id: jurisdiction?.project_id || '',
              },
            }"
          >
            {{ projectName }}
          </RouterLink>
        </BreadcrumbLink>
        <BreadcrumbPage v-else class="text-foreground">{{ projectName }}</BreadcrumbPage>
      </BreadcrumbItem>

      <BreadcrumbSeparator v-if="isLoading || (jurisdiction?.project_id && projectName)" />

      <template v-if="isLoading || parentJurisdiction">
        <BreadcrumbItem>
          <template v-if="isLoading">
            <span class="skeleton-line inline-block h-4 w-24"></span>
          </template>
          <BreadcrumbLink v-else as-child>
            <RouterLink :to="`/app/jurisdictions/${parentJurisdiction?.id || ''}`">
              {{ parentJurisdiction?.name }}
            </RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
      </template>

      <BreadcrumbItem>
        <template v-if="isLoading">
          <span class="skeleton-line inline-block h-4 w-24"></span>
        </template>
        <BreadcrumbPage v-else class="text-foreground">
          {{ jurisdiction?.name || 'Jurisdiction' }}
        </BreadcrumbPage>
      </BreadcrumbItem>

      <template #detail>
        <section class="single-project-card sm:p-8">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-2">
              <div v-if="isLoading" class="space-y-2">
                <div class="skeleton-line h-7 w-48"></div>
                <div class="skeleton-line h-4 w-72"></div>
              </div>
              <template v-else>
                <h1 class="text-foreground text-2xl font-semibold sm:text-3xl">
                  {{ jurisdiction?.name || 'Jurisdiction' }}
                </h1>
                <p class="text-muted text-sm">
                  {{ jurisdiction?.description || 'Monitor changes to this jurisdiction.' }}
                </p>
              </template>
            </div>

            <div class="flex items-center gap-3">
              <div v-if="isLoading" class="flex items-center gap-3">
                <div class="skeleton-line h-9 w-28 rounded-sm"></div>
                <div class="skeleton-line h-10 w-10 rounded-lg"></div>
              </div>
              <template v-else>
                <button
                  v-if="!hideInstructionButton"
                  class="btn--secondary btn--sm sm:btn--md"
                  type="button"
                  @click="openInstructionModal"
                >
                  {{ instructionActionLabel }}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button class="single-project-icon-button" aria-label="Jurisdiction settings">
                      <Settings :size="18" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-48">
                    <DropdownMenuItem @click="startEdit">Edit Jurisdiction</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" @click="deleteJurisdiction">
                      Delete Jurisdiction
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </template>
            </div>
          </div>
        </section>
      </template>
    </DetailHeader>

    <ProjectInstructionDialog
      :open="instructionModalOpen"
      :instruction="jurisdictionInstruction"
      :placeholder="instructionPlaceholder"
      :saving="instructionSaving"
      :can-save="isInstructionValid && isInstructionDirty"
      @update:open="instructionModalOpen = $event"
      @update:instruction="jurisdictionInstruction = $event"
      @save="saveJurisdictionInstruction"
      @cancel="closeInstructionModal"
    />

    <Dialog :open="showInlineEdit" @update:open="(value) => (showInlineEdit = value)">
      <DialogScrollContent class="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Edit Jurisdiction</DialogTitle>
          <DialogDescription>Update the name and description.</DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveEdit">
          <div>
            <label class="text-fg mb-2 block text-sm font-medium">Name</label>
            <input
              v-model="editForm.name"
              class="focus:border-primary focus:ring-primary/20 h-12 w-full rounded-lg border px-4 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <label class="text-fg mb-2 block text-sm font-medium">Description</label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <DialogFooter class="flex justify-end gap-3 pt-2">
            <button type="button" class="btn--secondary btn--lg" @click="showInlineEdit = false">
              Cancel
            </button>
            <button
              type="submit"
              class="btn--default btn--lg"
              :disabled="editSaving"
              :aria-busy="editSaving"
            >
              {{ editSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </DialogFooter>
        </form>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
