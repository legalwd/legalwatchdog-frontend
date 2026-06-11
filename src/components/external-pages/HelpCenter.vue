<template>
  <div class="min-h-screen">
    <main class="py-12 md:py-20 lg:py-24">
      <!-- Main Titles -->
      <div class="mb-12 px-4 text-center sm:px-6 lg:mb-16 lg:px-8">
        <h1 class="text-brand-850 mb-3 text-center text-4xl font-extrabold sm:text-5xl">
          Help Center
        </h1>
        <p class="text-center font-medium sm:text-lg">How can we help you today?</p>
      </div>

      <!-- Hero Section (3 Action Cards) -->
      <div class="mx-auto mb-16 px-4 sm:px-6 lg:mb-24 lg:px-8">
        <div class="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          <RouterLink
            to="/contact-us"
            class="bg-background flex flex-col items-center justify-center rounded-xl border p-6 sm:p-8"
          >
            <div class="mb-4 h-10 w-4 sm:h-12 sm:w-5">
              <Icon :icon="Contact01Icon" :size="28" color="black" />
            </div>
            <h3 class="mb-1 text-center text-lg font-semibold sm:text-xl">Contact Support</h3>
          </RouterLink>
          <RouterLink
            to="/blog"
            class="bg-background flex flex-col items-center justify-center rounded-xl border p-6 text-center sm:p-8"
          >
            <div class="mb-4 h-10 w-4 sm:h-12 sm:w-5">
              <Icon :icon="SearchList01Icon" :size="28" color="black" />
            </div>
            <h3 class="mb-3 text-center text-lg font-semibold sm:mb-4 sm:text-xl">
              Search Articles
            </h3>
          </RouterLink>
          <RouterLink
            to="/how-it-works"
            class="bg-background flex flex-col items-center justify-center rounded-xl border p-6 sm:p-8"
          >
            <div class="mb-4 h-10 w-4 sm:h-12 sm:w-5">
              <Icon :icon="UserQuestion01Icon" :size="28" color="black" />
            </div>
            <h3 class="mb-1 text-center text-lg font-semibold sm:text-xl">User Guide</h3>
          </RouterLink>
        </div>
      </div>

      <!-- Need Help Section Title -->
      <div class="mb-12 px-4 text-center sm:px-6 lg:mb-16 lg:px-0">
        <h2 class="mb-3 text-center text-3xl font-extrabold sm:text-4xl md:text-5xl">Need Help?</h2>
        <p class="mx-auto max-w-2xl text-center text-base md:text-lg">
          Get answers, find support, and learn how to make the most of Legal Watchdog.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          <div
            v-for="feature in helpFeatures"
            :key="feature.title"
            class="bg-background flex flex-col items-center rounded-xl border p-6 text-center sm:p-8"
          >
            <div
              class="bg-accent-background mb-4 flex items-center justify-center rounded-full p-4"
            >
              <Icon :icon="feature.icon" :size="24" color="var(--color-primary)" />
            </div>
            <h3 class="mb-2 text-center text-lg font-bold sm:text-xl">
              {{ feature.title }}
            </h3>
            <p class="mb-3 text-center text-xs sm:mb-4 sm:text-sm">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  Airplane01Icon,
  Contact01Icon,
  Loading01Icon,
  MoneyExchange01Icon,
  SearchList01Icon,
  SecurityLockIcon,
  Task02Icon,
  Telescope02Icon,
  UserQuestion01Icon,
} from '@hugeicons/core-free-icons'
import { RouterLink } from 'vue-router'

import Icon from '../reusable/Icon.vue'

const helpFeatures = [
  {
    icon: Airplane01Icon,
    title: 'Getting Started',
    description: 'Set up your account and create your first monitoring project.',
  },
  {
    icon: Telescope02Icon,
    title: 'Monitoring & Alerts',
    description: 'Learn how updates, alerts, and jurisdictions work.',
  },
  {
    icon: Task02Icon,
    title: 'Summaries & Sources',
    description: 'Understand how we verify, summarize, and source updates.',
  },
  {
    icon: MoneyExchange01Icon,
    title: 'Account & Billing',
    description: 'Manage subscriptions, payments, and team access.',
  },
  {
    icon: SecurityLockIcon,
    title: 'Privacy & Security',
    description: 'Your data protection and compliance details.',
  },
  {
    icon: Loading01Icon,
    title: 'Troubleshooting',
    description: 'Fix common issues and report problems quickly.',
  },
]
</script>
