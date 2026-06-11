<script setup lang="ts">
import SkeletonBlock from '@/components/reusable/SkeletonBlock.vue'
</script>

<template>
  <div
    class="flex min-h-screen flex-col"
    style="background-color: var(--color-gray-50); color: var(--color-chocolate-brown-850)"
  >
    <main class="flex-1">
      <div class="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-8">
        <section class="space-y-6">
          <SkeletonBlock class="h-10 w-64 rounded-2xl" radius="20px" />
          <div class="space-y-4">
            <SkeletonBlock class="h-6 w-full rounded-xl" radius="16px" />
            <SkeletonBlock class="h-6 w-5/6 rounded-xl" radius="16px" />
            <SkeletonBlock class="h-6 w-2/3 rounded-xl" radius="16px" />
          </div>
          <div class="flex flex-wrap gap-4">
            <SkeletonBlock class="h-12 w-44 rounded-full" />
            <SkeletonBlock class="h-12 w-32 rounded-full" />
          </div>
        </section>

        <section class="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div class="space-y-6">
            <div
              class="bg-background space-y-4 rounded-[28px] p-6 shadow-[0_25px_80px_rgba(60,38,16,0.08)]"
            >
              <SkeletonBlock class="h-48 rounded-2xl" radius="20px" />
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SkeletonBlock class="h-6 w-full rounded-xl" radius="16px" />
                <SkeletonBlock class="h-6 w-5/6 rounded-xl" radius="16px" />
                <SkeletonBlock class="h-6 w-3/4 rounded-xl" radius="16px" />
                <SkeletonBlock class="h-6 w-2/3 rounded-xl" radius="16px" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div
                class="bg-background space-y-4 rounded-3xl p-6 shadow-[0_18px_50px_rgba(60,38,16,0.06)]"
              >
                <SkeletonBlock class="h-28 rounded-2xl" radius="20px" />
                <SkeletonBlock class="h-6 w-3/4 rounded-xl" radius="16px" />
                <SkeletonBlock class="h-6 w-2/3 rounded-xl" radius="16px" />
              </div>
              <div
                class="bg-background space-y-4 rounded-3xl p-6 shadow-[0_18px_50px_rgba(60,38,16,0.06)]"
              >
                <SkeletonBlock class="h-28 rounded-2xl" radius="20px" />
                <SkeletonBlock class="h-6 w-4/5 rounded-xl" radius="16px" />
                <SkeletonBlock class="h-6 w-2/3 rounded-xl" radius="16px" />
              </div>
            </div>
          </div>

          <aside
            class="bg-background space-y-6 rounded-4xl p-6 shadow-[0_25px_80px_rgba(60,38,16,0.08)]"
          >
            <SkeletonBlock class="h-12 w-48 rounded-full" />
            <div class="space-y-4">
              <SkeletonBlock class="h-6 w-5/6 rounded-xl" radius="16px" />
              <SkeletonBlock class="h-6 w-4/5 rounded-xl" radius="16px" />
              <SkeletonBlock class="h-6 w-2/3 rounded-xl" radius="16px" />
            </div>
            <div class="space-y-3">
              <SkeletonBlock class="h-14 w-full rounded-2xl" radius="16px" />
              <SkeletonBlock class="h-14 w-full rounded-2xl" radius="16px" />
            </div>
          </aside>
        </section>
      </div>
    </main>
  </div>
</template>
