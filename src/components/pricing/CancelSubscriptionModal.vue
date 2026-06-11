<script setup lang="ts">
import { toast } from 'vue-sonner'

import { useBillingStore } from '@/stores/billing-store'
import type { BillingPlan } from '@/types/billing'

import Dialog from '../ui/dialog/Dialog.vue'
import DialogClose from '../ui/dialog/DialogClose.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogDescription from '../ui/dialog/DialogDescription.vue'
import DialogFooter from '../ui/dialog/DialogFooter.vue'
import DialogHeader from '../ui/dialog/DialogHeader.vue'
import DialogTitle from '../ui/dialog/DialogTitle.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'

const {} = defineProps<{
  endDate: Date
  currentPlan: BillingPlan
}>()

const billingStore = useBillingStore()

const formatPrice = (amount: number) => {
  return (amount / 100).toFixed(2)
}

const formatCurrentPlan = (currentPlan: BillingPlan) => {
  const billingPeriodText = currentPlan.interval === 'month' ? 'Monthly' : 'Yearly'
  return `${currentPlan.label} Plan - ${billingPeriodText} ($${formatPrice(currentPlan.amount)}/${currentPlan.interval})`
}

const handleCancelSubscription = async () => {
  await billingStore.cancelSubscription()

  if (billingStore.error) {
    toast.error(billingStore.error)
    return
  }

  toast.success('Subscription cancelled successfully.')
  window.location.reload()
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader class="text-center">
        <svg
          width="118"
          height="118"
          viewBox="0 0 118 118"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto"
        >
          <g clip-path="url(#clip0_7382_25694)">
            <circle cx="59" cy="59" r="51.625" fill="#DC2626" />
            <path
              d="M42.0363 80.0473C40.3253 78.7198 40.1041 77.1858 41.3726 75.4453L54.7361 57.3028L43.2311 42.3463C41.8446 40.6648 42.0363 39.1603 43.8063 37.8328C45.4878 36.4758 46.9923 36.6528 48.3198 38.3638L59.2938 52.6123L70.3563 38.3638C71.6543 36.5938 73.1736 36.402 74.9141 37.7885C76.6251 39.0865 76.8316 40.6058 75.5336 42.3463L63.3648 57.9223L76.8611 75.401C78.1296 77.1415 77.9526 78.6608 76.3301 79.9588C74.5601 81.3453 73.0261 81.1535 71.7281 79.3835L58.8513 62.7013L46.5941 79.295C45.2666 81.0945 43.7473 81.3453 42.0363 80.0473Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_7382_25694">
              <rect width="118" height="118" fill="white" />
            </clipPath>
          </defs>
        </svg>

        <DialogTitle> Cancel your subscription? </DialogTitle>
        <DialogDescription class="py-4">
          You'll lose premium access at the end of your billing period on
          {{
            endDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}.
        </DialogDescription>
      </DialogHeader>
      <section class="bg-peach-amber-100 border-peach-amber-200 rounded-md border px-10 py-4">
        <h3 class="mb-2">Current Plan</h3>
        <p class="text-xs">{{ formatCurrentPlan(currentPlan) }}</p>
      </section>

      <section class="my-4">
        <h3>What You'll Lose:</h3>
        <ul class="space-y-2 px-4 py-2 *:list-disc">
          <li v-for="(feat, i) in currentPlan.features.slice(-5)" :key="i">{{ feat }}</li>
        </ul>
      </section>

      <DialogFooter class="flex w-full flex-row items-center justify-center! gap-4 text-center">
        <DialogClose>
          <button class="btn--secondary btn--lg">Keep My Plan</button>
        </DialogClose>
        <button
          class="btn--default btn--lg"
          :class="billingStore.loading && 'btn--disabled'"
          :disabled="billingStore.loading"
          @click="handleCancelSubscription"
        >
          Cancel Subscription
        </button>
      </DialogFooter>

      <p class="text-center text-xs">You can re-subscribe at any time</p>
    </DialogContent>
  </Dialog>
</template>
