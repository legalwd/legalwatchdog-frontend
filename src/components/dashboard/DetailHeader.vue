<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

import { Breadcrumb, BreadcrumbList } from '@/components/ui/breadcrumb'

const props = withDefaults(
  defineProps<{
    backTo?: RouteLocationRaw | null
    backLabel?: string
    breadcrumbClass?: string
  }>(),
  {
    backTo: null,
    backLabel: 'Back',
    breadcrumbClass: '',
  },
)

const breadcrumbClasses = computed(() => {
  const classes = ['text-muted text-sm', props.breadcrumbClass].filter(Boolean)
  return classes.join(' ')
})
</script>

<template>
  <header class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          v-if="backTo"
          :to="backTo"
          class="single-project-back-button"
          :aria-label="backLabel"
        >
          <ArrowLeft :size="16" />
        </RouterLink>

        <Breadcrumb :class="breadcrumbClasses">
          <BreadcrumbList>
            <slot />
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>

    <slot name="detail" />
  </header>
</template>
