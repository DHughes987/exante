<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-xl font-semibold mb-4">Solar Irradiation</h1>
    <IrradiationGauge :actual="latestValue" :expected="expectedValue" />
  </div>
</template>

<script setup lang="ts">
import Irradiation from '../public/Irradiation.json'
import IrradiationGauge from './components/IrradiationGauge/IrradiationGauge.vue'

const latestEntry = Irradiation.parameters[0].actualValues.at(-1)
const latestValue = parseFloat(latestEntry.value)
const expectedValue = 850
</script>
