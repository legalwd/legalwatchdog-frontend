<script setup lang="ts">
import { Copy01Icon } from '@hugeicons/core-free-icons'
import { ref } from 'vue'

import Icon from '@/components/reusable/Icon.vue'
import { Accordion } from '@/components/ui/accordion'
import AccordionContent from '@/components/ui/accordion/AccordionContent.vue'
import AccordionItem from '@/components/ui/accordion/AccordionItem.vue'
import AccordionTrigger from '@/components/ui/accordion/AccordionTrigger.vue'

const EMAIL = 'info@emerj.net'
const copyRef = ref('Copy')

const faqs = [
  {
    question: 'What is Legal WatchDog and how does it help my team?',
    answer:
      "Legal WatchDog is a platform that keeps track of policy and regulatory changes for you. Instead of checking websites one by one, the system watches them and alerts your team when there's a change. It helps you stay updated, saves time, and keeps your work organised in one place.",
  },
  {
    question: 'Who can use Legal WatchDog?',
    answer:
      "The platform is built for enterprises. Whether you're part of a team, compliance team, risk team, policy team, or simply need to monitor updates across different regions, Legal WatchDog can support your work.",
  },
  {
    question: 'How do I get started?',
    answer:
      'To get started, create an account, set up your project, define your jurisdiction, add trusted sources, and let the system handle automated monitoring and alerts.',
  },
  {
    question: 'Can I monitor multiple regions or countries?',
    answer:
      'Yes. You can choose the regions, countries, or specific areas you want the platform to monitor. You can also organise them neatly inside each project.',
  },
  {
    question: "How do I know when there's an update or change?",
    answer:
      "Whenever something new is found, you'll receive a clear alert inside the platform. You can review what changed, see the details, and decide what action your team needs to take next.",
  },
  {
    question: 'Can I invite my colleagues or external partners?',
    answer:
      'Yes. You can add your internal team members to your workspace. You can also invite external partners to join specific discussions when their input is needed. They only see what you choose to share with them.',
  },
  {
    question: 'Is my data safe?',
    answer:
      "Yes. Your organisation's information is stored securely, and only people you approve can access it. External guests only see the discussion they were invited to.",
  },
  {
    question: 'How does Legal WatchDog keep my projects up to date?',
    answer:
      "The platform automatically reviews the areas you're monitoring and updates your projects when something changes. It highlights what's new, adds the update to the right project, and helps your team stay current without doing the manual work yourself.",
  },
  {
    question: 'How does the free trial work?',
    answer:
      "When you create your first project, your free trial starts automatically. You'll get full access to explore the platform, and you can see how many days you have left on your Billing page. You won't be charged until you choose a plan.",
  },
  {
    question: 'What happens when my trial ends?',
    answer:
      "If you don't subscribe before the trial ends, your account becomes inactive and premium features will be locked. You can regain access anytime by choosing a plan on the Billing page.",
  },
  {
    question: 'How do I pay for a subscription?',
    answer:
      "You can choose a Monthly or Yearly plan on the Billing page. When you proceed, you'll be redirected to a secure payment page where you can enter your card details. Once the payment is successful, your subscription becomes active immediately.",
  },
  {
    question: 'Can I cancel my subscription?',
    answer:
      "Yes. You can cancel at any time. After cancellation, your plan stays active until the end of the current billing cycle. Once it expires, you'll lose premium access, but you can re-subscribe whenever you're ready.",
  },
]

function copyEmail() {
  copyRef.value = 'Copied!'

  setTimeout(() => {
    copyRef.value = 'Copy'
  }, 2000)

  navigator.clipboard.writeText(EMAIL)
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <main
      class="relative mx-auto flex w-full flex-1 flex-col items-center overflow-hidden px-4 py-12 text-center sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24"
    >
      <div class="z-10 w-full">
        <!-- FAQ Section -->
        <section class="mb-12 w-full sm:mb-16">
          <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-4xl">
            <h1 class="text-brand-850 mb-4 text-3xl font-bold sm:mb-5 sm:text-5xl md:text-6xl">
              Frequently Asked Questions
            </h1>
            <p class="mb-10 text-sm sm:mb-12 sm:text-base md:mb-16 md:text-lg">
              Legal WatchDog uses AI to track all changes on any website, from Visa portals to
              employment laws and delivers concise actionable summaries.
            </p>
          </div>

          <div
            class="bg-background mx-auto w-full max-w-3xl rounded-lg p-4 shadow-sm sm:p-6 md:p-8 lg:p-10 xl:max-w-5xl"
          >
            <template v-for="(faq, i) in faqs" :key="i">
              <Accordion type="single" collapsible class="mb-2 last:mb-0">
                <AccordionItem :value="faq.question">
                  <AccordionTrigger class="text-left text-sm font-medium sm:text-base">
                    {{ faq.question }}
                  </AccordionTrigger>
                  <AccordionContent class="text-muted text-left text-xs sm:text-sm">
                    {{ faq.answer }}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </template>
          </div>
        </section>

        <!-- Contact Section -->
        <section class="w-full">
          <div class="mx-auto max-w-lg px-4 sm:px-6">
            <h2 class="text-brand-850 mb-3 text-xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
              Have any other question?
            </h2>
            <p class="mb-4 text-xs sm:mb-5 sm:text-sm md:mb-6 md:text-base">
              Don't hesitate to send us an email with your enquiry or statement at:
            </p>
            <div
              class="bg-background mx-auto flex w-full max-w-md items-center justify-center gap-1 rounded-md p-2 shadow-sm sm:max-w-lg sm:gap-4 sm:p-4"
            >
              <p
                class="text-foreground text-center text-sm font-medium break-all sm:text-left sm:text-base md:text-lg"
              >
                {{ EMAIL }}
              </p>
              <button
                class="bg-peach-amber-50 hover:bg-peach-amber-100 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 transition-colors sm:w-auto sm:px-2.5 sm:py-1.5"
                @click="copyEmail"
              >
                <span class="text-xs font-medium sm:text-sm">{{ copyRef }}</span>
                <Icon :icon="Copy01Icon" color="black" :size="18" class="sm:size-5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Responsive adjustments */
@media (max-width: 640px) {
  .app-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Ensure proper spacing for FAQ items */
.AccordionItem {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 0;
}

.AccordionItem:last-child {
  border-bottom: none;
}

/* Better touch targets for mobile */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Improve readability for FAQ content */
  .AccordionContent {
    line-height: 1.6;
  }
}

/* Prevent content from being too wide on large screens */
@media (min-width: 1536px) {
  main {
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Smooth transitions */
button {
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}
</style>
