<template>
  <div class="">
    <MainHeader />

    <main>
      <router-view />
    </main>

    <MainFooter />
  </div>
</template>

<script lang="ts">
import MainFooter from '@/components/external-pages/MainFooter.vue'
import MainHeader from '@/components/external-pages/MainHeader.vue'

export default {
  components: { MainHeader, MainFooter },
}
</script>
