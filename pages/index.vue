<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2"> Dashboard</h1>
            <p class="text-gray-600">{{ nowString }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="animate-pulse">
            <div class="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p class="text-gray-600">Something went wrong while fetching dashboard data. Please try again later.</p>
        </div>
      </div>

      <!-- Stats grid -->
      <div v-else-if="stats && Object.keys(stats).length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="(value, key) in stats"
          :key="key"
          class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0" :class="getIconContainerClass(key)">
              <i :class="[getStatIcon(key), 'text-xl']"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-600 mb-1">{{ formatStatKey(key) }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatValue(key, value) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No stats -->
      <div v-else class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-chart-bar text-gray-400 text-2xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Statistics Available</h3>
          <p class="text-gray-600">No statistics available at the moment.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

const getStatIcon = (key: string): string => {
  const iconMap: Record<string, string> = {
    'todays_checkins': 'pi pi-calendar-plus',
    'occupied_rooms': 'pi pi-chart-bar',
    'total_rooms': 'pi pi-building',
    'total_guests': 'pi pi-users',
    'available_rooms': 'pi pi-book',
    'active_stays': 'pi pi-comment',
    'occupancy_rate': 'pi pi-percentage',
    'pending_requests': 'pi pi-clock',
    'checkouts_today': 'pi pi-sign-out',
    'new_bookings': 'pi pi-calendar-plus',
    'revenue_today': 'pi pi-dollar',
  };

  return iconMap[key] || 'pi pi-info-circle';
};

const getIconContainerClass = (key: string): string => {
  const colorMap: Record<string, string> = {
    'todays_checkins': 'w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600',
    'occupied_rooms': 'w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600',
    'total_rooms': 'w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600',
    'total_guests': 'w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600',
    'available_rooms': 'w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600',
    'active_stays': 'w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600',
    'occupancy_rate': 'w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600',
    'pending_requests': 'w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600',
    'checkouts_today': 'w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600',
    'new_bookings': 'w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600',
    'revenue_today': 'w-12 h-12 bg-lime-50 rounded-lg flex items-center justify-center text-lime-600',
  };

  return colorMap[key] || 'w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600';
};

const formatStatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'todays_checkins': "Today's Check-ins",
    'occupied_rooms': 'Occupied Rooms',
    'total_rooms': 'Total Rooms',
    'total_guests': 'Total Guests',
    'available_rooms': 'Available Rooms',
    'active_stays': 'Active Stays',
    'occupancy_rate': 'Occupancy Rate',
    'pending_requests': 'Pending Requests',
    'checkouts_today': "Today's Checkouts",
    'new_bookings': 'New Bookings',
    'revenue_today': "Today's Revenue",
  };

  return keyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (key: string, value: number): string => {
  if (key === 'occupancy_rate') {
    return `${value.toFixed(1)}%`;
  }
  if (key === 'revenue_today') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  return value.toLocaleString();
};
</script>

<style scoped>
/* Modern design following the design system */
/* No custom styles needed - using Tailwind classes for consistency */
</style>
