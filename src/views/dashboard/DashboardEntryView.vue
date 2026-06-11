<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(true)
const message = ref('Redirecting to your organizations...')

const goToDefaultDestination = async () => {
  loading.value = true
  message.value = 'Redirecting to your organizations...'
  try {
    await router.replace({ name: 'organizations' })
  } catch (error) {
    void error
    message.value = 'Unable to redirect. Please select an organization.'
    await router.replace({ name: 'organizations' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void goToDefaultDestination()
})
</script>

<template>
  <section class="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
    <div
      class="bg-background max-w-md rounded-2xl px-6 py-10 text-center shadow-sm ring-1 ring-gray-100"
    >
      <div
        class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200"
        style="border-top-color: var(--color-accent-main)"
      ></div>
      <p class="text-sm font-medium text-gray-800">{{ message }}</p>
      <p v-if="!loading" class="mt-2 text-xs text-gray-500">
        If you're not redirected automatically, please navigate to Organizations.
      </p>
    </div>
  </section>
</template>
