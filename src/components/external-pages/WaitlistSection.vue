<script setup lang="ts">
import {
  AiBrain01Icon,
  CheckmarkCircle02Icon,
  Globe02Icon,
  Mail02Icon,
  Notification02Icon,
  User02Icon,
} from '@hugeicons/core-free-icons'
import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'

import { submitWaitlist, type WaitlistPayload, type earlyAccessPayload } from '@/api/waitlist'
import earlyAccessBg from '@/assets/images/earlyAccess-bg.jpg'
import WaitlistPreviewImg from '@/assets/images/waitlist-dashboard-preview.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import Icon from '../reusable/Icon.vue'
import { Label } from '../ui/label'

// Top Waitlist Form
const form = reactive<WaitlistPayload>({
  organization_name: '',
  organization_email: '',
})

// Footer Early Access Form
const earlyAccessForm = reactive<earlyAccessPayload>({
  organization_name: '',
  organization_email: '',
})

// Inline error states
const formErrors = reactive({
  organization_name: '',
  organization_email: '',
})

const earlyAccessErrors = reactive({
  organization_name: '',
  organization_email: '',
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (isSubmitting.value) return

  formErrors.organization_name = ''
  formErrors.organization_email = ''

  if (!form.organization_name.trim()) {
    formErrors.organization_name = 'Organization name is required'
  }

  if (!form.organization_email.trim()) {
    formErrors.organization_email = 'Work email is required'
  }

  if (formErrors.organization_name || formErrors.organization_email) return

  isSubmitting.value = true

  try {
    const response = await submitWaitlist({ ...form })

    toast.success(response.message ?? 'You are on the waitlist!')

    form.organization_name = ''
    form.organization_email = ''
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Please try again shortly.'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleEarlyAccessSubmit = async () => {
  if (isSubmitting.value) return

  earlyAccessErrors.organization_name = ''
  earlyAccessErrors.organization_email = ''

  if (!earlyAccessForm.organization_name.trim()) {
    earlyAccessErrors.organization_name = 'Organization name is required'
  }

  if (!earlyAccessForm.organization_email.trim()) {
    earlyAccessErrors.organization_email = 'Work email is required'
  }

  if (earlyAccessErrors.organization_name || earlyAccessErrors.organization_email) return

  isSubmitting.value = true

  try {
    const response = await submitWaitlist({ ...earlyAccessForm })

    toast.success(response.message ?? "You're on the waitlist!")

    earlyAccessForm.organization_name = ''
    earlyAccessForm.organization_email = ''
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to submit right now.'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const features = [
  {
    icon: Notification02Icon,
    title: 'Automated Monitoring',
    description: 'Continuous scanning of government and websites for regulatory changes',
  },
  {
    icon: AiBrain01Icon,
    title: 'AI Summaries',
    description: 'Intelligent summarization that extracts key points and impact analysis',
  },
  {
    icon: CheckmarkCircle02Icon,
    title: 'Confidence Scoring',
    description: 'ML-powered confidence metrics to prioritize critical updates',
  },
  {
    icon: Globe02Icon,
    title: 'Multi-Jurisdiction',
    description: 'Track regulations across multiple regions and government bodies',
  },
]

const getPriorityClasses = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-[#FEE2E2] text-[#991B1B]'
    case 'medium':
      return 'bg-[#FEF3C7] text-[#92400E]'
    case 'low':
      return 'bg-[#D1FAE5] text-[#065F46]'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const activeProjects = [
  { projects: 'UK Students Visa', priority: 'High' },
  { projects: 'EU Privacy Laws', priority: 'Medium' },
  { projects: 'US Employment', priority: 'Low' },
  { projects: 'Nigeria Custom', priority: 'Low' },
]

const recentUpdates = [
  { update: 'Skilled Worker threshold updated', time: '2h ago', value: '98%' },
  { update: 'Policy revisions detected', time: '5h ago', value: '85%' },
  { update: 'Processing times changed', time: '8h ago', value: '92%' },
]

const jurisdictions = [
  { name: 'United Kingdom', sources: '5 sources' },
  { name: 'European Union', sources: '12 sources' },
  { name: 'United States', sources: '8 sources' },
  { name: 'Australia', sources: '4 sources' },
]

const testimonials = [
  {
    quote:
      'LegalWatch Dog has transformed how we stay on top of regulatory changes. The AI summaries save us hours every week.',
    name: 'Sarah Chen',
    title: 'Compliance Director',
    initials: 'SC',
  },
  {
    quote:
      "The confidence scoring helps us prioritize what matters. We've never missed a critical update since switching.",
    name: 'Michael Torres',
    title: 'Regulatory Operations Manager',
    initials: 'MT',
  },
  {
    quote:
      'Multi-jurisdiction tracking in one place is a game-changer. Clean interface, powerful features.',
    name: 'Emma Watson',
    title: 'Head of Regulatory Affairs',
    initials: 'EW',
  },
]
</script>

<template>
  <div class="relative flex min-h-screen flex-col gap-35 overflow-hidden">
    <!-- HERO SECTION -->
    <section class="relative z-10 px-4 pt-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl text-center">
        <Badge
          variant="secondary"
          class="bg-background! mb-8 border-0 px-6 py-3 text-sm font-semibold shadow-sm"
        >
          Join the Waitlist
        </Badge>

        <h1 class="mb-6 text-5xl leading-tight font-bold sm:text-6xl lg:text-[64px]">
          Stay Ahead of Regulatory Changes<br />
          Without the Weekly Stress
        </h1>

        <p class="mx-auto mb-12 max-w-3xl text-lg">
          Legal WatchDog tracks government updates, policy shifts, and regulatory changes for you.
          Get clear summaries, real-time alerts, and complete visibility across all your
          jurisdictions.
        </p>

        <!-- TOP FORM -->
        <div class="mx-auto mb-2 flex max-w-124 flex-col justify-center gap-3">
          <!-- Name Input -->
          <div class="relative w-full">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon :icon="User02Icon" :size="20" color="var(--color-border)" />
            </div>
            <Input
              v-model="form.organization_name"
              type="text"
              placeholder="Enter Full Name"
              class="px-4 py-3 pl-10"
            />
            <p v-if="formErrors.organization_name" class="text-error mt-1 text-left text-xs">
              {{ formErrors.organization_name }}
            </p>
          </div>

          <!-- Email Input -->
          <div class="relative w-full">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon :icon="Mail02Icon" :size="20" color="var(--color-border)" />
            </div>
            <Input
              v-model="form.organization_email"
              type="email"
              placeholder="Enter Organization Email"
              class="px-4 py-3 pl-10"
            />
            <p v-if="formErrors.organization_email" class="text-error mt-1 text-left text-xs">
              {{ formErrors.organization_email }}
            </p>
          </div>

          <!-- Submit Button -->
          <Button :disabled="isSubmitting" @click="handleSubmit">
            <span v-if="!isSubmitting">Join the Waitlist</span>
            <span v-else>Submitting...</span>
          </Button>
        </div>

        <!-- Dashboard Mockup -->
        <div class="mx-auto mt-24 max-w-5xl">
          <div class="bg-background overflow-hidden rounded-xl border shadow-2xl">
            <div class="flex items-center gap-2 border-b bg-[#F5F5F5] px-4 py-3">
              <div class="flex gap-2">
                <div class="h-3 w-3 rounded-full bg-[#FF5F57]"></div>
                <div class="h-3 w-3 rounded-full bg-[#FFBD2E]"></div>
                <div class="h-3 w-3 rounded-full bg-[#28CA42]"></div>
              </div>
              <div class="bg-background ml-4 flex-1 rounded-md px-4 py-1.5 text-xs text-gray-500">
                Dashboard
              </div>
            </div>
            <img
              :src="WaitlistPreviewImg"
              alt="Dashboard Preview"
              loading="lazy"
              decoding="async"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="relative px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl text-center">
        <h2 class="mb-4 text-4xl font-bold sm:text-5xl">
          Intelligent <span class="text-accent">Legal</span> Monitoring
        </h2>
        <p class="mx-auto mb-16 max-w-2xl text-base">
          Automated tracking, AI-powered analysis, and actionable insights for compliance
          professionals
        </p>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            v-for="(feature, idx) in features"
            :key="idx"
            class="gap-6 rounded-2xl border-0 px-6 pt-8 pb-11.5 text-left transition hover:shadow-md"
          >
            <div
              class="bg-accent-background mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            >
              <Icon :icon="feature.icon" :size="24" color="var(--color-primary)" />
            </div>
            <div class="flex flex-col gap-2 text-left">
              <h3 class="text-lg font-bold">{{ feature.title }}</h3>
              <p class="text-sm">{{ feature.description }}</p>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- PROJECTS, RECENT UPDATES AND JURISDICTION  -->
    <section class="px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl text-center">
        <h2 class="mb-4 text-4xl font-bold sm:text-5xl">
          Powerful <span class="text-accent">Dashboard,</span> Simple
          <span class="text-accent">Interface</span>
        </h2>
        <p class="mx-auto mb-16 max-w-2xl text-base">
          Everything you need to stay compliant in one clean, intuitive platform
        </p>
        <div class="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Active Projects -->
          <div class="bg-background rounded-md p-6 text-left shadow-sm transition hover:shadow-md">
            <div class="mb-6 flex items-center justify-between">
              <h4 class="text-lg font-bold">Active Projects</h4>
              <p class="text-sm">{{ activeProjects.length }} total</p>
            </div>
            <div class="flex flex-col gap-3">
              <div
                v-for="(project, idx) in activeProjects"
                :key="idx"
                class="bg-muted-background/30 flex flex-row items-center justify-between rounded-md border-0 p-4 transition"
              >
                <h3 class="text-sm font-medium">{{ project.projects }}</h3>
                <span
                  :class="getPriorityClasses(project.priority)"
                  class="rounded-sm px-2 py-1 text-xs font-medium"
                >
                  {{ project.priority }}
                </span>
              </div>
            </div>
          </div>

          <!-- Recent Updates -->
          <div class="bg-background rounded-md p-6 text-left shadow-sm transition hover:shadow-md">
            <div class="mb-6 flex items-center justify-between">
              <h4 class="text-lg font-bold">Recent Updates</h4>
              <p class="text-sm">Today</p>
            </div>
            <div class="flex flex-col gap-4">
              <Card
                v-for="(update, idx) in recentUpdates"
                :key="idx"
                class="bg-background flex flex-row items-start justify-between rounded-none border-b p-3 shadow-none transition last-of-type:border-none"
              >
                <div class="flex flex-col gap-1">
                  <h3 class="text-sm font-medium">{{ update.update }}</h3>
                  <p class="text-xs">{{ update.time }}</p>
                </div>
                <span class="text-accent text-sm font-bold">
                  {{ update.value }}
                </span>
              </Card>
            </div>
          </div>

          <!-- Jurisdictions -->
          <div class="bg-background rounded-md p-6 text-left shadow-sm transition hover:shadow-md">
            <div class="mb-6 flex items-center justify-between">
              <h4 class="text-lg font-bold">Jurisdictions</h4>
              <p class="text-sm">{{ jurisdictions.length }} tracked</p>
            </div>
            <div class="flex flex-col gap-3">
              <Card
                v-for="(jurisdiction, idx) in jurisdictions.slice(0, 4)"
                :key="idx"
                class="flex flex-row items-center justify-between rounded-md border-0 p-3 shadow-none transition"
              >
                <div class="flex items-center gap-3">
                  <div class="bg-accent flex items-center justify-center rounded-full p-2">
                    <Icon :icon="Globe02Icon" :size="16" color="white" />
                  </div>
                  <h3 class="text-sm font-medium">{{ jurisdiction.name }}</h3>
                </div>
                <p class="text-sm">
                  {{ jurisdiction.sources }}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="waitlist-form">
      <!-- FOOTER EARLY ACCESS -->
      <section class="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <img
          :src="earlyAccessBg"
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="relative z-10 mx-auto max-w-xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-white sm:text-4xl">Get Early Access</h2>
          <p class="mb-8 text-white">
            Join legal and compliance professionals who are transforming how they monitor regulatory
            changes
          </p>

          <Card class="rounded-xl p-6 shadow-xl">
            <div class="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Footer Name Input -->
              <div>
                <Label for="fullname">
                  Full Name

                  <Input
                    id="fullname"
                    v-model="earlyAccessForm.organization_name"
                    type="text"
                    placeholder="John Doe"
                    class="w-full rounded-md bg-transparent!"
                  />
                </Label>
                <p v-if="earlyAccessErrors.organization_name" class="text-error mt-1 text-xs">
                  {{ earlyAccessErrors.organization_name }}
                </p>
              </div>

              <!-- Footer Email Input -->
              <div>
                <Label for="email">
                  Work Email

                  <Input
                    id="email"
                    v-model="earlyAccessForm.organization_email"
                    type="email"
                    placeholder="olivia@untitledui.com"
                    class="w-full rounded-md bg-transparent!"
                  />
                </Label>
                <p v-if="earlyAccessErrors.organization_email" class="text-error mt-1 text-xs">
                  {{ earlyAccessErrors.organization_email }}
                </p>
              </div>
            </div>

            <!-- Footer Button -->
            <Button :disabled="isSubmitting" @click="handleEarlyAccessSubmit">
              <span v-if="!isSubmitting">Get Early Access →</span>
              <span v-else>Submitting...</span>
            </Button>

            <p class="mt-4 text-xs">We respect your privacy. No spam, unsubscribe anytime.</p>
          </Card>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="bg-accent-background px-4 py-32 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl text-center">
          <h2 class="mb-16 text-4xl font-bold sm:text-5xl">Trusted by Compliance Professionals</h2>
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              v-for="(testimonial, idx) in testimonials"
              :key="idx"
              class="bg-background flex flex-col justify-between rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md"
            >
              <div>
                <div class="mb-4 flex items-center text-yellow-400">
                  <span v-for="i in Array(5)" :key="i"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="m7.325 18.923l1.24-5.313l-4.123-3.572l5.431-.47L12 4.557l2.127 5.01l5.43.47l-4.123 3.572l1.241 5.313L12 16.102z"
                      /></svg
                  ></span>
                </div>
                <p class="mb-6 text-sm leading-relaxed">"{{ testimonial.quote }}"</p>
              </div>
              <div class="flex items-center gap-3">
                <div
                  class="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                >
                  {{ testimonial.initials }}
                </div>
                <div>
                  <h4 class="text-sm font-bold">{{ testimonial.name }}</h4>
                  <p class="text-xs">{{ testimonial.title }}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>
