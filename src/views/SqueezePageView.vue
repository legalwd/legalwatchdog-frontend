<script setup lang="ts">
import { LicenseIcon, TimeManagementIcon, CheckmarkBadge01Icon } from '@hugeicons/core-free-icons'

import heroImg from '@/assets/images/squeeze.webp'
import squeezeImg1 from '@/assets/images/squeeze1.jpg'
import squeezeImg2 from '@/assets/images/squeeze2.jpg'
import squeezeImg3 from '@/assets/images/squeeze3.jpg'
import SqueezeForm from '@/components/external-pages/SqueezeForm.vue'
import Icon from '@/components/reusable/Icon.vue'

const testimonials = [
  {
    message:
      'The ability to filter global updates by specific visa categories and jurisdictions has eliminated the noise of irrelevant data, ensuring our team focuses only on high-impact regulatory changes.',
    image: squeezeImg1,
    title: 'Regulatory Lead',
    company: 'Specialist Law Practice',
  },
  {
    message:
      'LegalWatchDog has fundamentally optimized our jurisdictional research. By automating the monitoring of official gazettes, we have achieved a significant reduction in billable hours spent on manual tracking.',
    image: squeezeImg2,
    title: 'Principal Associate',
    company: 'International Mobility Group',
  },
  {
    message:
      'The platform provides an essential layer of risk mitigation. Having instant, source-verified access to statutory changes allows our counsel to provide advice with absolute regulatory certainty.',
    image: squeezeImg3,
    title: 'General Counsel',
    company: 'Global Financial Services',
  },
]
</script>

