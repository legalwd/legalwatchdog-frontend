<template>
  <div class="rounded-lg border p-6 shadow">
    <div class="mb-4 flex items-start justify-between">
      <div>
        <h3 class="mb-2 text-lg font-semibold">AI Credit Consumption</h3>

        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold">{{ formatNumber(total) }}</span>

          <select class="ml-2 rounded border border-gray-300 px-2 py-1 text-sm">
            <option value="token">Token</option>
          </select>
        </div>

        <p class="mt-1 text-sm text-green-500">
          <span v-if="percentChange >= 0">↑ {{ percentChange }}%</span>
          <span v-else>↓ {{ Math.abs(percentChange) }}%</span>
          &nbsp;vs last month
        </p>
      </div>

      <!-- View selector -->
      <select v-model="selectedView" class="rounded border border-gray-300 px-3 py-1 text-sm">
        <option v-for="view in views" :key="view" :value="view">
          {{ view }}
        </option>
      </select>
    </div>

    <div class="h-80">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { TooltipItem } from 'chart.js'
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: number[]
  labels: string[]
  total: number
  percentChange: number
}

const props = defineProps<Props>()

const total = computed(() => props.total ?? 0)
const percentChange = computed(() => Math.round((props.percentChange ?? 0) * 100) / 100)

const views = ['Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily'] as const
const selectedView = ref<(typeof views)[number]>('Yearly')

const chunk = (arr: number[], size: number) => {
  const result: number[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

const viewData = computed(() => {
  const data = props.data ?? []
  const labels = props.labels ?? []

  switch (selectedView.value) {
    case 'Quarterly': {
      const chunks = chunk(data, 3)
      return {
        labels: chunks.map((_, i) => `Q${i + 1}`),
        data: chunks.map((c) => c.reduce((a, b) => a + b, 0)),
      }
    }

    case 'Monthly':
      return {
        labels,
        data,
      }

    case 'Weekly': {
      const chunks = chunk(data, 7)
      return {
        labels: chunks.map((_, i) => `Week ${i + 1}`),
        data: chunks.map((c) => c.reduce((a, b) => a + b, 0)),
      }
    }

    case 'Daily':
      return {
        labels,
        data,
      }

    case 'Yearly':
    default:
      return {
        labels: ['Year'],
        data: [data.reduce((a, b) => a + b, 0)],
      }
  }
})

const chartData = computed(() => ({
  labels: viewData.value.labels,
  datasets: [
    {
      data: viewData.value.data,
      backgroundColor: '#401903',
      borderRadius: 4,
      barThickness: selectedView.value === 'Yearly' ? 80 : 40,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const value =
            typeof context.parsed === 'number'
              ? context.parsed
              : ((context.parsed as { y?: number })?.y ?? 0)

          return `${value.toLocaleString()} tokens`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 11 },
        color: '#6B7280',
      },
    },
    y: {
      grid: { color: '#F3F4F6' },
      ticks: {
        font: { size: 11 },
        color: '#6B7280',
        callback: (val: number | string) =>
          (typeof val === 'number' ? val : Number(val)).toLocaleString(),
      },
    },
  },
}))

const formatNumber = (num?: number | null) => (num ?? 0).toLocaleString()
</script>
