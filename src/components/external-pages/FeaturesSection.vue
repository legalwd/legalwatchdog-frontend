<script setup lang="ts">
import Rectangle from '@/assets/images/Rectangle.webp'
import SearchSource from '@/assets/images/SearchSource.webp'
import Timeline from '@/assets/images/Timeline.webp'

const features = [
  {
    title: 'AI Powered Summaries',
    description: 'Turn Complex jargon into plain English summaries you can act on immediately',
    image: Rectangle,
  },
  {
    title: 'Change Timeline',
    description:
      'Visually track historical changes to understand the evolution or that document or policy.',
    image: SearchSource,
  },
  {
    title: 'Source Verification',
    description:
      'Get real time notifications with direct links to the source of any change or full transparency.',
    image: Timeline,
  },
]
</script>

<template>
  <section class="app-container relative w-full px-4 py-20 sm:px-6 sm:py-16 lg:py-28">
    <div class="mx-auto">
      <!-- Section Header -->
      <div class="mb-8 text-center sm:mb-12 lg:mb-16">
        <h2 class="mb-3 text-2xl font-semibold sm:mb-4 sm:text-3xl lg:text-4xl">
          Powerful <span class="text-accent">Features</span> to <br class="hidden sm:inline" />
          Keep You Informed
        </h2>
        <p
          class="mx-auto max-w-full leading-relaxed font-semibold sm:max-w-150 lg:max-w-175 lg:text-lg"
        >
          Our platform is designed to provide clarity and save you time, ensuring you're always
          ahead of regulatory changes
        </p>
      </div>

      <!-- Features Cards -->
      <div class="text-foreground flex flex-col gap-24">
        <div
          v-for="(feat, i) in features"
          :key="i"
          class="bg-peach-amber-100 relative flex min-h-80 flex-col gap-12 overflow-hidden rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:min-h-85 sm:gap-0 sm:rounded-3xl sm:p-0 lg:min-h-95 lg:rounded-4xl"
          :class="[i % 2 !== 0 ? 'sm:flex-row-reverse' : 'sm:flex-row']"
        >
          <div
            class="relative z-10 mt-4 flex flex-col items-center text-center sm:mt-0 sm:max-w-[52%] sm:flex-1 md:text-start"
            :class="[i % 2 !== 0 ? 'sm:-top-10 sm:justify-center' : 'sm:-top-20 sm:justify-end']"
          >
            <div>
              <h3 class="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl">
                {{ feat.title }}
              </h3>
              <p
                class="text-foreground max-w-full text-sm leading-relaxed font-medium sm:max-w-sm sm:text-base"
              >
                {{ feat.description }}
              </p>
            </div>
          </div>

          <div
            class="bg-background relative overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] sm:top-16 sm:basis-1/2 sm:p-5 lg:rounded-[20px]"
          >
            <img
              :src="feat.image"
              alt="AI Brain illustration"
              loading="lazy"
              decoding="async"
              class="h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
