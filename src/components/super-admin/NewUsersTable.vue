<template>
  <div>
    <div class="border-b border-gray-100 p-6">
      <h3 class="text-lg font-semibold">New Users</h3>
    </div>
    <div class="rounded-lg border shadow">
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-gray-200 rounded-lg">
          <thead class="rounded-lg border-b border-gray-200 bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Users
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Payment Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Registration Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Activity length
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Credit Used
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Amount Spent
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="(user, index) in users" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200"
                  >
                    {{ user.avatar }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">Last Active: {{ user.lastActive }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold',
                    user.paymentStatus === 'Paid'
                      ? 'bg-green-100 text-green-800'
                      : user.paymentStatus === 'Free'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800',
                  ]"
                >
                  {{ user.paymentStatus }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {{ formatDate(user.registrationDate) }}
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {{ user.activityLength }}
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {{ user.creditUsed }}
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                ${{ user.amountSpent }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  name: string
  avatar: string
  lastActive: string
  paymentStatus: string
  registrationDate: string
  activityLength: string
  creditUsed: number
  amountSpent: number
}

interface Props {
  users: User[]
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
