<template>
  <UApp>
    <UContainer class="min-h-screen">
      <UHeader :ui="{ wrapper: 'max-w-6xl mx-auto px-4' }">
        <template #left>
          <div class="w-4 h-4 rounded bg-[var(--ui-color-link)] mr-2" />
          <strong>Zeropoint</strong>
        </template>
        <template #right>
          <UNavigationMenu :items="[
            { label:'Home', to:'/' },
            { label:'Status', to:'/status' },
            { label:'Metrics', to:'/metrics' },
            { label:'Consensus', to:'/consensus' },
            { label:'Audits', to:'/audits' },
            { label:'Library', to:'/library' },
            { label:'Governance', to:'/governance' },
            { label:'Legal', to:'/legal/terms' }
          ]"/>
        </template>
      </UHeader>
      <main class="max-w-6xl mx-auto px-4 py-8">
        <slot />
      </main>
      <USeparator />
      <footer class="max-w-6xl mx-auto px-4 py-6 text-sm text-zinc-400">
        © Zeropoint Protocol. GOD FIRST.
      </footer>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import '~/assets/main.css'
</script>
