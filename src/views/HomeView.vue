<script setup lang="ts">
// import DashboardPreview from '@/components/external-pages/DashboardPreview.vue'
import FeaturesSection from '@/components/external-pages/FeaturesSection.vue'
import GlobalStatsSection from '@/components/external-pages/GlobalStatsSection.vue'
import HeroSection from '@/components/external-pages/HeroSection.vue'
import HomeFrame from '@/components/external-pages/HomeFrame.vue'
import HowItWorks from '@/components/external-pages/HowItWorks.vue'
import StrategicAdvantageCTA from '@/components/external-pages/StrategicAdvantageCTA.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <main
      class="relative mx-auto flex w-full flex-1 flex-col overflow-hidden"
      style="background-color: var(--color-gray-50)"
    >
      <div
        class="pointer-events-none absolute top-0 left-1/2 z-0 h-200 w-400 -translate-x-1/2 -translate-y-[60%] rounded-[50%]"
        style="
          background: radial-gradient(
            ellipse,
            #f8d9c5 0%,
            rgba(248, 217, 197, 0.5) 40%,
            rgba(247, 247, 247, 0.8) 70%,
            #f7f7f7 100%
          );
        "
      ></div>
      <HeroSection />
      <!-- <DashboardPreview /> -->
      <HowItWorks />
      <HomeFrame />
      <FeaturesSection />
      <GlobalStatsSection />
      <StrategicAdvantageCTA />
    </main>
  </div>
</template>
