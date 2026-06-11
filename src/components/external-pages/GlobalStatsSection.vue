<script setup lang="ts">
// Import images
import Map from '@/assets/images/mapbase.webp'
</script>

<template>
  <div class="w-full">
    <section class="app-container px-4 py-12 sm:px-6 lg:py-24">
      <div class="bg-background rounded-2xl p-6 shadow-xl sm:p-8 md:p-10">
        <div class="mx-auto max-w-3xl space-y-4 text-center sm:space-y-6">
          <h2 class="text-2xl font-bold sm:text-3xl lg:text-4xl">
            Introducing Legal WatchDog Platform
          </h2>

          <p class="mx-auto max-w-full sm:max-w-150 lg:max-w-175 lg:text-lg">
            Our AI monitors and summarizes updates from verified sources across continents, ensuring
            nothing slips through the cracks.
          </p>
          <!-- Map Image -->
          <div class="flex justify-center pt-4 sm:pt-6">
            <img
              :src="Map"
              alt="World Map"
              loading="lazy"
              decoding="async"
              class="w-full max-w-md sm:max-w-xl lg:max-w-2xl"
            />
          </div>

          <!-- Stats -->
          <!-- <div class="grid grid-cols-1 gap-6 pt-6 text-start sm:grid-cols-3 sm:gap-8 sm:pt-8">
            <div>
              <p class="text-foreground text-2xl font-bold sm:text-3xl lg:text-4xl">5,000+</p>
              <p class="text-xs sm:text-sm">Data Sources Worldwide</p>
            </div>

            <div>
              <p class="text-foreground text-2xl font-bold sm:text-3xl lg:text-4xl">200+</p>
              <p class="text-xs sm:text-sm">Countries being monitored</p>
            </div>

            <div>
              <p class="text-foreground text-2xl font-bold sm:text-3xl lg:text-4xl">100%</p>
              <p class="text-xs sm:text-sm">Regulatory Compliance Assured</p>
            </div>
          </div> -->
        </div>
      </div>
    </section>
  </div>
</template>
