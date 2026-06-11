<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { reactive } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const navigation = [{ id: 'buttons', label: 'Buttons', hint: 'Variants & states' }]

const buttonVariants = [
  { label: 'Primary', variant: 'primary' as const },
  { label: 'Secondary', variant: 'secondary' as const },
  { label: 'Link', variant: 'link' as const },
]

const buttonState = reactive({
  loading: false,
  disabled: false,
})
</script>

<template>
  <div
    class="min-h-screen text-gray-900"
    style="
      background: linear-gradient(
        to bottom right,
        var(--color-peach-amber-50),
        white,
        var(--color-gray-50)
      );
    "
  >
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr] lg:px-8">
      <aside class="lg:sticky lg:top-8">
        <div
          class="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase"
        >
          <Sparkles class="text-primary h-4 w-4" />
          Workbench
        </div>

        <div class="bg-background rounded-2xl border p-4 shadow-sm">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-medium tracking-[0.18em] text-gray-500 uppercase">
                Component Catalogue
              </p>
              <p class="mt-2 text-lg font-semibold text-gray-900">Live preview surface</p>
              <p class="mt-1 text-sm">
                Spot-check design tokens and states while you iterate on components.
              </p>
            </div>
            <Badge variant="secondary" class="shrink-0">Live</Badge>
          </div>

          <Separator class="my-4" />

          <nav class="flex flex-col gap-2 text-sm">
            <a
              v-for="item in navigation"
              :key="item.id"
              :href="`#${item.id}`"
              class="group flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
            >
              <span class="group-hover:text-primary font-semibold text-gray-800">
                {{ item.label }}
              </span>
              <span class="text-xs text-gray-500">{{ item.hint }}</span>
            </a>
          </nav>
        </div>
      </aside>

      <main class="space-y-12 pb-12">
        <section id="buttons" class="scroll-mt-20 space-y-4">
          <div class="flex items-center gap-3">
            <Badge variant="outline" class="tracking-[0.18em] uppercase">Buttons</Badge>
            <h2 class="text-2xl font-semibold">Action primitives</h2>
            <p class="text-sm">Variants, sizes, and pressed states.</p>
          </div>

          <div class="bg-background space-y-6 rounded-2xl border p-6 shadow-sm">
            <div class="flex flex-wrap gap-4 text-sm text-gray-700">
              <label class="flex items-center gap-2">
                <Checkbox v-model="buttonState.loading" />
                Loading
              </label>
              <label class="flex items-center gap-2">
                <Checkbox v-model="buttonState.disabled" />
                Disabled
              </label>
            </div>

            <Separator />

            <div>
              <div class="mb-2 flex items-center justify-between">
                <p class="text-sm font-medium text-gray-800">Variants</p>
                <span class="text-xs text-gray-500">Driven by <code>buttonVariants</code></span>
              </div>
              <div class="flex flex-wrap gap-3">
                <Button
                  v-for="item in buttonVariants"
                  :key="item.variant"
                  :variant="item.variant"
                  :loading="buttonState.loading"
                  :disabled="buttonState.disabled"
                  class="min-w-27.5"
                >
                  {{ item.label }}
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <p class="mb-3 text-sm font-medium text-gray-800">Sizes</p>
              <div class="flex flex-wrap items-center gap-3">
                <Button size="sm" :loading="buttonState.loading" :disabled="buttonState.disabled">
                  Small
                </Button>
                <Button size="md" :loading="buttonState.loading" :disabled="buttonState.disabled">
                  Medium
                </Button>
                <Button size="lg" :loading="buttonState.loading" :disabled="buttonState.disabled">
                  Large
                </Button>
                <Button size="xl" :loading="buttonState.loading" :disabled="buttonState.disabled">
                  X-Large
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
