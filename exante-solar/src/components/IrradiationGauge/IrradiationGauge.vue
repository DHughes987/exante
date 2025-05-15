<template>
  <div class="w-full max-w-[550px] mx-auto p-6 bg-white rounded-2xl shadow-lg">
    <h2 class="text-xl font-semibold text-center mb-2">Your solar irradiation</h2>
    <p class="text-center text-sm mb-4">
      Total expected solar energy this period:<br />
      <strong>{{ expectedKWh }} KWh</strong>
    </p>
    <div ref="chartContainer" class="w-full h-[220px] relative">
      <VChart v-if="option" :option="option" autoresize />
    </div>
    <p class="text-center text-sm text-gray-500 mt-2">
      Since {{ formattedStartDate }}, your panels have received {{ irradiationValue }}% of the total expected sun.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([GaugeChart, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  actual: number
  expected: number
  startDate: string
}>()

const irradiationValue = ref(0)
const expectedKWh = ref(0)
const option = ref(null)

const formattedStartDate = computed(() =>
  new Date(props.startDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
)

watch(
  () => [props.actual, props.expected],
  ([actual, expected]) => {
    if (!expected || !actual) return

    const percentage = Math.round((actual / expected) * 100)
    irradiationValue.value = percentage
    expectedKWh.value = Math.round(expected / 1000)

    const delta = Math.max(Math.abs(percentage - 100), 10)
    const buffer = 5
    const spread = delta + buffer
    const min = 100 - spread
    const max = 100 + spread

    option.value = {
      title: {
        show: true,
        text: 'Total Solar Irradiation',
        left: 'center',
        top: '80%',
        textStyle: {
          color: '#6b7280',
          fontSize: 14,
          fontWeight: '500'
        }
      },
      series: [
        {
          type: 'gauge',
          center: ['50%', '75%'],
          startAngle: 180,
          endAngle: 0,
          min,
          max,
          splitNumber: 2,
          progress: {
            show: true,
            width: 16,
            itemStyle: {
              color: '#0ea5e9'
            }
          },
          axisLine: {
            lineStyle: {
              width: 16,
              color: [[1, '#e5e7eb']]
            }
          },
          splitLine: {
            distance: -18,
            length: 14,
            lineStyle: { color: '#9ca3af', width: 2 }
          },
          axisLabel: {
            distance: -32,
            color: '#6b7280',
            fontSize: 12,
            fontWeight: 'bold',
            formatter: (val: number) => {
              const rounded = Math.round(val)
              return [min, 100, max].includes(rounded) ? `${rounded}%` : ''
            }
          },
          axisTick: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 24,
            offsetCenter: [0, '-30%'],
            color: '#111827',
            formatter: `${percentage}%`
          },
          data: [{ value: percentage }]
        }
      ]
    }
  },
  { immediate: true }
)
</script>