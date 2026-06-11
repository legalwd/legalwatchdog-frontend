<script setup lang="ts">
import {
  DashboardSpeed02Icon,
  EyeIcon,
  KnightShieldIcon,
  Notification01Icon,
  ShipmentTrackingIcon,
  Target01Icon,
  Task02Icon,
  TeachingIcon,
  Telescope01Icon,
  ValidationApprovalIcon,
} from '@hugeicons/core-free-icons'
import { RouterLink } from 'vue-router'

import visionImg from '@/assets/images/About_us.jpg'
// import team1 from '@/assets/images/meet_team_1.jpg'
// import team2 from '@/assets/images/meet_team_2.jpg'
// import team3 from '@/assets/images/meet_team_3.jpg'
import missionImg from '@/assets/images/mission_vision.jpg'
import StrategicAdvantageCTA from '@/components/external-pages/StrategicAdvantageCTA.vue'
import Icon from '@/components/reusable/Icon.vue'

const whatItDoes = [
  {
    icon: Telescope01Icon,
    title: 'Monitors Laws & Policies in Real Time',
    description:
      'Tracks updates across multiple jurisdictions, immigration, tax, employment, data protection, and more.',
  },
  {
    icon: Notification01Icon,
    title: 'Sends Instant Alerts',
    description: 'Notifies your team the moment a regulation changes.',
  },
  {
    icon: Task02Icon,
    title: 'Summarizes Complex Legal Updates',
    description: 'Provides clear, expert-verified summaries that anyone can understand.',
  },
  {
    icon: TeachingIcon,
    title: 'Centralizes All Regulatory Content',
    description: 'Organizes laws, policies, and compliance requirements in one place.',
  },
  {
    icon: ShipmentTrackingIcon,
    title: 'Allows Custom Tracking',
    description:
      'Lets users choose the jurisdictions, topics, and regulations they want to follow.',
  },
  {
    icon: ValidationApprovalIcon,
    title: 'Reduces Compliance Risk',
    description: 'Helps teams stay ahead, avoid penalties, and make informed decisions.',
  },
]

const coreValues = [
  {
    title: 'Accuracy',
    icon: Target01Icon,
    description: 'Every update is verified, cross-checked, and structured.',
  },
  {
    title: 'Transparency',
    icon: EyeIcon,
    description: 'Your sources, your data you see everything.',
  },
  {
    title: 'Speed',
    icon: DashboardSpeed02Icon,
    description: 'Get update summaries in minutes, not days.',
  },
  {
    title: 'Trust',
    icon: KnightShieldIcon,
    description: 'Expert-backed insights from trained policy specialists.',
  },
]

