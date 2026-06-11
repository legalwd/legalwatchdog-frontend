<script setup lang="ts">
import { FileNotFoundIcon } from '@hugeicons/core-free-icons'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import CancelSubscriptionModal from '@/components/pricing/CancelSubscriptionModal.vue'
import Icon from '@/components/reusable/Icon.vue'
import { useBillingStore } from '@/stores/billing-store'
import type { BillingHistoryEntry, BillingPlan } from '@/types/billing'

const isLoading = ref(true)
const hasHistory = ref(false)
const isFreeTrial = ref(true)
const cancelled = ref(false)
const currentPlan = ref<BillingPlan | undefined>(undefined)
const endDate = ref<Date | undefined>(undefined)
const invoice = ref<BillingHistoryEntry[] | undefined>(undefined)

const billingStore = useBillingStore()

onMounted(async () => {
  isLoading.value = true
  const [subscriptionStatus, history] = await Promise.all([
    billingStore.getSubscriptionStatus(),
    billingStore.getPaymentHistory(),
  ])

  if (billingStore.error) {
    toast.error(billingStore.error)
    return
  }

  if (subscriptionStatus?.trial_starts_at && subscriptionStatus?.trial_ends_at) {
    isFreeTrial.value = true
    endDate.value = new Date(subscriptionStatus.trial_ends_at)
  } else if (subscriptionStatus?.current_plan && subscriptionStatus.current_period_end) {
    isFreeTrial.value = false
    currentPlan.value = subscriptionStatus.current_plan
    endDate.value = new Date(subscriptionStatus.current_period_end)
  }

  cancelled.value = subscriptionStatus?.cancel_at_period_end || false

  if (history && history.length > 0) {
    hasHistory.value = true
    invoice.value = history
  }
  isLoading.value = false
})

