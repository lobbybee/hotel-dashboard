<template>
  <div class="flex h-full flex-col bg-white">
    <div class="flex items-center border-b border-gray-200 px-6 pb-4 pt-6 mb-4">
      <div class="flex items-center gap-3">
          <div>
              <img src="/logo.png" alt="LobbyBee Logo" class="h-8" />
          </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">LobbyBee</h1>
          <p class="text-xs text-gray-600">Hotel Dashboard</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-2">
      <div class="px-4 pb-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {{ roleLabel }} Dashboard
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
          :class="{ 'bg-blue-100 text-blue-700 font-semibold': $route.path === item.href }"
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
const props = defineProps({
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

const getRoleLabel = (role) => {
  const roleLabels = {
    'hotel_admin': 'Hotel Admin',
    'manager': 'Manager',
    'receptionist': 'Receptionist',
    'department_staff': 'Department Staff',
    'other_staff': 'Other Staff'
  };
  return roleLabels[role] || role;
};

const roleLabel = computed(() => getRoleLabel(props.userRole));
</script>
