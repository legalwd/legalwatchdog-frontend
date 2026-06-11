<template>
  <div
    class="flex flex-col items-start gap-4 rounded-lg border p-3 shadow sm:flex-row sm:items-center"
  >
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-3">
          <h3 class="text-sm font-medium text-gray-500">{{ title }}</h3>
          <p class="text-3xl font-bold">{{ formatNumber(value) }}</p>
          <p class="mt-1 text-sm">
            <span class="text-green-500">↑ {{ percentChange }}%</span> vs last month
          </p>
        </div>
        <div v-if="$slots.icon" class="text-2xl"><slot name="icon" /></div>
        <!-- <div v-else-if="icon" class="text-2xl">{{ icon }}</div> -->
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
  title: string
  value: number
  percentChange: number
  data: number[]
  labels: string[]
  // icon?: string
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
