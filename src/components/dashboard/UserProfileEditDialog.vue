<script setup lang="ts">
import ProfileImage from '@/components/reusable/ProfileImage.vue'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    name: string
    email: string
    role?: string
    avatarUrl?: string
    loadingImage?: boolean
    saving?: boolean
    showFooter?: boolean
    showImageEdit?: boolean
    showRole?: boolean
    disableName?: boolean
    disableEmail?: boolean
    disableRole?: boolean
    saveLabel?: string
  }>(),
  {
    title: 'Edit Profile',
    role: '',
    avatarUrl: '',
    loadingImage: false,
    saving: false,
    showFooter: true,
    showImageEdit: true,
    showRole: true,
    disableName: false,
    disableEmail: true,
    disableRole: true,
    saveLabel: 'Save',
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:name', value: string | number): void
  (e: 'save' | 'cancel' | 'edit-image'): void
}>()

const handleClose = () => {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="sm:max-w-xl">
      <DialogHeader class="mb-6">
        <DialogTitle class="text-2xl font-semibold text-[#0F172A]">{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="mb-6 flex justify-center">
        <ProfileImage
          :src="avatarUrl"
          :name="name"
          size-class="h-24 w-24"
          frame-class="bg-linear-to-br from-[var(--color-peach-amber-400)] to-[var(--color-peach-amber-600)] text-white shadow-md border-transparent"
          initials-class="text-2xl font-bold text-white"
          edit-button-class="h-8 w-8 bg-accent border-transparent right-0 bottom-0"
          :loading="loadingImage"
          :disabled="loadingImage"
          :editable="showImageEdit"
          @edit="emit('edit-image')"
        />
      </div>

      <form class="space-y-5" @submit.prevent="emit('save')">
        <div class="space-y-3">
          <label class="text-sm font-semibold text-[#0F172A]" for="profile-name">Name</label>
          <Input
            id="profile-name"
            :model-value="name"
            :disabled="disableName"
            placeholder="Your full name"
            class="mt-1.5 h-12 rounded-md border-[#E5E7EB] text-sm text-[#111827]"
            @update:model-value="emit('update:name', $event)"
          />
        </div>
        <div v-if="showRole" class="space-y-3">
          <label class="text-sm font-semibold text-[#0F172A]" for="role">Role</label>
          <Select :model-value="role" :disabled="disableRole">
            <SelectTrigger
              class="focus:border-accent-main h-12 w-full rounded-md border-[#D5D7DA] text-sm"
            >
              <SelectValue :placeholder="role || 'Role'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-if="role" :value="role">{{ role }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-3">
          <label class="text-sm font-semibold text-[#0F172A]" for="profile-email"
            >Email Address</label
          >
          <Input
            id="profile-email"
            :model-value="email"
            type="email"
            :disabled="disableEmail"
            readonly
            placeholder="you@example.com"
            class="border-input focus-visible:border-input mt-1.5 h-12 cursor-not-allowed rounded-md text-sm text-[#111827] outline-none focus-visible:ring-0"
          />
        </div>
        <DialogFooter v-if="showFooter" class="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            class="border-accent-main text-accent-main hover:bg-accent-main cursor-pointer rounded-md border px-12 py-4 text-sm font-semibold hover:text-white"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-accent-main cursor-pointer rounded-md px-12 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#2f1202]"
            :disabled="saving"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>{{ saveLabel }}</span>
          </button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
