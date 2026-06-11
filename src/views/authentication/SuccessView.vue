<script setup lang="ts">
import { ref, onMounted } from 'vue'

import AuthCard from '@/components/authentication/AuthCard.vue'
const redirectSeconds = ref(3)

onMounted(() => {
  const interval = setInterval(() => {
    if (redirectSeconds.value > 0) {
      redirectSeconds.value--
    } else {
      clearInterval(interval)
      console.log('Redirecting to account page...')
    }
  }, 1000)
})
</script>

<template>
  <AuthCard header-text="">
    <div class="flex min-h-screen flex-col bg-gray-50 text-center">
      <main class="h-[calc(100vh-88px)] w-full flex-1 bg-gray-50">
        <div class="flex h-full items-center justify-center p-8 lg:w-1/2">
          <div class="flex h-full flex-col">
            <div class="flex flex-1 flex-col items-center justify-center">
              <div class="w-full max-w-md text-center">
                <div class="mb-6 flex justify-center">
                  <div
                    class="flex h-19.75 w-19.75 items-center justify-center rounded-full bg-green-500"
                  >
                    <svg width="28" height="21" viewBox="0 0 28 21" fill="none">
                      <path
                        d="M2.17 10.88L9.79 18.5L25.03 2.17"
                        stroke="white"
                        stroke-width="4.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <h2 class="mb-1 text-4xl font-medium">Account Created</h2>
                <h2 class="mb-4 text-4xl font-medium">Successful!</h2>
                <p>Redirecting to account page</p>
              </div>
            </div>

            <div class="pb-4 text-center">
              <small class="text-muted text-[15px]">
                &copy; 2025 Legal WatchDog. All Rights Reserved | Terms of Use
              </small>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AuthCard>
</template>
