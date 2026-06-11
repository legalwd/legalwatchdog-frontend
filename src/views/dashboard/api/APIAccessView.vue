<script setup lang="ts">
import { ref, computed } from 'vue'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

import GenerateTokenForm from './GenerateTokenForm.vue'
import TokenItem from './TokenItem.vue'

const authStore = useAuthStore()

interface Token {
  id: string
  name: string
  lastUsed?: string
  expiresOn?: string
  isExpired?: boolean
}

const tokens = ref<Token[]>([
  {
    id: '1',
    name: 'Test',
    expiresOn: 'Sat, Jan 3 2026',
  },
  {
    id: '2',
    name: 'Test',
    lastUsed: '2 years ago',
    isExpired: true,
  },
])

const showGenerateForm = ref(false)

const username = computed(() => {
  const email = authStore.user?.email || ''
  return email.split('@')[0] || 'user'
})

// Build token props conditionally to avoid passing undefined
const buildTokenProps = (token: Token) => ({
  name: token.name,
  ...(token.lastUsed ? { lastUsed: token.lastUsed } : {}),
  ...(token.expiresOn ? { expiresOn: token.expiresOn } : {}),
  ...(token.isExpired !== undefined ? { isExpired: token.isExpired } : {}),
})

const openGenerateForm = () => {
  showGenerateForm.value = true
}

const closeGenerateForm = () => {
  showGenerateForm.value = false
}
</script>

<template>
  <main class="min-h-screen flex-1 bg-[#F5F6F8] p-6 lg:p-10">
    <div class="mx-auto flex max-w-5xl flex-col gap-8">
      <template v-if="!showGenerateForm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex flex-col gap-4 sm:w-full">
            <div class="flex w-full items-center justify-between">
              <h1 class="text-3xl font-bold text-[#0F172A]">Fine-grained personal access token</h1>
              <Button
                class="bg-accent-main hidden px-6 py-3 whitespace-nowrap text-white hover:bg-[#2f1202] sm:flex"
                @click="openGenerateForm"
              >
                Generate new token
              </Button>
            </div>
            <p class="text-sm text-[#1F1F1F]">
              These are fine-grained, repository-scoped tokens suitable for personal API use and for
              using Legal Watch Dog over HTTPS
            </p>
          </div>
          <Button
            class="bg-accent-main px-6 py-3 whitespace-nowrap text-white hover:bg-[#2f1202] sm:hidden"
            @click="openGenerateForm"
          >
            Generate new token
          </Button>
        </div>

        <div class="bg-background flex flex-col rounded-md border">
          <TokenItem v-for="token in tokens" :key="token.id" v-bind="buildTokenProps(token)" />
        </div>
      </template>

      <GenerateTokenForm v-else :username="username" @close="closeGenerateForm" />
    </div>
  </main>
</template>
