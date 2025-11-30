<template>
  <div class="space-y-6">
    <!-- Room History Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-indigo-50 rounded-lg">
            <Icon name="fa:bed" class="text-indigo-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Rooms</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(roomHistoryData?.summary?.total_rooms || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-emerald-50 rounded-lg">
            <Icon name="fa:check-circle" class="text-emerald-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Available</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(getRoomsByStatus('available')) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-amber-50 rounded-lg">
            <Icon name="fa:user" class="text-amber-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Occupied</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(getRoomsByStatus('occupied')) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-50 rounded-lg">
            <Icon name="fa:hotel" class="text-purple-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Stays</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(roomHistoryData?.summary?.total_stays || 0) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-600">Loading room history...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
        <div>
          <h3 class="text-red-800 font-semibold">Error Loading Room History</h3>
          <p class="text-red-700 mt-1">{{ error?.message || 'Failed to load room history data' }}</p>
          <button
            @click="refetch"
            class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Room History Content -->
    <div v-else>
      <!-- Filter Controls -->
      <div class="card p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by room number..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[200px]"
          />

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_order">Out of Order</option>
          </select>

          <select
            v-model="categoryFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <select
            v-model="floorFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Floors</option>
            <option v-for="floor in availableFloors" :key="floor" :value="floor">
              Floor {{ floor }}
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

      <!-- Room History Table -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Stays
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="room in filteredRooms"
                :key="room.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">

                    <div >
                      <div class="text-sm font-medium text-gray-900">{{ room.room_number }}</div>
                      <div class="text-sm text-gray-500">ID: {{ room.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {{ room.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ room.floor }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getRoomStatusClass(room.status)"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ room.status.replace('_', ' ').toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(room.base_price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ room.total_stays }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-emerald-500 h-2 rounded-full"
                        :style="{ width: `${calculateUtilization(room)}%` }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ calculateUtilization(room) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewRoomDetails(room)"
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
        <div v-if="filteredRooms.length === 0" class="text-center py-12">
          <i class="fas fa-bed text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p class="text-gray-500">Try adjusting your filters or date range.</p>
        </div>
      </div>

      <!-- Room Details Modal -->
      <div v-if="selectedRoom" class="fixed inset-0 overflow-y-auto z-50">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" @click="closeRoomDetails">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="w-full">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">
                      Room Details: {{ selectedRoom.room_number }}
                    </h3>
                    <button
                      @click="closeRoomDetails"
                      class="text-gray-400 hover:text-gray-500"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- Room Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">Room Information</h4>
                      <div class="space-y-2 text-sm">
                        <div><strong>Room Number:</strong> {{ selectedRoom.room_number }}</div>
                        <div><strong>Category:</strong> {{ selectedRoom.category }}</div>
                        <div><strong>Floor:</strong> {{ selectedRoom.floor }}</div>
                        <div><strong>Status:</strong>
                          <span
                            :class="getRoomStatusClass(selectedRoom.status)"
                            class="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ selectedRoom.status.replace('_', ' ').toUpperCase() }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 mb-2">Pricing & Statistics</h4>
                      <div class="space-y-2 text-sm">
                        <div><strong>Base Price:</strong> {{ formatCurrency(selectedRoom.base_price) }}</div>
                        <div><strong>Total Stays:</strong> {{ selectedRoom.total_stays }}</div>
                        <div><strong>Utilization:</strong> {{ calculateUtilization(selectedRoom) }}%</div>
                      </div>
                    </div>
                    <!-- <div>
                      <h4 class="font-medium text-gray-900 mb-2">Quick Actions</h4>
                      <div class="space-y-2">
                        <button class="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                          <i class="fas fa-edit mr-1"></i> Edit Room
                        </button>
                        <button class="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          <i class="fas fa-calendar-plus mr-1"></i> New Booking
                        </button>
                      </div>
                    </div> -->
                  </div>

                  <!-- Room Stays -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-4">Stay History</h4>
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Register</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="stay in selectedRoom.stays" :key="stay.id">
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              <div>
                                <div class="font-medium text-gray-900">{{ stay.guest_name }}</div>
                                <div class="text-gray-500">{{ stay.guest_whatsapp }}</div>
                              </div>
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
                            <td class="px-4 py-2 whitespace-nowrap text-sm">
                              {{ stay.register_number }}
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
import { useFetchRoomHistory } from '@/composables/useReporting'

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
const statusFilter = ref('')
const categoryFilter = ref('')
const floorFilter = ref('')
const selectedRoom = ref(null)

// Room History Data
const {
  roomHistory: roomHistoryData,
  isLoading,
  error,
  refetch
} = useFetchRoomHistory(
  computed(() => ({
    start_date: props.dateRange.start || undefined,
    end_date: props.dateRange.end || undefined,
    room_id: undefined, // Can be added as prop if needed for filtering
    guest_whatsapp: undefined // Can be added as prop if needed for filtering
  }))
)

// Emit data to parent when loaded
watch(roomHistoryData, (newData) => {
  if (newData && newData.summary) {
    emit('update-data', newData)
  }
}, { immediate: true })

// Computed Properties
const filteredRooms = computed(() => {
  if (!roomHistoryData.value?.rooms) return []

  return roomHistoryData.value.rooms.filter(room => {
    const matchesSearch = !searchTerm.value ||
      room.room_number.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesStatus = !statusFilter.value ||
      room.status === statusFilter.value

    const matchesCategory = !categoryFilter.value ||
      room.category === categoryFilter.value

    const matchesFloor = !floorFilter.value ||
      room.floor.toString() === floorFilter.value

    return matchesSearch && matchesStatus && matchesCategory && matchesFloor
  })
})

const availableCategories = computed(() => {
  if (!roomHistoryData.value?.rooms) return []

  const categories = new Set(roomHistoryData.value.rooms.map(room => room.category))
  return Array.from(categories).sort()
})

const availableFloors = computed(() => {
  if (!roomHistoryData.value?.rooms) return []

  const floors = new Set(roomHistoryData.value.rooms.map(room => room.floor))
  return Array.from(floors).sort((a, b) => a - b)
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

const getRoomsByStatus = (status: string) => {
  if (!roomHistoryData.value?.rooms) return 0
  return roomHistoryData.value.rooms.filter(room => room.status === status).length
}

const getRoomStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-emerald-100 text-emerald-800'
    case 'occupied':
      return 'bg-blue-100 text-blue-800'
    case 'cleaning':
      return 'bg-amber-100 text-amber-800'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800'
    case 'out_of_order':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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

const calculateUtilization = (room: any) => {
  if (!roomHistoryData.value?.summary?.total_stays || room.total_stays === 0) {
    return 0
  }

  const totalStays = roomHistoryData.value.summary.total_stays
  const maxUtilization = Math.max(...roomHistoryData.value.rooms.map((r: any) => r.total_stays), 1)

  return Math.round((room.total_stays / maxUtilization) * 100)
}

const viewRoomDetails = (room: any) => {
  selectedRoom.value = room
}

const closeRoomDetails = () => {
  selectedRoom.value = null
}

const clearFilters = () => {
  searchTerm.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  floorFilter.value = ''
}

// Watch for date range changes
watch(() => props.dateRange, () => {
  refetch()
}, { deep: true })
</script>
