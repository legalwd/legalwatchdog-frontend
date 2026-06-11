<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && customer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        style="overflow: hidden"
        @click.self="$emit('close')"
      >
        <div
          class="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl"
        >
          <!-- Content -->
          <div class="h-full max-h-[90vh] overflow-y-auto p-8">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="error" class="py-12 text-center">
              <p class="text-red-600">{{ error }}</p>
              <button
                class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                @click="fetchCustomerDetails"
              >
                Retry
              </button>
            </div>

            <!-- User Profile Section -->
            <div v-else-if="customerDetail" class="space-y-6">
              <!-- Top Section: Profile + Stats -->
              <div class="flex items-start gap-2">
                <!-- Left: Profile Info -->
                <div class="flex w-2/5 flex-col items-center gap-4">
                  <div
                    class="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-center text-3xl font-semibold text-gray-600"
                  >
                    {{ (customerDetail.profile.name?.[0] || '?').toUpperCase() }}
                  </div>

                  <div>
                    <h3 class="text-center text-[20px] font-semibold text-gray-900">
                      {{ customerDetail.profile.name }}
                    </h3>
                    <p class="text-center text-sm text-gray-500">
                      {{ customerDetail.profile.email }}
                    </p>

                    <div class="mt-4 space-y-4 text-sm">
                      <div class="flex items-center gap-3">
                        <span class="w-24 text-gray-900">Last Active</span>
                        <span
                          class="w-40 rounded border border-gray-200 px-3 py-1 text-xs text-gray-500"
                        >
                          {{ formatDate(customerDetail.profile.last_active) || 'Never' }}
                        </span>
                      </div>

                      <div class="flex items-center gap-3">
                        <span class="w-24 text-gray-900">Last Log-In</span>
                        <span
                          class="w-40 rounded border border-gray-200 px-3 py-1 text-xs text-gray-500"
                        >
                          {{ formatDate(customerDetail.profile.last_active) || 'Never' }}
                        </span>
                      </div>

                      <div class="flex items-center gap-3">
                        <span class="w-24 text-gray-900">Activity</span>
                        <span
                          class="w-40 rounded border border-gray-200 px-3 py-1 text-xs text-gray-500"
                        >
                          {{ customer.activityLength || 'N/A' }}
                        </span>
                      </div>

                      <div class="flex items-center gap-3">
                        <span class="w-24 text-gray-900">Referrals</span>
                        <span
                          class="w-40 rounded border border-gray-200 px-3 py-1 text-xs text-gray-500"
                        >
                          {{ customer.referrals || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: Stats Cards -->
                <div class="flex w-full flex-col gap-3">
                  <div class="flex w-full gap-4">
                    <div class="w-full rounded-lg border border-gray-200 p-4">
                      <div class="flex items-center justify-between">
                        <p class="text-xs text-gray-500">Total Credit Used</p>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          class="text-gray-400"
                        >
                          <path
                            d="M8 4V12M4 8H12"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                      <p class="mt-2 text-[28px] font-semibold text-gray-900">
                        {{ customerDetail.profile.credits_used }}
                      </p>
                      <p class="mt-1 text-xs text-gray-400">+201 since last hour</p>
                    </div>

                    <div class="w-full rounded-lg border border-gray-200 p-4">
                      <div class="flex items-center justify-between">
                        <p class="text-xs text-gray-500">Total Amount Spent</p>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          class="text-gray-400"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                      <p class="mt-2 text-[28px] font-semibold text-gray-900">
                        ${{ formatCurrency(customerDetail.profile.amount_spent) }}
                      </p>
                      <p class="mt-1 text-xs text-gray-400">+$1.5 since last hour</p>
                    </div>
                  </div>

                  <div class="mt-4 flex justify-center gap-4">
                    <button
                      :disabled="loading"
                      class="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      @click="activateCustomer"
                    >
                      Activate
                    </button>

                    <button
                      :disabled="loading"
                      class="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      @click="deactivateCustomer"
                    >
                      Deactivate
                    </button>
                  </div>

                  <!-- App Usage Section -->
                  <div class="rounded-lg border border-gray-200 p-6">
                    <div class="mb-4 flex items-center justify-between">
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900">App Usage</h4>
                        <p class="text-sm text-gray-500">How features are used</p>
                      </div>
                    </div>

                    <div class="relative mb-4">
                      <svg
                        class="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search"
                        class="w-3/5 rounded-md border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div class="overflow-hidden rounded-lg border border-gray-200">
                      <div
                        class="grid grid-cols-3 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3"
                      >
                        <div class="text-xs font-medium text-gray-500">Features</div>
                        <div class="text-center text-xs font-medium text-gray-500">
                          Credits used
                        </div>
                        <div class="text-center text-xs font-medium text-gray-500">Usage</div>
                      </div>

                      <div class="bg-white">
                        <div
                          v-for="(feature, index) in paginatedFeatures"
                          :key="`${feature.feature}-${index}`"
                          class="grid grid-cols-3 gap-4 border-b border-gray-100 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
                        >
                          <div class="text-sm text-gray-900">{{ feature.feature }}</div>
                          <div class="text-center text-sm text-gray-700">
                            {{ feature.credits_used }}
                          </div>
                          <div class="text-center text-sm text-gray-700">
                            {{ feature.usage_count }}
                          </div>
                        </div>

                        <div
                          v-if="filteredFeatures.length === 0"
                          class="py-12 text-center text-sm text-gray-400"
                        >
                          No feature usage data available
                        </div>
                      </div>

                      <div
                        class="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3"
                      >
                        <div class="text-sm text-gray-500">
                          Page {{ currentPage }} of {{ totalPages }}
                        </div>

                        <div class="flex gap-2">
                          <button
                            class="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            :disabled="!hasPrev"
                            @click="prevPage"
                          >
                            Previous
                          </button>

                          <button
                            class="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            :disabled="!hasNext"
                            @click="nextPage"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'

import { superadminCustomersService } from '@/api/super-admin-customers'

interface CustomerRow {
  id: string
  name: string
  avatar: string
  lastActive: string
  paymentStatus: string
  lastLogin: string
  activityLength: string
  referrals: number
  creditUsed: number
  amountSpent: number
  registrationTimestamp: number
}

interface Props {
  isOpen: boolean
  user: CustomerRow | null
}

interface CustomerDetail {
  profile: {
    id: string
    name: string
    email: string
    payment_status: string
    credits_used: number
    amount_spent: number
    registration_date: string
    last_active: string | null
    is_approved: boolean
  }
  feature_usage: Array<{
    feature: string
    credits_used: number
    usage_count: number
  }>
}

const props = defineProps<Props>()
defineEmits<{
  (e: 'close'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const customerDetail = ref<CustomerDetail | null>(null)

const customer = computed(() => props.user)
const searchQuery = ref('')
const pageSize = ref(5)
const currentPage = ref(1)

const filteredFeatures = computed(() => {
  const list = customerDetail.value?.feature_usage ?? []
  const q = searchQuery.value.trim().toLowerCase()

  if (!q) return list

  return list.filter((f) => {
    return (
      f.feature.toLowerCase().includes(q) ||
      String(f.credits_used).includes(q) ||
      String(f.usage_count).includes(q)
    )
  })
})

// Total pages
const totalPages = computed(() => {
  const count = filteredFeatures.value.length
  return Math.max(1, Math.ceil(count / pageSize.value))
})

// Current page slice
const paginatedFeatures = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFeatures.value.slice(start, end)
})

const hasPrev = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < totalPages.value)

function nextPage() {
  if (!hasNext.value) return
  currentPage.value += 1
}

function prevPage() {
  if (!hasPrev.value) return
  currentPage.value -= 1
}
watch(searchQuery, () => {
  currentPage.value = 1
})

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && customer.value) {
      document.body.style.overflow = 'hidden'
      searchQuery.value = ''
      currentPage.value = 1
      await fetchCustomerDetails()
    } else {
      document.body.style.overflow = ''
      customerDetail.value = null
      error.value = null
      searchQuery.value = ''
      currentPage.value = 1
    }
  },
)

