<script setup lang="ts">
import career1 from '@/assets/images/career1.jpg'
import career3 from '@/assets/images/career3.jpg'
import career4 from '@/assets/images/career4.jpg'
import career5 from '@/assets/images/career5.jpg'
import career6 from '@/assets/images/career6.jpg'
import small1 from '@/assets/images/small1.jpg'
import small2 from '@/assets/images/small2.jpg'
import small3 from '@/assets/images/small3.jpg'
import why1 from '@/assets/images/why1.jpg'
import why2 from '@/assets/images/why2.jpg'
</script>

<template>
  <div class="relative flex min-h-auto flex-col overflow-hidden">
    <div
      class="pointer-events-none absolute top-0 left-1/2 z-0 h-200 w-400 -translate-x-1/2 -translate-y-[60%] rounded-[50%]"
      style="
        background: radial-gradient(
          ellipse,
          var(--color-peach-amber-100) 0%,
          rgba(252, 235, 216, 0.5) 40%,
          rgba(247, 247, 247, 0.8) 70%,
          var(--color-gray-50) 100%
        );
      "
    ></div>

    <!-- CAREER PAGE CONTENT -->
    <section class="relative px-4 py-16 text-center md:py-20">
      <h1 class="text-brand-850 mb-4 text-3xl font-extrabold md:text-4xl lg:text-5xl">
        Build Your Future In Regulatory
      </h1>
      <p class="mx-auto max-w-2xl text-base md:text-lg lg:text-xl">
        Discover exciting opportunities and grow your career in a thriving environment.
      </p>
    </section>

    <section class="app-container relative mx-auto px-4 py-12 md:py-20 lg:px-6">
      <div
        class="grid grid-cols-1 place-items-center gap-8 *:border *:border-gray-300 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div class="career-text-box">
          <p class="italic">It is more than a job, it's a place you learn and grow.</p>
          <div class="flex items-center space-x-3">
            <img :src="small1" class="h-10 w-10 rounded-full object-cover" />
            <div>
              <p class="font-semibold">Piro</p>
              <p class="text-sm">UI/UX Designer</p>
            </div>
          </div>
        </div>

        <!-- IMAGE CARD -->
        <div class="career-img-box">
          <img :src="career1" />
        </div>

        <div class="career-img-box">
          <img :src="career3" />
        </div>

        <div class="career-img-box">
          <img :src="career1" />
        </div>

        <!-- SECOND TEXT CARD -->
        <div class="career-text-box">
          <p>Discover something new and valuable</p>
          <div class="flex items-center space-x-3">
            <img :src="small2" class="h-10 w-10 rounded-full object-cover" />
            <div>
              <p class="font-semibold">Anna</p>
              <p class="text-sm">Product Manager</p>
            </div>
          </div>
        </div>

        <div class="career-img-box">
          <img :src="career4" />
        </div>

        <div class="career-img-box">
          <img :src="career5" />
        </div>

        <div class="career-img-box">
          <img :src="career6" />
        </div>

        <!-- THIRD TEXT CARD -->
        <div class="career-text-box">
          <p>It is more than a job, it's a place you learn and grow.</p>
          <div class="flex items-center space-x-3">
            <img :src="small3" class="h-10 w-10 rounded-full object-cover" />
            <div>
              <p class="font-semibold">Yemi</p>
              <p class="text-sm">UI/UX Designer</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY JOIN US -->
    <section class="relative px-4 py-16 text-center md:py-20">
      <div class="mb-16">
        <h2 class="text-foreground mb-4 text-2xl font-bold md:text-3xl lg:text-4xl">
          Why <span class="text-accent">Join</span> Us
        </h2>
        <p class="mx-auto w-90.75 text-base text-gray-600 md:text-lg">
          Experience a workplace that values your growth, creativity, and well-being.
        </p>
      </div>

      <!-- BENEFITS -->
      <div class="mx-auto max-w-7xl space-y-20">
        <!-- FLEXIBLE WORK ENVIRONMENT -->
        <div class="flex flex-col items-center gap-10 lg:flex-row lg:gap-20">
          <div class="order-2 flex-1 text-center lg:order-1 lg:text-left">
            <h3 class="mb-4 text-2xl font-bold md:text-3xl">Flexible Work Environment</h3>
            <p class="mx-auto max-w-md text-base md:text-lg lg:mx-0">
              Enjoy a healthy work-life with options for remote work and flexible options.
            </p>
          </div>

          <div class="order-1 flex-1 lg:order-2">
            <img :src="why1" class="h-auto w-full rounded-2xl object-cover" />
          </div>
        </div>

        <!-- BENEFIT PACKAGE -->
        <div class="app-container flex flex-col items-center gap-10 lg:flex-row lg:gap-20">
          <div class="flex-1">
            <img :src="why2" class="h-auto w-full rounded-2xl object-cover" />
          </div>

          <div class="flex-1 text-center lg:text-left">
            <h3 class="mb-4 text-2xl font-bold md:text-3xl">Benefit Package</h3>
            <p class="mx-auto max-w-md text-base md:text-lg lg:mx-0">
              Receive competitive compensation, health package and free health care coverage.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@reference "@/assets/styles/main.css";

.career-text-box {
  @apply bg-muted-background flex h-65 w-full max-w-95 flex-col justify-center gap-4 rounded-2xl border p-6;

  & p {
    @apply text-foreground;
  }
  & > p {
    @apply italic;

    &::after {
      content: '';
      @apply mt-4 block w-40 border-b border-gray-700;
    }
  }
}

.career-img-box {
  @apply h-65 w-full max-w-95 overflow-hidden rounded-2xl border;
  & > img {
    @apply h-full w-full object-cover;
  }
}
</style>
