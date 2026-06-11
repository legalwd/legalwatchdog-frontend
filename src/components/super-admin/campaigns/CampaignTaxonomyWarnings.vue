<script setup lang="ts">
defineProps<{
  warnings: string[]
}>()
</script>

<template>
  <section class="border-border bg-background rounded-xl border p-6">
    <h2 class="text-foreground text-lg font-semibold">Warnings</h2>

    <ul v-if="warnings.length" class="mt-4 space-y-2">
      <li
        v-for="warning in warnings"
        :key="warning"
        class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
      >
        {{ warning }}
      </li>
    </ul>

    <p v-else class="mt-4 text-sm text-slate-500">No taxonomy warnings returned.</p>
  </section>
</template>
