<template>
  <div class="features-page relative overflow-hidden">
    <!-- Hero Section -->
    <section class="bg-primary py-16 text-center sm:py-20 md:py-28 lg:py-36">
      <div class="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          class="bg-background text-primary mb-4 inline-flex items-center justify-center space-x-2 rounded-full px-3 py-1.5 text-xs font-medium sm:mb-5 sm:px-4 sm:py-2 sm:text-sm"
        >
          <Sparkles alt="Star Icon" class="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Features</span>
        </div>

        <h1
          class="mb-4 text-center text-3xl leading-tight font-extrabold text-white sm:mb-5 sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Everything You Need to Stay Ahead of Critical Changes
        </h1>

        <p class="mx-auto mb-8 text-center text-gray-200 sm:mb-16 md:text-lg lg:text-xl">
          Legal WatchDog gives your team a complete system for tracking important updates,
          understanding their impact, and taking action quickly. It replaces scattered tools, manual
          checks, and inconsistent workflows with a platform built for enterprise operations.
        </p>

        <RouterLink to="/signup" class="btn--contrast btn--lg">Get Started</RouterLink>
      </div>
    </section>

    <!-- Main Features -->
    <section class="app-container bg-gray-50 px-4 py-12 sm:px-6 sm:py-16 lg:pt-20 lg:pb-16">
      <div class="mx-auto max-w-6xl">
        <div class="mx-auto mb-12 flex justify-center text-center sm:mb-16">
          <h2 class="text-2xl font-bold sm:text-3xl md:text-4xl">
            Exploring the <span class="text-accent">Uniqueness</span> of our Product
          </h2>
        </div>

        <div
          v-for="(feat, i) in features"
          :key="i"
          class="mb-16 flex flex-col items-center gap-8 md:mb-20 md:gap-12 lg:mb-24"
          :class="[i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse']"
        >
          <div class="flex-1">
            <h3 class="mb-3 text-center text-xl font-bold sm:text-2xl md:text-left md:text-3xl">
              {{ feat.title }}
            </h3>

            <p class="text-center text-base sm:text-lg md:text-left">
              {{ feat.description }}
            </p>
          </div>

          <div class="relative flex-1">
            <div class="overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6 md:p-8 lg:p-10">
              <img
                :src="feat.image"
                alt="Dashboard"
                loading="lazy"
                decoding="async"
                class="aspect-video w-full rounded-xl object-cover shadow-xl sm:rounded-2xl"
              />
            </div>

            <!-- <img
              :src="feat.imageChild"
              alt="Notification Bell"
              class="absolute right-0 bottom-0 z-10 h-20 w-20 -translate-x-4 -translate-y-4 rounded-xl object-cover sm:h-24 sm:w-24 sm:-translate-x-6 sm:-translate-y-6 md:h-32 md:w-32 lg:h-40 lg:w-40 xl:-translate-x-107.5 xl:-translate-y-6"
            /> -->
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-12 text-center sm:py-16 md:py-20">
      <div class="mx-auto max-w-5xl px-4 sm:px-6">
        <h2
          class="text-primary mb-4 text-center text-2xl leading-tight font-bold sm:mb-5 sm:text-4xl md:text-5xl"
        >
          Turn <span class="text-accent"> Regulatory Changes </span>Into Clear Actions
        </h2>

        <p class="mb-8 text-center text-base sm:mb-10 sm:text-lg md:text-xl">
          Stay informed. Stay compliant. Stay ahead.
        </p>

        <RouterLink to="/signup" class="btn--default btn--lg">Get Started</RouterLink>
      </div>
    </section>

    <div
      class="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-200 w-400 -translate-x-1/2 translate-y-[80%] rounded-[50%]"
      style="
        background: radial-gradient(
          ellipse,
          #f8d9c5 0%,
          rgba(248, 217, 197, 0.5) 40%,
          rgba(247, 247, 247, 0.8) 70%,
          #f7f7f7 100%
        );
      "
    ></div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import feature1 from '@/assets/images/Feature1.webp'
import feature2 from '@/assets/images/Feature2.webp'
import feature3 from '@/assets/images/Feature3.webp'
import feature4 from '@/assets/images/Feature4.webp'
// import featureChild1 from '@/assets/images/Featurechild1.webp'
// import featureChild2 from '@/assets/images/Featurechild2.webp'
// import featureChild3 from '@/assets/images/Featurechild3.webp'
// import featureChild4 from '@/assets/images/Featurechild4.webp'

const features = [
  {
    title: 'Instant Change Alerts',
    description:
      'Receive notifications the moment something updates.Your team stays informed without refreshing pages or relying on guesswork.',
    image: feature1,
  },
  {
    title: 'Customizable Watchlists',
    description:
      'Track only the projects(topics) or jurisdictions matter to you. Your updates, your focus.',
    image: feature2,
  },
  {
    title: 'AI-Powered Insights',
    description:
      'Cut through long pages. The platform identifies what changed and explains it in simple, clear language. Teams understand impact instantly.',
    image: feature3,
  },
  {
    title: 'Team Collaboration Tools',
    description:
      'Assign tasks, leave comments, and review updates together. Everyone stays aligned, and responsibilities are clear.',
    image: feature4,
  },
]
</script>
