<template>
  <div class="rounded-lg border border-gray-200 p-3 shadow-sm">
    <div class="">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="mb-1 text-sm font-medium text-gray-500">Paying users</h3>
        </div>
        <div class="text-gray-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1.33325V14.6666M11.3333 3.33325H6.33333C5.71449 3.33325 5.121 3.57908 4.68342 4.01667C4.24583 4.45425 4 5.04775 4 5.66659C4 6.28542 4.24583 6.87892 4.68342 7.3165C5.121 7.75409 5.71449 7.99992 6.33333 7.99992H9.66667C10.2855 7.99992 10.879 8.24575 11.3166 8.68334C11.7542 9.12092 12 9.71441 12 10.3333C12 10.9521 11.7542 11.5456 11.3166 11.9832C10.879 12.4208 10.2855 12.6666 9.66667 12.6666H4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex items-start gap-6">
      <div class="relative m-0 h-0 w-40 shrink-0 p-0">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="absolute inset-0 top-14 flex flex-col items-center justify-center">
          <p class="text-xs text-gray-700">Payment Plans</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatNumber(total) }}</p>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex-1">
        <div class="grid grid-cols-1 gap-1">
          <div v-for="(item, index) in breakdown" :key="index" class="flex items-center">
            <div class="ml-2 flex items-center gap-1">
              <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }"></div>
              <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

interface BreakdownItem {
  label: string
  value: number
  color: string
}

interface Props {
  total: number
  breakdown: BreakdownItem[]
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.breakdown.map((item) => item.label),
  datasets: [
    {
      data: props.breakdown.map((item) => item.value),
      backgroundColor: props.breakdown.map((item) => item.color),
      borderWidth: 0,
      circumference: 180,
      rotation: -90,
      cutout: '75%',
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  layout: {
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
}))

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
