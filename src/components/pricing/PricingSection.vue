<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

import { useBillingStore } from '@/stores/billing-store'
import type { BillingPlan } from '@/types/billing'

import PricingCard from './PricingCard.vue'

const activeBillingCycle = ref<'month' | 'year'>('month')
const billingStore = useBillingStore()
const plans = ref<BillingPlan[] | null>(null)

onMounted(async () => {
  const res = await billingStore.fetchPlans()

  if (res) {
    plans.value = res
  }

  if (billingStore.error) {
    toast.error(billingStore.error)
  }
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Content -->
    <main
      class="app-container relative z-10 flex flex-1 flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12"
    >
      <!-- Hero Section -->
      <section class="mb-8 max-w-3xl sm:mb-10 lg:mb-12">
        <h1 class="text-primary mb-3 text-3xl font-bold sm:mb-4 sm:text-5xl md:text-6xl">
          Choose The Plan That Fits Your Team.
        </h1>
        <p class="sm:text-lg">
          Upgrade to unlock continuous monitoring, AI summaries, and team-wide compliance insights.
        </p>
      </section>

      <template v-if="billingStore.loading">
        <div
          class="bg-background ring-border mx-auto mb-16 flex w-fit animate-pulse items-center justify-center gap-2 rounded-md p-1 ring-1 *:rounded-md *:p-3"
        >
          <div class="h-10 w-24 rounded-md bg-gray-200"></div>
          <div class="h-10 w-24 rounded-md bg-gray-200"></div>
        </div>

        <div
          class="flex w-full flex-col justify-start gap-x-6 gap-y-12 text-start md:flex-row md:flex-wrap md:justify-center xl:flex-nowrap xl:items-center"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="flex h-125 w-full animate-pulse flex-col rounded-lg border border-gray-200 p-6 shadow-sm md:w-[calc(50%-12px)] xl:w-96"
          >
            <div class="mb-4 h-full w-full rounded-md bg-gray-200"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <section class="w-full max-w-md">
          <div
            class="bg-background text-muted ring-border mx-auto mb-10 flex w-fit items-center justify-center gap-1 rounded-md p-1 ring-1 sm:mb-12 sm:gap-2 sm:*:rounded-md sm:*:p-3 md:mb-16"
          >
            <button
              class="relative rounded px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm"
              :class="{ 'bg-brand-main text-white': activeBillingCycle === 'month' }"
              @click="() => (activeBillingCycle = 'month')"
            >
              Monthly
            </button>
            <button
              class="relative overflow-visible rounded px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm"
              :class="{ 'bg-brand-main text-white': activeBillingCycle === 'year' }"
              @click="() => (activeBillingCycle = 'year')"
            >
              <div class="bg-primary absolute -top-5 -right-3 z-10 rounded-full p-2">
                <p class="text-xs text-[10px] font-medium whitespace-nowrap text-white">Save 20%</p>
              </div>
              Yearly
            </button>
          </div>
        </section>

        <section class="w-full">
          <div
            class="grid grid-cols-1 gap-8 text-start sm:gap-10 md:grid-cols-2 *:first:md:justify-self-end *:last:md:col-span-2 *:last:md:mx-auto xl:flex xl:flex-nowrap xl:items-center xl:justify-center xl:gap-6"
          >
            <template
              v-for="(plan, i) in plans?.filter((plan) => plan.interval === activeBillingCycle)"
              :key="i"
            >
              <PricingCard
                :i="i"
                :active-billing-cycle="activeBillingCycle"
                :plan="plan"
                class="w-full"
              />
            </template>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