// Cleanup on component unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})

async function activateCustomer() {
  if (!customerDetail.value) return

  loading.value = true
  error.value = null

  try {
    await superadminCustomersService.activateCustomer(customerDetail.value.profile.id)
    toast.success('Customer activated successfully')
  } catch (err) {
    toast.error('Failed to activate customer')
    console.error('Error activating customer:', err)
  } finally {
    loading.value = false
  }
}

async function deactivateCustomer() {
  if (!customerDetail.value) return

  loading.value = true
  error.value = null

  try {
    await superadminCustomersService.deactivateCustomer(customerDetail.value.profile.id)
    toast.success('Customer deactivated successfully')
  } catch (err) {
    toast.error('Failed to deactivate customer')
    console.error('Error deactivating customer:', err)
  } finally {
    loading.value = false
  }
}

async function fetchCustomerDetails() {
  if (!customer.value) return

  loading.value = true
  error.value = null

  try {
    const res = await superadminCustomersService.getCustomerDetail(customer.value.id)

    const payload = res.data

    const isOk =
      payload?.status === 'SUCCESS' || payload?.status === 'success' || payload?.status_code === 200

    if (!isOk) {
      error.value = payload?.message || 'Failed to fetch customer details'
      return
    }

    const data = payload.data

    customerDetail.value = {
      profile: {
        id: data.profile.id,
        name: data.profile.name,
        email: data.profile.email,
        payment_status: data.profile.payment_status,
        credits_used: data.profile.credits_used,
        amount_spent: data.profile.amount_spent,
        registration_date: data.profile.registration_date,
        last_active: data.profile.last_active,
        is_approved: data.profile.is_approved ?? true,
      },
      feature_usage: Array.isArray(data.feature_usage) ? data.feature_usage : [],
    }
  } catch (err) {
    error.value = 'An error occurred while fetching customer details'
    console.error('Error fetching customer details:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
