<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  width?: string
  height?: string
  radius?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  radius: '999px',
})

const styleVars = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.radius,
}))
</script>

<template>
  <div
    v-bind="$attrs"
    class="skeleton-block relative overflow-hidden bg-[#E7DED4]"
    :style="styleVars"
  >
    <div class="shimmer"></div>
  </div>
</template>

<style scoped>
@keyframes shimmerMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-block {
  position: relative;
}

.skeleton-block .shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: shimmerMove 1.6s infinite;
}
</style>
