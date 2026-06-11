<template>
  <div
    class="relative flex flex-col items-start gap-4 rounded-lg border p-3 shadow sm:flex-row sm:items-center"
  >
    <div class="absolute top-4 right-4 z-10 text-gray-500">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 1.33325V14.6666M11.3333 3.33325H6.33333C5.71449 3.33325 5.121 3.57908 4.68342 4.01667C4.24583 4.45425 4 5.04775 4 5.66659C4 6.28542 4.24583 6.87892 4.68342 7.3165C5.121 7.75409 5.71449 7.99992 6.33333 7.99992H9.66667C10.2855 7.99992 10.879 8.24575 11.3166 8.68334C11.7542 9.12092 12 9.71441 12 10.3333C12 10.9521 11.7542 11.5456 11.3166 11.9832C10.879 12.4208 10.2855 12.6666 9.66667 12.6666H4"
          stroke="#71717A"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-3">
          <h3 class="text-sm font-medium text-gray-500">Revenue</h3>
          <p class="text-3xl font-bold">${{ formatNumber(revenue) }}</p>
          <p class="mt-1 text-sm">
            <span class="text-green-500">↑ {{ percentChange }}%</span> vs last month
          </p>
        </div>
      </div>
    </div>

    <div class="h-24 w-full shrink-0 overflow-hidden rounded sm:w-28">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartOptions } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface Props {
  revenue: number
  percentChange: number
  data: number[]
  labels: string[]
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
}))

const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>
