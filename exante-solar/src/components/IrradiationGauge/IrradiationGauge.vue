<template>
  <div class="irradiation-gauge-card">
    <h2 class="text-xl font-semibold text-center mb-2">Your solar irradiation</h2>
    <p class="text-center text-sm mb-4">
      Total expected solar energy this period:<br />
      <strong>{{ expectedKWh }} KWh</strong>
    </p>
    <div ref="chartContainer" class="chart-container">
      <VChart v-if="option" :option="option" autoresize />
    </div>
    <p class="text-center text-sm text-gray-500 mt-2">
      Since {{ formattedStartDate }}, your panels have received {{ irradiationValue }}% of the total expected sun.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  getActualIrradiationTotal,
  getExpectedIrradiationTotal
} from '../../libraries/irradiation'

use([GaugeChart, TooltipComponent, CanvasRenderer])

const option = ref(null)
const chartContainer = ref(null)
const irradiationValue = ref(0)
const expectedKWh = ref(0)
const startDate = ref<Date | null>(null)

const formattedStartDate = computed(() => {
  if (!startDate.value) return ''
  return startDate.value.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

function createOption(value: number) {
  const delta = Math.max(Math.abs(value - 100), 10)
  const buffer = 5
  const spread = delta + buffer

  const min = 100 - spread
  const max = 100 + spread

  return {
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
          formatter: `${value}%`
        },
        data: [{ value }]
      }
    ]
  }
}

async function fetchData() {
  try {
    const base = window.location.origin

    const irrRes = await fetch(`${base}/irradiation.json`)
    const irrText = await irrRes.text()
    const irrData = JSON.parse(irrText)

    const policyRes = await fetch(`${base}/policies.json`)
    const policyText = await policyRes.text()
    const policyData = JSON.parse(policyText)

    const policy = policyData.policies[0]
    const start = new Date(policy.policyStartDate)
    const end = new Date(policy.policyExpireDate)
    startDate.value = start

    const parameter = irrData.parameters[0]
    const actualTotal = getActualIrradiationTotal(parameter.actualValues, start, end)
    const expectedTotal = getExpectedIrradiationTotal(parameter.expectedValues, start, end)

    const percentage = Math.round((actualTotal / expectedTotal) * 100)

    irradiationValue.value = percentage
    expectedKWh.value = Math.round(expectedTotal / 1000)
    option.value = createOption(percentage)
  } catch (error) {
    console.error('Error loading irradiation or policy data:', error)
  }
}

function tryInitChart() {
  if (
    chartContainer.value?.clientWidth > 0 &&
    chartContainer.value?.clientHeight > 0
  ) {
    fetchData()
  } else {
    setTimeout(tryInitChart, 150)
  }
}

onMounted(async () => {
  await nextTick()
  tryInitChart()
  window.addEventListener('resize', tryInitChart)
})
</script>

<style scoped>
.irradiation-gauge-card {
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  background-color: white;
}

.chart-container {
  width: 100%;
  height: 220px;
  position: relative;
}
</style>
