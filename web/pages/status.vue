<script setup lang="ts">
const { data: h } = await useFetch('/api/healthz')
const { data: r } = await useFetch('/api/readyz')
</script>

<template>
  <UCard>
    <template #header>
      <h1>Status</h1>
    </template>
    <ul class="space-y-1">
      <li>commit: {{ h?.commit || 'unknown' }}</li>
      <li>built: {{ h?.buildTime || 'unknown' }}</li>
      <li>healthz: {{ h?.status || 'fail' }}</li>
      <li>readyz: {{ String(r?.ready ?? false) }}</li>
    </ul>
  </UCard>
</template>
