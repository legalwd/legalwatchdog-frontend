<script setup lang="ts">
import MainHeader from '@/components/external-pages/MainHeader.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <MainHeader />
    <main class="container--wide flex-1 overflow-y-auto py-6">
      <router-view />
    </main>
  </div>
</template>
