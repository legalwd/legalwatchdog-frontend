<script setup lang="ts">
import { Loader2, Pencil } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    sizeClass?: string
    frameClass?: string
    initialsClass?: string
    editable?: boolean
    editButtonClass?: string
    editLabel?: string
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    src: '',
    name: '',
    sizeClass: 'h-25 w-25',
    frameClass: ' border-2 border-disabled',
    initialsClass: 'text-[42px] font-semibold text-muted',
    editButtonClass: '',
    editLabel: 'Edit image',
    editable: false,
    disabled: false,
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const initials = computed(() => {
  const name = props.name?.trim() || ''
  if (!name) return ''
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
})

const handleEdit = () => {
  if (props.disabled || props.loading) return
  emit('edit')
}
</script>

<template>
  <div :class="['relative', sizeClass]">
    <div
      :class="[
        'flex h-full w-full items-center justify-center overflow-hidden rounded-full',
        frameClass,
      ]"
    >
      <img
        v-if="src"
        :src="src"
        :alt="name || 'Profile image'"
        class="h-full w-full object-cover"
      />
      <span v-else :class="initialsClass">{{ initials }}</span>
    </div>
    <button
      v-if="editable"
      type="button"
      :aria-label="editLabel"
      :disabled="disabled || loading"
      :class="[
        'btn bg-primary hover:bg-accent text-background absolute -right-0.5 bottom-1 flex h-8 w-8 items-center justify-center rounded-full border border-transparent',
        editButtonClass,
        disabled || loading ? 'cursor-not-allowed opacity-50' : '',
      ]"
      @click="handleEdit"
    >
      <Loader2 v-if="loading" :size="14" class="animate-spin" />
      <Pencil v-else :size="14" />
    </button>
  </div>
</template>
