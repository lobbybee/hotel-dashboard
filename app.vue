<script setup lang="ts">
const paymentDue = true
</script>

<template>
  <div v-if="paymentDue" style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem">
    <img src="/mrBean.webp" alt="Payment due" style="max-width:min(90vw,400px)">
    <h1 style="font-size:2rem;font-weight:700">Payment due</h1>
  </div>
  <template v-else>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
  <ConfirmDialog />
  </template>
</template>
