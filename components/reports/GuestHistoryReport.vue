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
      <Dialog 
        v-model:visible="showGuestModal" 
        :modal="true"
        :closable="true"
        :draggable="false"
        :style="{ width: '90vw', maxWidth: '800px' }"
        class="guest-details-dialog"
        position="center"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
              <Icon name="fa:users" class="text-cyan-600 text-lg"/>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Guest Details</h3>
              <p class="text-sm text-gray-600">{{ selectedGuest?.full_name || 'Unknown Guest' }}</p>
            </div>
          </div>
        </template>

        <div v-if="selectedGuest" class="space-y-6">
          <!-- Guest Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="fa:user" class="text-gray-600"/>
              Guest Information
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Full Name</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedGuest.full_name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Guest ID</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedGuest.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">WhatsApp</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedGuest.whatsapp_number || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedGuest.email || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Nationality</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ selectedGuest.nationality || 'Unknown' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Preferred Language</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedGuest.preferred_language?.toUpperCase() || 'EN' }}</p>
              </div>
            </div>
          </div>

          <!-- Guest Statistics -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="fa:pie-chart" class="text-gray-600"/>
              Guest Statistics
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600">Total Stays</p>
                <div class="flex items-center gap-2">
                  <Icon name="fa:bed" class="text-emerald-500"/>
                  <span class="text-lg font-semibold text-gray-900">{{ selectedGuest.total_stays }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-600">Loyalty Points</p>
                <div class="flex items-center gap-2">
                  <Icon name="fa:coins" class="text-amber-500"/>
                  <span class="text-lg font-semibold text-gray-900">{{ selectedGuest.loyalty_points }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-600">Average Stay</p>
                <div class="flex items-center gap-2">
                  <Icon name="fa:calendar" class="text-blue-500"/>
                  <span class="text-lg font-semibold text-gray-900">{{ calculateAverageStays() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Guest Stays History -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="fa:history" class="text-gray-600"/>
              Stay History
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-white">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="stay in selectedGuest.stays" :key="stay.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <p class="font-medium text-gray-900">{{ stay.room_number }}</p>
                        <p class="text-xs text-gray-500">{{ stay.room_category || 'Standard' }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(stay.check_in_date) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(stay.check_out_date) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        :class="getStatusClass(stay.status)"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      >
                        {{ stay.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ formatCurrency(stay.total_amount) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {{ stay.number_of_guests }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!selectedGuest.stays || selectedGuest.stays.length === 0" class="text-center py-6">
                <Icon name="fa:bed" class="text-gray-400 text-3xl mb-2"/>
                <p class="text-sm text-gray-500">No stay history available</p>
              </div>
            </div>
          </div>

          <!-- Footer Information -->
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Guest ID: {{ selectedGuest.id }}
            </div>
            <div class="flex items-center gap-4">
              <div class="text-sm text-gray-600">
                Member Since: {{ getCurrentDate() }}
              </div>
              <div class="flex items-center gap-2">
                <Icon name="fa:award" class="text-purple-500"/>
                <span class="text-sm font-medium text-gray-900">Loyalty Member</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <Button 
              label="Close" 
              @click="closeGuestModal"
              class="p-button-secondary"
              severity="secondary"
            />
          </div>
        </template>
      </Dialog>
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
const showGuestModal = ref(false)

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
  showGuestModal.value = true
}

const closeGuestModal = () => {
  showGuestModal.value = false
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
