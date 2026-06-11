<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <main class="flex flex-1 items-center justify-center px-6 py-12">
      <div class="bg-background max-w-2xl rounded-2xl p-10 text-center shadow-xl">
        <p class="text-accent text-xs font-semibold tracking-[0.2em] uppercase">Onboarding</p>
        <h1 class="mt-2 mb-4 text-3xl font-bold">Let's Get To Know Your Firm</h1>
        <p class="mx-auto mb-8 max-w-xl">
          This is the space where we'll collect the final details we need before activating your
          personalised Legal Watchdog workspace. Once submitted, you'll be redirected to verify your
          access with a one-time password and then straight into your dashboard.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-dashed p-4 text-left">
            <p class="text-foreground text-sm font-semibold">Organisation Profile</p>
            <p class="mt-1 text-xs">Tell us about your structure, size, and key jurisdictions.</p>
          </div>
          <div class="rounded-xl border border-dashed p-4 text-left">
            <p class="text-foreground text-sm font-semibold">Compliance Needs</p>
            <p class="mt-1 text-xs">Share the regulatory work we're monitoring for you.</p>
          </div>
        </div>
        <Button type="button" class="mt-10"> Continue to Onboarding Form </Button>
      </div>
    </main>
  </div>
</template>
