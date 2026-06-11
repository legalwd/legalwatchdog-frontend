<script setup lang="ts">
import {
  Calendar03Icon,
  Copy01Icon,
  EarthIcon,
  Notification01Icon,
  ShieldUserIcon,
  User02Icon,
} from '@hugeicons/core-free-icons'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted } from 'vue'

import Icon from '@/components/reusable/Icon.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'

interface Props {
  username?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  username: 'user',
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const organizationStore = useOrganizationStore()
const { organizations } = storeToRefs(organizationStore)

const isTokenGenerated = ref(false)
const apiKey = ref('')

const tokenName = ref('')
const description = ref('')
const resourceOwner = ref(props.username)
const organization = ref('')
const expiration = ref('7')

const selectedOrganization = computed({
  get: () => organization.value,
  set: (value: string) => {
    organization.value = value
    // Automatically switch the current organization when user selects a different one
    if (value && value !== 'no-org') {
      organizationStore.setCurrentOrganization(value)
    }
  },
})

const getExpirationDate = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const expirationOptions = computed(() => [
  { value: '7', label: `7 days (${getExpirationDate(7)})` },
  { value: '30', label: `30 days (${getExpirationDate(30)})` },
  { value: '60', label: `60 days (${getExpirationDate(60)})` },
  { value: '90', label: `90 days (${getExpirationDate(90)})` },
  { value: 'never', label: 'No expiration' },
])

const selectedExpirationLabel = computed(() => {
  const option = expirationOptions.value.find((opt) => opt.value === expiration.value)
  return option?.label || ''
})

onMounted(async () => {
  const userId = authStore.user?.id
  if (userId && organizations.value.length === 0) {
    await organizationStore.fetchOrganizations(userId)
  }
  // Use current organization as default, fallback to first organization if none selected
  if (organizationStore.currentOrganizationId) {
    organization.value = organizationStore.currentOrganizationId
  } else if (organizations.value.length > 0 && organizations.value[0]) {
    organization.value = organizations.value[0].id
  }
})

const closeForm = () => {
  emit('close')
}

const generateToken = () => {
  console.log('Generating token...', {
    tokenName: tokenName.value,
    description: description.value,
    resourceOwner: resourceOwner.value,
    organization: organization.value,
    expiration: expiration.value,
  })
  isTokenGenerated.value = true
  apiKey.value =
    'github_pat_11AJRQ6BI0p7cCVBzAMdJ8_hfUX1M1Cb2WvHYAw3Q8IrMLhaKPLnchMsV5T9B4kqsV6HYJKINIS9eB'
  closeForm()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(apiKey.value)
    console.log('Token copied to clipboard')
  } catch (err) {
    console.error('Failed to copy token:', err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-6">
      <h1 class="border-b border-b-[#E5E7EB] pb-6 text-3xl font-bold text-[#1F1F1F]">
        New fine-grained personal access token
      </h1>
      <p class="text-xl font-bold text-[#1F1F1F]">
        Create a fine-grained, organization-scoped token suitable for personal API use and for using
        Legal WatchDog over HTTPS.
      </p>
    </div>

    <form class="flex flex-col gap-14" @submit.prevent="generateToken">
      <div class="flex flex-col gap-1 space-y-2">
        <label class="text-sm font-semibold text-[#0F172A]" for="token-name"> Token Name </label>
        <Input
          id="token-name"
          v-model="tokenName"
          placeholder="Enter token name"
          class="bg-background h-11 rounded-md border-[#E5E7EB]! text-sm shadow-none"
        />
        <p class="text-xs text-[#6B7280]">
          A unique name for this token, may be visible to resource owners or users with possession
          of the token.
        </p>
      </div>

      <div class="flex flex-col gap-1 space-y-2">
        <label class="text-sm font-semibold text-[#0F172A]" for="description"> Description </label>
        <textarea
          id="description"
          v-model="description"
          placeholder="Enter description"
          class="focus-visible:ring-accent-main bg-background flex min-h-[100px] w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:outline-none"
        />
      </div>

      <div
        class="flex w-full flex-col items-center justify-between gap-9 space-y-2 overflow-hidden sm:flex-row"
      >
        <div class="flex flex-col gap-3 space-y-2 sm:w-1/2">
          <label class="text-sm font-semibold text-[#0F172A]"> Resource owner </label>
          <Select v-model="resourceOwner">
            <SelectTrigger
              id="resource-owner"
              class="h-11 w-full cursor-pointer rounded-md border-[#E5E7EB] text-sm sm:w-[336px]"
            >
              <div class="flex items-center gap-2">
                <Icon :icon="User02Icon" :size="20" color="var(--color-gray-800)" />
                <SelectValue :placeholder="resourceOwner" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="username">{{ username }}</SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-[#6B7280]">
            The token will be able to make changes to organization owned by the selected
            organization owner. Tokens can always read all organization activities.
          </p>
        </div>
        <div class="flex flex-col gap-3 space-y-2 sm:w-1/2">
          <label class="text-sm font-semibold text-[#0F172A]"> Organization </label>
          <Select v-model="selectedOrganization">
            <SelectTrigger
              id="organization"
              class="h-11 w-full cursor-pointer rounded-md border-[#E5E7EB] text-sm sm:w-[336px]"
            >
              <div class="flex items-center gap-2">
                <Icon :icon="EarthIcon" :size="24" color="var(--color-gray-800)" />
                <SelectValue placeholder="Select organization" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-if="organizations.length === 0" value="no-org" disabled>
                No organizations available
              </SelectItem>
              <SelectItem v-for="org in organizations" :key="org.id" :value="org.id">
                {{ org.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-[#6B7280]">
            The token will be able to make changes to resources owned by the selected organization.
            Selecting a different organization will switch your current workspace.
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-9 space-y-2 overflow-hidden sm:flex-row">
        <div class="flex w-full flex-col gap-3 space-y-2 sm:w-1/2">
          <label class="text-sm font-semibold text-[#0F172A]">Expiration</label>
          <Select v-model="expiration">
            <SelectTrigger
              id="expiration"
              class="h-11 w-full cursor-pointer rounded-md border-[#E5E7EB] text-sm sm:w-[336px]"
            >
              <div class="flex items-center gap-2">
                <Icon :icon="Calendar03Icon" :size="24" color="var(--color-gray-800)" />
                <SelectValue :placeholder="selectedExpirationLabel" class="cursor-pointer" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in expirationOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-[#6B7280]">This token will expire on the selected date</p>
        </div>
        <div class="flex w-full flex-col gap-3 space-y-2 sm:w-1/2">
          <label class="text-sm font-semibold text-[#0F172A]">Scope</label>
          <Select v-model="expiration">
            <SelectTrigger
              id="scope"
              class="h-11 w-full cursor-pointer rounded-md border-[#E5E7EB] text-sm sm:w-[336px]"
            >
              <div class="flex items-center gap-2">
                <Icon :icon="ShieldUserIcon" :size="24" color="var(--color-gray-800)" />
                <SelectValue :placeholder="selectedExpirationLabel" class="cursor-pointer" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in expirationOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-[#6B7280]">
            Set permissions for this token to control read or download access
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          class="border-[#E5E7EB] px-6 py-2 text-[#0F172A] hover:bg-[#F5F6F8]"
          @click="closeForm"
        >
          Cancel
        </Button>
        <Button type="submit" class="bg-accent-main px-6 py-2 text-white hover:bg-[#2f1202]">
          Generate token
        </Button>
      </div>
    </form>
    <section
      v-if="isTokenGenerated"
      class="bg-background/75 fixed top-0 left-0 z-99 flex h-screen w-full items-center justify-center p-4 shadow-md"
    >
      <div
        class="flex w-full items-start justify-between gap-1 rounded-md bg-[#EDEDED] p-4 sm:w-[500px] lg:w-[700px]"
      >
        <div class="bg-background mr-3 shrink-0 rounded-full p-2">
          <Icon :icon="Notification01Icon" :size="24" color="var(--color-gray-800)" />
        </div>
        <div class="flex flex-1 flex-col gap-3">
          <p class="text-xs">
            Make sure to copy your personal access token now as you will not be able to see this
            again
          </p>
          <p class="rounded-sm bg-[#CDCDCD] px-4 py-2 text-xs break-all text-[#080808]">
            {{ apiKey }}
          </p>
        </div>
        <button type="button" class="shrink-0 self-center" @click="copyToClipboard">
          <Icon :icon="Copy01Icon" :size="24" color="var(--color-gray-800)" />
        </button>
      </div>
    </section>
  </div>
</template>
