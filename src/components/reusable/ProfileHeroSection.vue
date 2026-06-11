<script setup lang="ts">
import ProfileImage from '@/components/reusable/ProfileImage.vue'

withDefaults(
  defineProps<{
    loading?: boolean
    imageSrc?: string
    imageName?: string
    editable?: boolean
    imageLoading?: boolean
    imageDisabled?: boolean
    sizeClass?: string
    frameClass?: string
    initialsClass?: string
    editButtonClass?: string
    containerClass?: string
    contentClass?: string
    skeletonSizeClass?: string
  }>(),
  {
    loading: false,
    imageSrc: '',
    imageName: '',
    editable: false,
    imageLoading: false,
    imageDisabled: false,
    sizeClass: 'h-24 w-24',
    frameClass: 'border border-border bg-background',
    initialsClass: 'text-2xl font-semibold text-muted',
    editButtonClass: '',
    containerClass: 'rounded-sm bg-muted-background p-5',
    contentClass: 'flex flex-col gap-1',
    skeletonSizeClass: 'h-24 w-24',
  },
)

const emit = defineEmits<{
  (e: 'edit'): void
}>()
</script>

<template>
  <section :class="containerClass">
    <div v-if="loading" class="flex flex-col items-center gap-4 text-center">
      <div
        :class="[
          'border-border bg-background animate-pulse rounded-full border',
          skeletonSizeClass,
        ]"
      ></div>
      <div class="flex flex-col items-center gap-2">
        <div class="bg-background h-4 w-40 animate-pulse rounded"></div>
        <div class="bg-background h-3 w-28 animate-pulse rounded"></div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center gap-4 text-center">
      <ProfileImage
        :src="imageSrc"
        :name="imageName"
        :editable="editable"
        :loading="imageLoading"
        :disabled="imageDisabled"
        :size-class="sizeClass"
        :frame-class="frameClass"
        :initials-class="initialsClass"
        :edit-button-class="editButtonClass"
        @edit="emit('edit')"
      />
      <div :class="contentClass">
        <slot />
      </div>
    </div>
  </section>
</template>
