<script setup lang="ts">
import {
  CheckmarkBadge01Icon,
  FileStarIcon,
  // PlayIcon,
  TimeManagementIcon,
} from '@hugeicons/core-free-icons'
// import { ref } from 'vue'

import Icon from '@/components/reusable/Icon.vue'
import PillTag from '@/components/reusable/PillTag.vue'
// import { Button } from '@/components/ui/button'

const steps = [
  {
    title: 'Watch',
    description:
      'Legal WatchDog continuously monitors the sources that matter to your business: state regulators, federal agencies, payment portals, and employment law updates, capturing every relevant change so your team never misses a critical alert.',
  },
  {
    title: 'Warn',
    description:
      'Our AI highlights the updates that actually matter, surfacing risks, obligations, and potential impacts before they affect your operations or strategy, giving your team early, actionable insight',
  },
  {
    title: 'Weigh',
    description:
      'Each change is analyzed and mapped to your internal policies, obligations, and controls. Legal WatchDog transforms complex regulatory updates into clear, prioritized guidance so teams can make confident, informed decisions across jurisdictions.',
  },
  {
    title: 'Win',
    description:
      'By combining real-time monitoring, actionable insights, and context-driven guidance, Legal WatchDog empowers your organization to stay ahead, reduce risk, and confidently scale operations across multiple states and regulatory frameworks.',
  },
]

const features = [
  {
    icon: FileStarIcon,
    title: 'AI Powered Summaries',
    description:
      'Get a single, clear view of all your compliance items instantly transformed into simple, actionable insights for your whole organization.',
  },
  {
    icon: TimeManagementIcon,
    title: 'Change Timeline',
    description:
      'Stay ahead of regulatory change with automated, real-time monitoring that replaces manual tracking and highlights only the updates that matter giving your team faster, clearer, and more controlled compliance.',
  },
  {
    icon: CheckmarkBadge01Icon,
    title: 'Source Verification',
    description:
      'Stay confident with real-time updates that link directly to the original source, so you always know what changed, why it matters, and can act without second-guessing.',
  },
]

// const showVideo = ref(false)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <main
      class="app-container relative flex flex-1 flex-col items-center justify-center overflow-hidden py-12 sm:py-16 lg:py-20"
    >
      <!-- Hero Section -->
      <section
        class="app-container relative z-10 mb-16 space-y-8 text-center sm:mb-20 sm:space-y-10 lg:mb-24"
      >
        <PillTag>AI-Powered Regulatory Intelligence</PillTag>

        <div class="space-y-4 sm:space-y-5">
          <h1 class="mx-auto max-w-4xl text-3xl font-extrabold sm:text-5xl md:text-6xl">
            The Complexity of Modern Governance
          </h1>
          <p class="mx-auto max-w-4xl md:text-lg">
            Legal WatchDog cuts through regulatory complexity by tracking changes, identifying
            requirements, and turning them into clear, actionable insights.
          </p>
        </div>

        <!-- Video Button -->
        <!-- <div>
          <Button
            variant="default"
            class="mx-auto flex flex-row items-center justify-center gap-2"
            @click="showVideo = true"
          >
            <Icon :icon="PlayIcon" class="size-4 sm:size-5" /> Watch 2-minute Demo
          </Button>
        </div> -->

        <!-- Video Modal -->
        <!-- <Teleport to="body">
          <div
            v-if="showVideo"
            class="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
            @click="showVideo = false"
          >
            <div class="relative w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl">
              <button
                class="absolute -top-10 right-0 z-10 cursor-pointer text-4xl leading-none font-light text-white transition-colors duration-200 select-none hover:text-gray-300 sm:-top-12 sm:text-5xl"
                @click="showVideo = false"
              >
                ×
              </button>

              <div class="relative overflow-hidden rounded-xl shadow-2xl sm:rounded-2xl">
                <iframe
                  src="https://drive.google.com/file/d/13Tm2Ysa0wwVKmkTOLcZe9c5eMmxJDb1b/preview"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen
                  class="aspect-video w-full border-0"
                  title="Legal Watch Dog - 2 Minute Demo"
                ></iframe>
              </div>
            </div>
          </div>
        </Teleport> -->
      </section>

      <section class="max-w-4xl">
        <div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <article
            v-for="(step, i) in steps"
            :key="i"
            class="bg-background flex w-full flex-row flex-nowrap gap-4 rounded-2xl px-6 py-10 sm:gap-6"
          >
            <span class="text-accent text-3xl">{{ '0' + (i + 1) }}</span>
            <div>
              <h3 class="mb-4 text-3xl font-semibold">{{ step.title }}</h3>
              <p class="leading-relaxed">
                {{ step.description }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section class="py-28">
        <div class="text-center">
          <h2 class="mb-2 text-2xl font-semibold sm:text-3xl lg:text-4xl">Essential Features</h2>
          <p class="text-lg">Intelligent by design. Proven results.</p>
        </div>
        <div class="my-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="(feature, i) in features" :key="i" class="bg-background rounded-2xl p-5">
            <div
              class="bg-accent-background mb-8 flex w-fit items-center justify-center rounded-full p-3"
            >
              <Icon :icon="feature.icon" class="text-primary size-8" />
            </div>
            <h3 class="mb-4 text-2xl font-semibold">{{ feature.title }}</h3>
            <p class="max-w-2xl leading-relaxed">{{ feature.description }}</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