/* const teamMembers = [
  {
    name: 'Amara Okafor',
    role: 'Chief Data Officer',
    image: team1,
    description: 'Builds responsible AI pipelines that keep our insights precise and auditable.',
  },
  {
    name: 'Lucas Nguyen',
    role: 'VP Operations',
    image: team2,
    description: 'Former regulator translating policy shifts into clear, actionable playbooks.',
  },
  {
    name: 'Sabastian Ogbufuru',
    role: 'Head of Product Design',
    image: team3,
    description: 'Designs the human-first experiences that make complex compliance feel simple.',
  },
] */
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <main class="relative mx-auto flex w-full flex-1 flex-col overflow-hidden">
      <!-- Hero Section -->
      <section
        class="relative z-10 flex w-full flex-col items-center justify-center pt-12 pb-8 sm:pt-16 sm:pb-12"
      >
        <div class="app-container flex w-full flex-col items-center text-center">
          <h1
            class="text-brand-850 mb-4 text-2xl leading-tight font-extrabold sm:mb-5 sm:text-3xl md:text-4xl lg:text-5xl lg:leading-[1.1]"
          >
            Real-Time Tracking of Policy Changes.
          </h1>
          <p
            class="mx-auto mb-4 max-w-2xl text-sm leading-relaxed font-medium sm:mb-8 sm:text-base md:text-lg"
          >
            AI intelligence and human insight keep your team compliant, informed, and confidently
            ahead.
          </p>
          <RouterLink to="/signup" class="btn--default btn--lg mb-6 sm:mb-8">
            Get Started
          </RouterLink>

          <p
            class="mx-auto mb-8 max-w-6xl text-sm leading-relaxed font-medium sm:mb-12 sm:text-base md:text-lg"
          >
            Legal Watchdog is used to monitor regulatory updates, track policy changes, and stay
            compliant across multiple jurisdictions. Our platform combines AI-powered monitoring
            with expert-verified summaries, giving teams clear, timely insights they can act on.
            Whether you're tracking visa rules, employment laws, tax policies, or data regulations,
            Legal Watchdog delivers real-time alerts and organized legal content to keep your
            organization informed and ahead of risk. Built for both growing teams and large
            enterprises, Legal Watchdog provides a smarter, scalable way to manage compliance.
          </p>
        </div>
      </section>

      <!-- Mission & Vision -->
      <section class="app-container relative z-10 w-full space-y-16 py-12 sm:py-16">
        <div
          class="mx-auto flex w-full flex-col items-center gap-8 md:flex-row md:gap-12 lg:max-w-310"
        >
          <div class="flex-1 space-y-4">
            <div class="flex flex-row items-center gap-4">
              <div
                class="bg-accent-background flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
              >
                <Icon :icon="Target01Icon" :size="16" color="var(--color-primary)" />
              </div>
              <h2 class="text-accent text-lg font-semibold sm:text-xl md:text-2xl">Our Vision</h2>
            </div>
            <p class="text-base leading-relaxed sm:text-lg">
              To become the world's most trusted platform for real-time legal intelligence, bridging
              the gap between global regulations and the people who depend on them.
            </p>
          </div>
          <div class="w-full flex-1">
            <img
              :src="visionImg"
              alt="Vision Statement"
              loading="lazy"
              decoding="async"
              class="w-full rounded-xl shadow-lg sm:rounded-2xl"
            />
          </div>
        </div>
        <div
          class="mx-auto flex w-full flex-col items-center gap-8 md:flex-row-reverse md:gap-12 lg:max-w-310"
        >
          <div class="flex-1 space-y-4">
            <div class="flex flex-row items-center gap-4">
              <div
                class="bg-accent-background flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
              >
                <Icon :icon="Target01Icon" :size="16" color="var(--color-primary)" />
              </div>
              <h2 class="text-accent text-lg font-semibold sm:text-xl md:text-2xl">Our Mission</h2>
            </div>
            <p class="text-base leading-relaxed sm:text-lg">
              To help organizations stay informed, make confident decisions, and reduce operational
              risk by giving them a reliable way to track important changes—automatically.
            </p>
          </div>
          <div class="w-full flex-1">
            <img
              :src="missionImg"
              alt="Mission Statement"
              loading="lazy"
              decoding="async"
              class="w-full rounded-xl shadow-lg sm:rounded-2xl"
            />
          </div>
        </div>
      </section>

      <!-- Core Values -->
      <section class="app-container relative z-10 w-full bg-transparent py-12 sm:py-16">
        <div class="mx-auto flex w-full flex-col items-center gap-8 sm:gap-12">
          <div class="flex flex-col items-center justify-center space-y-3 text-center sm:space-y-4">
            <h2 class="text-2xl font-bold sm:text-3xl md:text-4xl">
              What <span class="text-accent">It</span> Does
            </h2>
            <p class="sm:text-lg">
              We turn scattered legal updates into clear, actionable insights your team can rely on
            </p>
          </div>
          <div
            class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3"
          >
            <div
              v-for="(card, i) in whatItDoes"
              :key="i"
              class="bg-background flex flex-col items-start gap-3 rounded-xl border-none p-4 text-center sm:gap-4 sm:px-12 sm:py-6"
            >
              <div class="flex w-full flex-col gap-3">
                <div
                  class="bg-accent-background mx-auto flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
                >
                  <Icon :icon="card.icon" :size="16" color="var(--color-primary)" />
                </div>
                <h3 class="text-lg font-bold sm:text-xl">
                  {{ card.title }}
                </h3>
              </div>
              <p class="text-sm leading-relaxed sm:text-base">
                {{ card.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Values -->
      <section class="app-container relative z-10 w-full bg-transparent py-12 sm:py-16">
        <div class="mx-auto flex w-full flex-col items-center gap-8 sm:gap-12">
          <div class="flex flex-col items-center justify-center space-y-3 text-center sm:space-y-4">
            <h2 class="text-2xl font-bold sm:text-3xl md:text-4xl">
              Our <span class="text-accent">Core</span> Values
            </h2>
            <p class="sm:text-lg">The principles that guide everything we do</p>
          </div>
          <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            <div
              v-for="(card, i) in coreValues"
              :key="i"
              class="bg-background flex flex-col items-start gap-3 rounded-xl border-none p-4 sm:gap-4 sm:p-6"
            >
              <div class="flex w-full flex-col gap-3">
                <div
                  class="bg-accent-background flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
                >
                  <Icon :icon="card.icon" :size="16" color="var(--color-primary)" />
                </div>
                <h3 class="text-lg font-bold sm:text-xl">
                  {{ card.title }}
                </h3>
              </div>
              <p class="text-sm leading-relaxed sm:text-base">
                {{ card.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Meet Our Team -->
      <!-- <section class="app-container relative z-10 w-full py-12 sm:py-16">
        <div class="mx-auto flex w-full flex-col items-center gap-8 sm:gap-12">
          <div class="flex flex-col items-center justify-center space-y-3 text-center sm:space-y-4">
            <h2 class="text-2xl font-bold sm:text-3xl md:text-4xl">
              Meet <span class="text-accent">Our</span> Team
            </h2>

            <p class="max-w-2xl sm:text-lg">
              Meet the dedicated minds working to bring transparency and innovation.
            </p>
          </div>

          <div
            class="flex w-full flex-col items-center justify-center gap-8 sm:flex-row sm:flex-wrap sm:gap-6 lg:gap-8"
          >
            <div
              v-for="(member, i) in teamMembers"
              :key="i"
              class="flex w-full max-w-75 flex-col items-start sm:max-w-70 md:max-w-[320px] lg:max-w-87.5"
            >
              <div
                class="mb-3 h-62.5 w-full overflow-hidden rounded-lg sm:mb-4 sm:h-70 lg:h-75 lg:rounded-xl"
              >
                <img
                  :src="member.image"
                  :alt="member.name"
                  class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <p class="text-foreground mb-2 max-w-4/5 leading-relaxed">
                {{ member.description }}
              </p>

              <div>
                <p class="text-foreground">({{ member.role }})</p>
                <p class="text-accent">{{ member.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </section> -->

      <StrategicAdvantageCTA />
    </main>
  </div>
</template>