const calculateDaysLeft = (endDate: Date): string => {
  const diffTime = endDate.getTime() - new Date().getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} left`
  if (diffDays === 0) return 'Ends today'
  return 'Ended'
}
</script>

<template>
  <h1 class="app-container mb-8 text-3xl font-semibold">Billing & Subscription</h1>
  <!-- Loading Skeleton -->
  <section
    v-if="isLoading"
    class="app-container *:bg-background mb-10 flex animate-pulse flex-col gap-6 *:flex-1 *:rounded-md *:px-6 *:py-5 *:ring-1 *:ring-gray-300 md:flex-row"
  >
    <article>
      <div class="mb-5 flex items-center justify-between">
        <div class="h-6 w-32 rounded bg-gray-200"></div>
        <div class="h-8 w-24 rounded-full bg-gray-200"></div>
      </div>
      <div class="mb-4 h-8 w-48 rounded bg-gray-200"></div>
      <div class="mb-10 h-5 w-full rounded bg-gray-200"></div>
      <div class="flex flex-col gap-x-6 gap-y-4 *:flex-1 md:flex-row">
        <div class="h-11 rounded-md bg-gray-200"></div>
        <div class="h-11 rounded-md bg-gray-200"></div>
      </div>
    </article>
    <article>
      <div class="mb-6 h-7 w-40 rounded bg-gray-200"></div>
      <div class="mb-2 h-5 w-full rounded bg-gray-200"></div>
      <div class="h-5 w-3/4 rounded bg-gray-200"></div>
    </article>
  </section>

  <!-- Content -->
  <section
    v-else
    class="app-container *:bg-background mb-10 flex flex-col gap-6 *:flex-1 *:rounded-md *:px-6 *:py-5 *:ring-1 *:ring-gray-300 md:flex-row"
  >
    <article>
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xl">Current Plan</h2>
        <div class="text-peach-amber-main bg-peach-amber-100 rounded-full px-2.5 py-1.5">
          <p>{{ endDate ? calculateDaysLeft(endDate) : '' }}</p>
        </div>
      </div>

      <template v-if="isFreeTrial">
        <h3 class="mb-4 text-3xl font-semibold">Free Trial</h3>
        <p class="mb-10">You're currently on a free trial. No charges until your trial ends.</p>
      </template>
      <template v-else-if="currentPlan">
        <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
          <h3 class="text-3xl font-semibold">{{ currentPlan.label }}</h3>
          <p
            v-if="cancelled"
            class="text-red-main mb-2 w-fit rounded-md bg-red-100 px-2 py-1 text-sm"
          >
            Cancelled
          </p>
        </div>
        <p class="mb-10">{{ currentPlan.description }}</p>
      </template>

      <div class="flex flex-col gap-x-6 gap-y-4 *:flex-1 md:flex-row">
        <RouterLink
          :to="{ name: 'payment-plan' }"
          class="btn--md btn--default flex items-center justify-center text-center"
        >
          Upgrade Plan
        </RouterLink>
        <template v-if="currentPlan && endDate">
          <CancelSubscriptionModal :end-date="endDate" :current-plan="currentPlan">
            <button
              class="btn--md btn--secondary"
              :class="[isFreeTrial && 'btn--disabled']"
              :disabled="isFreeTrial"
            >
              Cancel Subscription
            </button>
          </CancelSubscriptionModal>
        </template>
        <template v-else>
          <button class="btn--md btn--disabled rounded-md" disabled>Cancel Subscription</button>
        </template>
      </div>
    </article>

    <article class="flex flex-col">
      <h2 class="mt-4 mb-6 text-2xl font-medium">Payment Method</h2>
      <p class="mb-10">
        You don't have a payment method on file yet. Add one to seamlessly activate your plan after
        trial.
      </p>
    </article>
  </section>

  <section class="app-container">
    <h2 class="mb-6 text-2xl font-semibold">Payment History</h2>

    <!-- Loading Skeleton -->
    <div
      v-if="isLoading"
      class="bg-background min-h-[356px] animate-pulse rounded-lg px-4 py-8 md:px-8"
    >
      <div class="w-full table-auto">
        <div class="flex *:min-w-40 *:font-semibold">
          <div class="h-6 flex-1 rounded-l-md bg-gray-200 px-4 py-3"></div>
          <div class="h-6 flex-1 bg-gray-200 px-4 py-3"></div>
          <div class="h-6 flex-1 bg-gray-200 px-4 py-3"></div>
          <div class="h-6 flex-1 rounded-r-md bg-gray-200 px-4 py-3"></div>
        </div>
        <div class="mt-6 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-x-4 *:flex-1">
            <div class="h-5 rounded bg-gray-200 px-4 py-3"></div>
            <div class="h-5 rounded bg-gray-200 px-4 py-3"></div>
            <div class="h-5 rounded bg-gray-200 px-4 py-3"></div>
            <div class="h-5 rounded bg-gray-200 px-4 py-3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div
      v-else
      class="bg-background flex min-h-[356px] rounded-lg"
      :class="[hasHistory ? '' : 'items-center justify-center px-6 text-center']"
    >
      <div v-if="hasHistory" class="w-full overflow-x-auto px-4 py-8 md:px-8">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-peach-amber-100 uppercase *:min-w-40 *:font-semibold">
              <th class="rounded-l-md px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-left">Amount</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="rounded-r-md px-4 py-3 text-left">Plan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in invoice" :key="entry.id" class="*: first:*:pt-6">
              <td class="px-4 py-3">
                {{
                  new Date(entry.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              </td>
              <td class="px-4 py-3">${{ (entry.amount_paid / 100).toFixed(2) }}</td>
              <td class="px-4 py-3 capitalize">
                <template v-if="entry.status === 'PAID'">
                  <span class="text-green-main rounded-full bg-green-100 px-4 py-1">PAID</span>
                </template>
                <template v-else>
                  <span class="text-red-main rounded-full bg-red-100 px-4 py-1">FAILED</span>
                </template>
              </td>
              <td class="px-4 py-3">{{ entry.plan_label }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex flex-col items-center justify-center gap-2">
        <div class="mb-2 w-fit rounded-full border border-gray-300 p-6">
          <Icon :icon="FileNotFoundIcon" :size="33" color="var(--gray-300)" />
        </div>
        <p class="font-medium">No Payment Made</p>
        <p>Payment history will appear here after your first payment.</p>
      </div>
    </div>
  </section>
</template>
