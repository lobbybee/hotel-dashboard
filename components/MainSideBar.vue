<template>
  <div class="flex h-full flex-col bg-surface-0">
    <div class="flex items-center border-b border-surface-200 px-6 pb-4 pt-6 mb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-blue-500 text-xl font-bold text-white">
          LB
        </div>
        <div>
          <h1 class="text-xl font-bold text-surface-900">LobbyBee</h1>
          <p class="text-xs text-surface-600">Hotel CRM</p>
        </div>
      </div>
    </div>
    
    <nav class="flex-1 overflow-y-auto px-2">
      <div class="px-4 pb-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-surface-600">
          {{ userRole === 'manager' || userRole === 'hotel_admin' ? 'Manager' : 'Receptionist' }} Dashboard
        </span>
      </div>
      
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-surface-700 transition-colors duration-200 hover:bg-surface-100 hover:text-surface-900"
          :class="{ 'bg-gradient-to-r from-orange-100 to-blue-100 text-primary-700 font-medium': $route.path === item.href }"
          @click="$emit('navigate')"
        >
          <Icon :name="item.icon" class="h-6 w-6" />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>


defineProps({
  userRole: {
    type: String,
    default: null
  },
  navigation: {
    type: Array,
    default: () => []
  }
})

defineEmits(['navigate'])
</script>
