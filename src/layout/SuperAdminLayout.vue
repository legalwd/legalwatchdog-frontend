<template>
  <div class="bg-white">
    <div class="w-full">
      <Navbar v-if="!isLogin" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Navbar from '@/components/super-admin/Navbar.vue'

const route = useRoute()
const isLogin = computed(() => route.name === 'super-admin-login')

// Dedicated layout for Super Admin pages.
</script>
