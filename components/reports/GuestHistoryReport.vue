<template>
  <div class="space-y-6">
    <!-- Guest History Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-cyan-50 rounded-lg">
            <Icon name="fa:users" class="text-cyan-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Guests</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(guestHistoryData?.summary?.total_guests || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-emerald-50 rounded-lg">
            <Icon name="fa:bed" class="text-emerald-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Stays</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(guestHistoryData?.summary?.total_stays || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-50 rounded-lg">
            <Icon name="fa:pie-chart" class="text-purple-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Avg. Stays/Guest</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ calculateAverageStays() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <Icon name="fa:spinner" class="text-4xl text-blue-600 mb-4"/>
        <p class="text-gray-600">Loading guest history...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
        <div>
          <h3 class="text-red-800 font-semibold">Error Loading Guest History</h3>
          <p class="text-red-700 mt-1">{{ error?.message || 'Failed to load guest history data' }}</p>
          <button
            @click="refetch"
            class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Guest History Content -->
    <div v-else>
      <!-- Filter Controls -->
      <div class="card p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by guest name..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[200px]"
          />

          <select
            v-model="nationalityFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Nationalities</option>
            <option v-for="nationality in availableNationalities" :key="nationality" :value="nationality">
              {{ nationality }}
            </option>
          </select>

          <button
            @click="clearFilters"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Guest History Table -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nationality
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Stays
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty Points
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="guest in filteredGuests"
                :key="guest.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">

                    <div >
                      <div class="text-sm font-medium text-gray-900">{{ guest.full_name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ guest.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ guest.whatsapp_number }}</div>
                  <div class="text-sm text-gray-500">{{ guest.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {{ guest.nationality }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ guest.total_stays }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="fas fa-coins text-amber-500 mr-1"></i>
                    <span class="text-sm font-medium text-gray-900">{{ guest.loyalty_points }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ guest.preferred_language?.toUpperCase() || 'EN' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewGuestDetails(guest)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <i class="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredGuests.length === 0" class="text-center py-12">
          <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
          <p class="text-gray-500">Try adjusting your filters or date range.</p>
        </div>
      </div>

      <!-- Guest Details Modal -->
      <div v-if="selectedGuest" class="fixed inset-0 overflow-y-auto z-50">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" @click="closeGuestDetails">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="w-full">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">
                      Guest Details: {{ selectedGuest.full_name }}
                    </h3>
                    <button
                      @click="closeGuestDetails"
                      class="text-gray-400 hover:text-gray-500"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- Guest Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div class="space-y-2 text-sm">
                        <div><strong>WhatsApp:</strong> {{ selectedGuest.whatsapp_number }}</div>
                        <div><strong>Email:</strong> {{ selectedGuest.email }}</div>
                        <div><strong>Nationality:</strong> {{ selectedGuest.nationality }}</div>
                        <div><strong>Language:</strong> {{ selectedGuest.preferred_language?.toUpperCase() || 'EN' }}</div>
                      </div>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">Guest Statistics</h4>
                      <div class="space-y-2 text-sm">
                        <div><strong>Total Stays:</strong> {{ selectedGuest.total_stays }}</div>
                        <div><strong>Loyalty Points:</strong> {{ selectedGuest.loyalty_points }}</div>
                        <div><strong>Guest ID:</strong> {{ selectedGuest.id }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Guest Stays -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-4">Stay History</h4>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="stay in selectedGuest.stays" :key="stay.id">
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              {{ stay.room_number }} ({{ stay.room_category }})
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              {{ formatDate(stay.check_in_date) }}
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              {{ formatDate(stay.check_out_date) }}
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap">
                              <span
                                :class="getStatusClass(stay.status)"
                                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              >
                                {{ stay.status }}
                              </span>
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              {{ formatCurrency(stay.total_amount) }}
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              {{ stay.number_of_guests }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetchGuestHistory } from '@/composables/useReporting'

// Props
const props = defineProps<{
  dateRange: {
    start: string
    end: string
  }
}>()

// Emits
const emit = defineEmits<{
  'update-data': [data: any]
}>()

// State
const searchTerm = ref('')
const nationalityFilter = ref('')
const selectedGuest = ref(null)

// Guest History Data
const {
  guestHistory: guestHistoryData,
  isLoading,
  error,
  refetch
} = useFetchGuestHistory(
  computed(() => ({
    start_date: props.dateRange.start || undefined,
    end_date: props.dateRange.end || undefined,
    guest_whatsapp: undefined // Can be added as prop if needed for filtering
  }))
)

// Emit data to parent when loaded
watch(guestHistoryData, (newData) => {
  if (newData && newData.summary) {
    emit('update-data', newData)
  }
}, { immediate: true })

// Computed Properties
const filteredGuests = computed(() => {
  if (!guestHistoryData.value?.guests) return []

  return guestHistoryData.value.guests.filter(guest => {
    const matchesSearch = !searchTerm.value ||
      guest.full_name.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesNationality = !nationalityFilter.value ||
      guest.nationality === nationalityFilter.value

    return matchesSearch && matchesNationality
  })
})

const availableNationalities = computed(() => {
  if (!guestHistoryData.value?.guests) return []

  const nationalities = new Set(guestHistoryData.value.guests.map(guest => guest.nationality))
  return Array.from(nationalities).sort()
})

// Methods
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

const calculateAverageStays = () => {
  if (!guestHistoryData.value?.summary) return '0.0'

  const totalGuests = guestHistoryData.value.summary.total_guests
  const totalStays = guestHistoryData.value.summary.total_stays

  if (totalGuests === 0) return '0.0'

  return (totalStays / totalGuests).toFixed(1)
}

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'active':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-amber-100 text-amber-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const viewGuestDetails = (guest: any) => {
  selectedGuest.value = guest
}

const closeGuestDetails = () => {
  selectedGuest.value = null
}

const clearFilters = () => {
  searchTerm.value = ''
  nationalityFilter.value = ''
}



// Watch for date range changes
watch(() => props.dateRange, () => {
  refetch()
}, { deep: true })
</script>
