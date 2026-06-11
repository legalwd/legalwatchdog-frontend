<script setup lang="ts">
import { CellularNetworkIcon, ComputerIcon, Notification01Icon } from '@hugeicons/core-free-icons'

import Icon from '../reusable/Icon.vue'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

const cards = [
  {
    title: 'Monitor',
    icon: ComputerIcon,
    description:
      'Tell us which websites to track. From government portals to internal policy pages',
  },
  {
    title: 'Analyze',
    icon: CellularNetworkIcon,
    description:
      'Our AI detects changes, analyzes the content and generates clear concise summaries',
  },
  {
    title: 'Notify',
    icon: Notification01Icon,
    description: 'Receive instant alerts via email or slack the moment a critical change occur.',
  },
]
</script>

<template>
  <section
    id="how-it-works"
    class="app-container relative flex items-center justify-center py-12 sm:py-16 lg:py-20"
  >
    <div class="flex w-full flex-col gap-8 sm:gap-10 lg:gap-11">
      <!-- Header Section -->
      <div class="mx-auto flex w-full flex-col items-center gap-2 px-4 text-center sm:px-6">
        <h2 class="text-2xl leading-16 font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          How <span class="text-accent">Legal WatchDog</span> Works
        </h2>
        <p class="max-w-full font-semibold sm:max-w-xl lg:max-w-2xl lg:text-lg">
          Discover how Legal WatchDog continuously monitors sources, detects changes, and delivers
          reliable, AI-summarized updates in just a few steps.
        </p>
      </div>

      <!-- Cards Grid -->
      <div
        class="mx-auto flex w-full flex-col items-stretch gap-4 px-4 sm:gap-5 sm:px-6 md:flex-row md:flex-wrap lg:flex-nowrap"
      >
        <Card
          v-for="(card, i) in cards"
          :key="i"
          class="flex-1 gap-2.5 rounded-2xl px-5 py-6 text-left sm:px-6 sm:py-8 md:max-w-95 md:min-w-70 md:basis-[calc(50%-0.625rem)] lg:max-w-none lg:basis-0 lg:px-8 lg:py-10"
        >
          <CardHeader class="gap-4 p-0">
            <!-- Icon -->
            <div
              class="bg-accent-background flex w-fit items-center justify-center rounded-full p-3"
            >
              <Icon :icon="card.icon" :size="20" color="var(--color-primary)" />
            </div>
            <!-- Title -->
            <CardTitle class="text-xl font-semibold sm:text-2xl">
              {{ card.title }}
            </CardTitle>
          </CardHeader>
          <!-- Description -->
          <CardDescription class="text-base">
            {{ card.description }}
          </CardDescription>
        </Card>
      </div>
    </div>
  </section>
</template>
