<template>
  <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
    <div>
      <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <i class="pi pi-comments text-primary-500"></i> Message Flow Templates
      </h1>
      <p class="text-gray-500">Customize the automated conversation flows for your hotel.</p>
    </div>
  </header>
</template>

<script setup lang="ts">
// No script needed for this simple component
</script>

<style scoped>
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
