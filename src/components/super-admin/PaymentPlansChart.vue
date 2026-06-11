<template>
  <div class="rounded-lg border p-6 shadow">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold">Payment Plans</h3>
      <div class="flex gap-2 rounded bg-gray-200 p-0.5">
        <button
          v-for="period in periods"
          :key="period"
          :class="[
            'rounded px-3 py-1 text-sm',
            selectedPeriod === period ? 'bg-white text-gray-600' : 'text-gray-600',
          ]"
          @click="selectedPeriod = period"
        >
          {{ period }}
        </button>
      </div>
    </div>
    <div class="h-80">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
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
import { ref, computed } from 'vue'
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
  datasets: {
    label: string
    data: number[]
    color: string
  }[]
  labels: string[]
}

const props = defineProps<Props>()

const periods = ['Last year', 'Last Month', 'Last Week']
const selectedPeriod = ref('Last year')

// Helper to slice data based on period
function filterDataByPeriod(data: number[], period: string) {
  if (period === 'Last Week') return data.slice(-7)
  if (period === 'Last Month') return data.slice(-30)
  return data // Last year
}

function filterLabelsByPeriod(labels: string[], period: string) {
  if (period === 'Last Week') return labels.slice(-7)
  if (period === 'Last Month') return labels.slice(-30)
  return labels
}

const chartData = computed(() => ({
  labels: filterLabelsByPeriod(props.labels, selectedPeriod.value),
  datasets: props.datasets.map((dataset) => ({
    label: dataset.label,
    data: filterDataByPeriod(dataset.data, selectedPeriod.value),
    borderColor: dataset.color,
    backgroundColor: `${dataset.color}33`,
    fill: true,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 5,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#333',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#6B7280' },
    },
    y: {
      grid: { color: '#F3F4F6' },
      ticks: {
        font: { size: 11 },
        color: '#6B7280',
        callback: (value: string | number) =>
          typeof value === 'number' ? value.toLocaleString() : value,
      },
    },
  },
}))
</script>
