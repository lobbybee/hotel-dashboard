<template>
  <div class="p-8 bg-gray-50 min-h-full">


    <!-- Date/Time -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Receptionist Dashboard</h2>
      <p class="text-sm text-gray-500 mt-1">{{ nowString }}</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-2xl shadow-sm">
        <div class="animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div class="h-12 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg" role="alert">
      <p class="font-semibold">Error</p>
      <p>Something went wrong while fetching dashboard data. Please try again later.</p>
    </div>

    <!-- Stats grid - matches the image exactly -->
    <div v-else-if="stats && Object.keys(stats).length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(value, key) in stats"
        :key="key"
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-center gap-4 mb-4">
          <!-- Icon with background -->
          <Icon :name="statIcons[key] || 'prime:question-circle'" :class="[statColors[key] || 'text-gray-500','text-4xl']"  />

          <!-- Title -->
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">{{ formatStatKey(key) }}</p>
          </div>
        </div>

        <!-- Large value -->
        <div class="mt-2">
          <p class="text-4xl font-bold text-gray-900 leading-none">
            {{ formatValue(key, value) }}
          </p>
        </div>
      </div>
    </div>

    <!-- No stats -->
    <div v-else class="text-center py-20">
      <p class="text-gray-500 text-lg">No statistics available at the moment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue';
import { useFetchGeneralStats } from '~/composables/useStats';

const { stats, isLoading, error } = useFetchGeneralStats();

const now = ref(new Date());
setInterval(() => (now.value = new Date()), 60_000);

const nowString = computed(() =>
  now.value.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
);

const statIcons: Record<string, string> = {
  'todays_checkins': 'prime:calendar-plus',
  'occupied_rooms': 'prime:chart-bar',
  'total_rooms': 'prime:building',
  'total_guests': 'prime:users',
  'available_rooms': 'prime:book',
  'active_stays': 'prime:comment',
};

const statColors: Record<string, string> = {
  'todays_checkins': 'text-blue-500',
  'occupied_rooms': 'text-green-500',
  'total_rooms': 'text-purple-500',
  'total_guests': 'text-yellow-500',
  'available_rooms': 'text-indigo-500',
  'active_stays': 'text-red-500',
};

const formatStatKey = (key: string): string => {
  // Map keys to exact titles from the image
  const keyMap: Record<string, string> = {
    'todays_checkins': "Today's Check-ins",
    'occupancy_rate': 'Occupancy Rate',
    'active_stays': 'Active Stays',
    'pending_requests': 'Pending Requests',
  };

  return keyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (key: string, value: number): string => {
  if (key === 'occupancy_rate') {
    return `${value.toFixed(2)}%`;
  }
  return value.toString();
};
</script>
