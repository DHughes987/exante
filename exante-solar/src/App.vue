<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">Solar Irradiation</h1>
    <IrradiationGauge
      v-if="actual !== null && expected !== null && startDate !== null"
      :actual="actual"
      :expected="expected"
      :startDate="startDate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IrradiationGauge from './components/IrradiationGauge/IrradiationGauge.vue'
import {
  getActualIrradiationTotal,
  getExpectedIrradiationTotal
} from './libraries/irradiation'

const actual = ref<number | null>(null)
const expected = ref<number | null>(null)
const startDate = ref<string | null>(null)

onMounted(async () => {
  const irrRes = await fetch('/irradiation.json')
  const irrData = await irrRes.json()

  const policyRes = await fetch('/policies.json')
  const policyData = await policyRes.json()

  const policy = policyData.policies[0]
  const start = new Date(policy.policyStartDate)
  const end = new Date(policy.policyExpireDate)
  startDate.value = start.toISOString()

  const parameter = irrData.parameters[0]
  actual.value = getActualIrradiationTotal(parameter.actualValues, start, end)
  expected.value = getExpectedIrradiationTotal(parameter.expectedValues, start, end)
})
</script>