<template>
  <div class="app-container">
    <section class="py-16 pt-8 sm:pt-16">
      <h1
        class="mb-6 max-w-xl text-center text-4xl leading-[110%] font-semibold md:text-start md:text-5xl"
      >
        Automate Your Regulatory Monitoring
      </h1>
      <div class="relative grid grid-cols-1 gap-12 md:grid-cols-2">
        <div class="space-y-6">
          <p class="text-center text-lg md:text-start">
            Join our early-access demo and be among the first to use LegalWatchDog, your automated
            jurisdictional sentry designed to track, verify, and alert you to fee changes, policy
            shifts, and global regulatory updates in real-time.
          </p>
          <SqueezeForm />
        </div>

        <div class="top-1/2 left-[52%] -translate-y-1/2 shadow md:absolute md:w-[48%] lg:w-[55%]">
          <img
            :src="heroImg"
            alt="Monitoring Dashboard Preview"
            fetchpriority="high"
            decoding="async"
            class="w-full"
          />
        </div>
      </div>
    </section>

    <section class="py-16 md:py-28">
      <h2 class="mb-4 text-3xl font-semibold md:text-4xl">Essential Features</h2>
      <p>Intelligent by design. Proven results.</p>

      <div class="mt-10 grid grid-cols-1 md:mt-20 md:grid-cols-3 md:grid-rows-3 md:gap-y-0">
        <div class="max-w-sm border-l p-5">
          <div class="bg-accent-background mb-4 w-fit rounded-full p-3">
            <Icon :icon="LicenseIcon" class="text-primary size-7" />
          </div>
          <h3 class="mb-2 text-xl font-medium">AI-Powered Summaries</h3>
          <p>
            Get a single, clear view of all your compliance items instantly transformed into simple,
            actionable insights for your whole organization.
          </p>
        </div>

        <div class="max-w-sm border-l p-5 md:col-start-2 md:row-start-2">
          <div class="bg-accent-background mb-4 w-fit rounded-full p-3">
            <Icon :icon="TimeManagementIcon" class="text-primary size-7" />
          </div>
          <h3 class="mb-2 text-xl font-medium">Change Timeline</h3>
          <p>
            Replace manual tracking with real-time, automated monitoring. Get only the updates that
            matter for faster, more controlled compliance.
          </p>
        </div>

        <div class="max-w-sm border-l p-5 md:col-start-3 md:row-start-3">
          <div class="bg-accent-background mb-4 w-fit rounded-full p-3">
            <Icon :icon="CheckmarkBadge01Icon" class="text-primary size-7" />
          </div>
          <h3 class="mb-2 text-xl font-medium">Source Verification</h3>
          <p>
            Stay confident with source-linked, real-time updates. Know exactly what changed and why
            it matters, without second-guessing.
          </p>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-28">
      <h2 class="mb-4 max-w-md text-3xl font-semibold md:text-4xl">Trusted by Industry Leaders</h2>
      <p class="mb-20 max-w-lg">Why top legal and compliance professionals choose LegalWatchDog</p>

      <div class="flex flex-col flex-nowrap gap-12 md:flex-row">
        <div v-for="(testimonial, i) in testimonials" :key="i" class="max-w-sm">
          <svg
            width="15"
            height="12"
            viewBox="0 0 15 12"
            fill="none"
            class="mb-4 opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.2014 5.3335C11.8003 5.33348 12.2998 5.33346 12.6963 5.38677C13.1149 5.44304 13.4927 5.56682 13.7964 5.87047C14.1 6.17412 14.2238 6.55198 14.2801 6.97051C14.3334 7.36703 14.3334 7.8665 14.3333 8.46547V8.4655V8.53483V8.53485C14.3334 9.13383 14.3334 9.6333 14.2801 10.0298C14.2238 10.4483 14.1 10.8262 13.7964 11.1299C13.4927 11.4335 13.1149 11.5573 12.6963 11.6136C12.2998 11.6669 11.8003 11.6669 11.2014 11.6668H11.2013H11.132H11.132C10.533 11.6669 10.0335 11.6669 9.63702 11.6136C9.21849 11.5573 8.84062 11.4335 8.53697 11.1299C8.23333 10.8262 8.10955 10.4483 8.05328 10.0298C7.99997 9.6333 7.99998 9.13383 8 8.53485V8.53483V8.4655V8.46548C7.99998 7.8665 7.99997 7.36703 8.05328 6.97051C8.10955 6.55198 8.23333 6.17412 8.53697 5.87047C8.84062 5.56682 9.21849 5.44304 9.63702 5.38677C10.0335 5.33346 10.533 5.33348 11.132 5.3335H11.132H11.2013H11.2014Z"
              fill="#0D0D0D"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M13.3031 0.468494C13.4127 0.82001 13.2165 1.19377 12.865 1.30332C10.7932 1.94897 9.33333 3.78356 9.33333 5.90861V8.66684C9.33333 9.03503 9.03486 9.33351 8.66667 9.33351C8.29848 9.33351 8 9.03503 8 8.66684V5.90861C8 3.14438 9.89438 0.832509 12.4683 0.0303689C12.8198 -0.0791772 13.1936 0.116978 13.3031 0.468494Z"
              fill="#0D0D0D"
            />
            <path
              d="M3.20136 5.3335C3.80033 5.33348 4.29981 5.33346 4.69632 5.38677C5.11485 5.44304 5.49272 5.56682 5.79636 5.87047C6.10001 6.17412 6.22379 6.55198 6.28006 6.97051C6.33337 7.36703 6.33335 7.8665 6.33334 8.46547V8.4655V8.53483V8.53485C6.33335 9.13383 6.33337 9.6333 6.28006 10.0298C6.22379 10.4483 6.10001 10.8262 5.79636 11.1299C5.49272 11.4335 5.11485 11.5573 4.69632 11.6136C4.29981 11.6669 3.80033 11.6669 3.20136 11.6668H3.20133H3.13201H3.13198C2.533 11.6669 2.03353 11.6669 1.63702 11.6136C1.21849 11.5573 0.840619 11.4335 0.536972 11.1299C0.233326 10.8262 0.109545 10.4483 0.0532757 10.0298C-3.45553e-05 9.6333 -1.8843e-05 9.13383 0 8.53485V8.53483V8.4655V8.46548C-1.8843e-05 7.8665 -3.45558e-05 7.36703 0.0532757 6.97051C0.109545 6.55198 0.233326 6.17412 0.536972 5.87047C0.840619 5.56682 1.21849 5.44304 1.63702 5.38677C2.03353 5.33346 2.533 5.33348 3.13198 5.3335H3.132H3.20133H3.20136Z"
              fill="#0D0D0D"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.30314 0.468494C5.41269 0.82001 5.21653 1.19377 4.86502 1.30332C2.79324 1.94897 1.33333 3.78356 1.33333 5.90861V8.66684C1.33333 9.03503 1.03486 9.33351 0.666667 9.33351C0.298477 9.33351 0 9.03503 0 8.66684V5.90861C0 3.14438 1.89438 0.832509 4.46832 0.0303689C4.81983 -0.0791772 5.1936 0.116978 5.30314 0.468494Z"
              fill="#0D0D0D"
            />
          </svg>

          <p class="mb-12">
            {{ testimonial.message }}
          </p>

          <div class="flex flex-row items-center gap-2">
            <img
              :src="testimonial.image"
              :alt="`Profile Image ${i}`"
              loading="lazy"
              decoding="async"
              class="size-8 rounded-md"
            />
            <div>
              <p class="text-foreground font-medium">{{ testimonial.title }}</p>
              <p class="text-sm">{{ testimonial.company }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 md:py-20">
      <div class="mx-auto max-w-xl">
        <div class="text-center">
          <h2 class="text-3xl font-semibold md:text-4xl">
            Stop Tracking Manually. <br class="hidden lg:block" />
            Start Monitoring Smartly.
          </h2>
          <p class="mt-4 mb-16">
            Join a growing community of professionals securing their compliance workflow. Sign up
            for early access today
          </p>
        </div>
        <SqueezeForm />
      </div>
    </section>
  </div>
</template>
