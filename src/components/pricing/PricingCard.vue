<script setup lang="ts">
import {
  CheckmarkSquare02Icon,
  Briefcase01Icon,
  Building03Icon,
  Target01Icon,
} from '@hugeicons/core-free-icons'
import { RouterLink, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

import Icon from '@/components/reusable/Icon.vue'
import { useBillingStore } from '@/stores/billing-store'
import type { BillingPlan } from '@/types/billing'

const { i, activeBillingCycle, plan } = defineProps<{
  i: number
  activeBillingCycle: 'month' | 'year'
  plan: BillingPlan
}>()

const route = useRoute()
const billingStore = useBillingStore()
const isActivePlan = billingStore.current_plan_id === plan.id

const formatPrice = (amount: number) => {
  return (amount / 100).toFixed(2)
}

const handlePay = async () => {
  if (isActivePlan) return

  const result = await billingStore.handlePlanChange(plan.id)

  if (billingStore.error) {
    toast.error(billingStore.error)
    return
  }

  if (typeof result === 'string' && result.startsWith('http')) {
    window.location.href = result
  } else {
    await billingStore.getSubscriptionStatus()
  }
}
</script>

<template>
  <article
    class="card-gradient bg-background relative w-auto max-w-sm min-w-3xs space-y-8 overflow-hidden rounded-4xl px-6 pt-10 pb-4 shadow-md"
    :class="[i === 1 && 'card-gradient--popular lg:py-12']"
  >
    <div class="text flex items-center justify-between">
      <div class="bg-brand-main size-fit rounded-full p-4">
        <Icon
          :icon="i === 0 ? Briefcase01Icon : i === 1 ? Target01Icon : Building03Icon"
          :size="24"
          color="var(--color-peach-amber-200)"
        />
      </div>

      <p v-if="i === 1" class="bg-brand-main rounded-md px-2 py-1 text-sm text-white">
        Most popular
      </p>
    </div>
    <div class="space-y-5">
      <h2 class="text-2xl font-medium">{{ plan.label }}</h2>
      <p class="">{{ plan.description }}</p>
    </div>
    <p>
      <span class="text-foreground text-3xl font-medium">${{ formatPrice(plan.amount) }}</span
      ><span class="text-gray-500">
        {{ activeBillingCycle === 'month' ? '/month' : '/year' }}
      </span>
    </p>

    <template v-if="route.name === 'payment-plan'">
      <button
        :disabled="isActivePlan || billingStore.loading"
        class="btn--secondary btn--xl block w-full border text-center"
        :class="[
          i == 1 && 'btn--default hover:text-white',
          (isActivePlan || billingStore.loading) && 'btn--disabled',
        ]"
        @click="handlePay"
      >
        {{ isActivePlan ? 'Active plan' : i == 1 ? 'Get started now' : 'Choose this plan' }}
      </button>
    </template>
    <template v-else>
      <RouterLink
        :to="{
          name: 'dashboard',
        }"
        class="btn--secondary btn--xl block w-full border text-center"
        :class="[i == 1 && 'btn--default hover:text-white']"
      >
        {{ i == 1 ? 'Get started now' : 'Choose this plan' }}
      </RouterLink>
    </template>

    <ul class="space-y-5 pt-4">
      <li v-for="(feature, index) in plan.features" :key="index" class="flex items-center gap-2">
        <Icon :icon="CheckmarkSquare02Icon" :size="20" color="var(--color-brand-main)" />
        <span class="text-muted">{{ feature }}</span>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.card-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background-image: linear-gradient(to bottom, var(--color-peach-amber-50), transparent 80%);
  z-index: 0;
}

.card-gradient--popular::before {
  background-image: linear-gradient(to bottom, var(--color-peach-amber-100) 65%, transparent 95%);
}

.card-gradient > * {
  position: relative;
  z-index: 1;
}
</style>
