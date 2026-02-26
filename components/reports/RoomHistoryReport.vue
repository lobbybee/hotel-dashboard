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
      <Dialog 
        v-model:visible="showRoomModal" 
        :modal="true"
        :closable="true"
        :draggable="false"
        :style="{ width: '90vw', maxWidth: '900px' }"
        class="room-details-dialog"
        position="center"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Icon name="fa:bed" class="text-indigo-600 text-lg"/>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Room Details</h3>
              <p class="text-sm text-gray-600">{{ selectedRoom?.room_number || 'Unknown Room' }}</p>
            </div>
          </div>
        </template>

        <div v-if="selectedRoom" class="space-y-6">
          <!-- Room Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="fa:info-circle" class="text-gray-600"/>
              Room Information
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Room Number</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedRoom.room_number || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Room ID</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedRoom.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Category</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ selectedRoom.category || 'N/A' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Floor</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedRoom.floor }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span
                  :class="getRoomStatusClass(selectedRoom.status)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ selectedRoom.status?.replace('_', ' ').toUpperCase() || 'N/A' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Base Price</p>
                <p class="text-sm font-medium text-gray-900">{{ formatCurrency(selectedRoom.base_price) }}</p>
              </div>
            </div>
          </div>

          <!-- Room Statistics -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="fa:chart-bar" class="text-gray-600"/>
              Room Statistics
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600">Total Stays</p>
                <div class="flex items-center gap-2">
                  <Icon name="fa:hotel" class="text-purple-500"/>
                  <span class="text-lg font-semibold text-gray-900">{{ selectedRoom.total_stays }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-600">Utilization Rate</p>
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[60px]">
                    <div
                      class="bg-emerald-500 h-2 rounded-full"
                      :style="{ width: `${calculateUtilization(selectedRoom)}%` }"
                    ></div>
                  </div>
                  <span class="text-lg font-semibold text-gray-900">{{ calculateUtilization(selectedRoom) }}%</span>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-600">Performance</p>
                <div class="flex items-center gap-2">
                  <Icon name="fa:tachometer-alt" class="text-blue-500"/>
                  <span class="text-lg font-semibold text-gray-900">
                    {{ selectedRoom.total_stays > 10 ? 'High' : selectedRoom.total_stays > 5 ? 'Medium' : 'Low' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Room Stays History -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="fa:history" class="text-gray-600"/>
              Stay History
            </h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-white">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="stay in selectedRoom.stays" :key="stay.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <p class="font-medium text-gray-900">{{ stay.guest_name }}</p>
                        <p class="text-xs text-gray-500">{{ stay.guest_whatsapp }}</p>
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
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {{ stay.register_number }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!selectedRoom.stays || selectedRoom.stays.length === 0" class="text-center py-6">
                <Icon name="fa:hotel" class="text-gray-400 text-3xl mb-2"/>
                <p class="text-sm text-gray-500">No stay history available</p>
              </div>
            </div>
          </div>

          <!-- Footer Information -->
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Room ID: {{ selectedRoom.id }}
            </div>
            <div class="flex items-center gap-4">
              <div class="text-sm text-gray-600">
                Category: {{ selectedRoom.category }}
              </div>
              <div class="flex items-center gap-2">
                <Icon name="fa:award" class="text-purple-500"/>
                <span class="text-sm font-medium text-gray-900">
                  {{ selectedRoom.status?.replace('_', ' ').toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <Button 
              label="Close" 
              @click="closeRoomModal"
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
const showRoomModal = ref(false)

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
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleString('en-US', { hour: 'numeric', hour12: true });
  return `${day} ${month} ${year} ${time}`;
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
  showRoomModal.value = true
}

const closeRoomModal = () => {
  showRoomModal.value = false
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
