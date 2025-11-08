
<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 fade-in">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
          <p class="text-gray-600">Manage hotel rooms and categories</p>
        </div>
        <div class="flex gap-2">
          <Button label="Add Category" icon="pi pi-plus" @click="showCategoryDialog = true" />
          <Button label="Add Rooms" icon="pi pi-plus" @click="showBulkRoomDialog = true" severity="secondary" />
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div
          v-for="status in roomStatuses"
          :key="status.value"
          class="bg-white rounded-lg border-2 p-4"
          :class="status.borderClass"
        >
          <div class="flex items-center gap-2 mb-1">
            <i :class="status.icon" :style="{ color: status.color }"></i>
            <span class="text-xs font-medium text-gray-600">{{ status.label }}</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ getRoomCountByStatus(status.value) }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 mb-6">
      <div class="p-4 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchQuery"
                placeholder="Search rooms..."
                class="w-full"
              />
            </span>
          </div>
          <Dropdown
            v-model="filterStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Statuses"
            class="w-full sm:w-48"
          />
          <Dropdown
            v-model="filterCategory"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Categories"
            class="w-full sm:w-48"
          />
        </div>
      </div>

      <div class="p-4">
        <div class="flex gap-2 mb-4 overflow-x-auto">
          <Button
            v-for="floor in hotelStore.floors"
            :key="floor"
            :label="`Floor ${floor}`"
            :outlined="selectedFloor !== floor"
            @click="selectedFloor = floor"
            size="small"
          />
        </div>

        <div v-if="filteredRooms.length === 0" class="text-center py-12">
          <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">No rooms found</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          <div
            v-for="room in filteredRooms"
            :key="room.id"
            class="relative aspect-square rounded-lg border-2 p-3 cursor-pointer transition-all hover:shadow-lg"
            :class="[
              getRoomStatusClass(room.status),
              selectedRooms.includes(room.id) ? 'ring-4 ring-primary-500' : ''
            ]"
            @click="toggleRoomSelection(room.id)"
          >
            <div class="flex flex-col h-full">
              <div class="flex-1">
                <p class="font-bold text-lg">{{ room.room_number }}</p>
                <p class="text-xs text-gray-600 truncate">{{ room.category.name }}</p>
              </div>
              <Tag :value="room.status" :severity="getStatusSeverity(room.status)" class="text-xs" />
            </div>
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="absolute top-1 right-1"
              @click.stop="editRoom(room)"
            />
          </div>
        </div>

        <div v-if="selectedRooms.length > 0" class="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <p class="font-medium text-gray-900">{{ selectedRooms.length }} room(s) selected</p>
          <div class="flex gap-2">
            <Button label="Change Status" icon="pi pi-refresh" size="small" @click="showBulkStatusDialog = true" />
            <Button label="Delete" icon="pi pi-trash" severity="danger" size="small" @click="confirmBulkDelete" />
            <Button label="Clear" text size="small" @click="selectedRooms = []" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Room Categories</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="category in hotelStore.roomCategories"
          :key="category.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-600">{{ category.description }}</p>
            </div>
            <Button icon="pi pi-pencil" text rounded size="small" @click="editCategory(category)" />
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Price:</span>
              <span class="font-semibold">${{ category.base_price }}/night</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Max Occupancy:</span>
              <span class="font-semibold">{{ category.max_occupancy }} guests</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600 block mb-1">Amenities:</span>
              <div class="flex flex-wrap gap-1">
                <Tag v-for="amenity in category.amenities" :key="amenity" :value="amenity" severity="info" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showCategoryDialog" modal header="Room Category" :style="{ width: '30rem' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
          <InputText v-model="categoryForm.name" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <Textarea v-model="categoryForm.description" rows="3" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
            <InputNumber v-model="categoryForm.base_price" mode="currency" currency="USD" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Max Occupancy *</label>
            <InputNumber v-model="categoryForm.max_occupancy" :min="1" class="w-full" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <Chips v-model="categoryForm.amenities" placeholder="Add amenity and press Enter" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showCategoryDialog = false" />
        <Button label="Save" @click="saveCategory" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showBulkRoomDialog" modal header="Add Multiple Rooms" :style="{ width: '30rem' }">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Start Room Number *</label>
            <InputNumber v-model="bulkRoomForm.startNumber" :min="1" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">End Room Number *</label>
            <InputNumber v-model="bulkRoomForm.endNumber" :min="1" class="w-full" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
          <InputNumber v-model="bulkRoomForm.floor" :min="1" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <Dropdown
            v-model="bulkRoomForm.category"
            :options="hotelStore.roomCategories"
            optionLabel="name"
            placeholder="Select category"
            class="w-full"
          />
        </div>
        <div v-if="bulkRoomForm.startNumber && bulkRoomForm.endNumber" class="bg-blue-50 border border-blue-200 rounded p-3">
          <p class="text-sm text-blue-900">
            This will create {{ bulkRoomForm.endNumber - bulkRoomForm.startNumber + 1 }} rooms
          </p>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showBulkRoomDialog = false" />
        <Button label="Create Rooms" @click="createBulkRooms" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showRoomEditDialog" modal header="Edit Room" :style="{ width: '30rem' }">
      <div v-if="selectedRoom" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
          <InputText v-model="selectedRoom.room_number" class="w-full" disabled />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <Dropdown
            v-model="selectedRoom.category"
            :options="hotelStore.roomCategories"
            optionLabel="name"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <Dropdown
            v-model="selectedRoom.status"
            :options="statusOptions.filter(s => s.value)"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showRoomEditDialog = false" />
        <Button label="Save" @click="saveRoomEdit" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showBulkStatusDialog" modal header="Change Room Status" :style="{ width: '25rem' }">
      <div class="space-y-4">
        <p class="text-gray-700">Change status for {{ selectedRooms.length }} selected room(s)</p>
        <Dropdown
          v-model="bulkStatusChange"
          :options="statusOptions.filter(s => s.value)"
          optionLabel="label"
          optionValue="value"
          placeholder="Select new status"
          class="w-full"
        />
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showBulkStatusDialog = false" />
        <Button label="Update" @click="applyBulkStatusChange" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore } from '@/stores/hotelStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Chips from 'primevue/chips'
import type { Room, RoomCategory } from '../types'

const hotelStore = useHotelStore()
const toast = useToast()
const confirm = useConfirm()

const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const selectedFloor = ref(hotelStore.floors[0] || 1)
const selectedRooms = ref<number[]>([])
const showCategoryDialog = ref(false)
const showBulkRoomDialog = ref(false)
const showRoomEditDialog = ref(false)
const showBulkStatusDialog = ref(false)
const selectedRoom = ref<Room | null>(null)
const bulkStatusChange = ref('')

const categoryForm = ref({
  id: 0,
  name: '',
  description: '',
  base_price: 0,
  max_occupancy: 2,
  amenities: [] as string[]
})

const bulkRoomForm = ref({
  startNumber: 101,
  endNumber: 110,
  floor: 1,
  category: null as RoomCategory | null
})

const roomStatuses = [
  { label: 'Available', value: 'available', color: '#10b981', icon: 'pi pi-check-circle', borderClass: 'border-green-200' },
  { label: 'Occupied', value: 'occupied', color: '#3b82f6', icon: 'pi pi-user', borderClass: 'border-blue-200' },
  { label: 'Cleaning', value: 'cleaning', color: '#f59e0b', icon: 'pi pi-replay', borderClass: 'border-amber-200' },
  { label: 'Maintenance', value: 'maintenance', color: '#ef4444', icon: 'pi pi-wrench', borderClass: 'border-red-200' },
  { label: 'Out of Order', value: 'out_of_order', color: '#6b7280', icon: 'pi pi-ban', borderClass: 'border-gray-200' }
]

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Available', value: 'available' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Order', value: 'out_of_order' }
]

const categoryOptions = computed(() => [
  { label: 'All Categories', value: '' },
  ...hotelStore.roomCategories.map(c => ({ label: c.name, value: c.id }))
])

const filteredRooms = computed(() => {
  let rooms = hotelStore.getRoomsByFloor(selectedFloor.value)

  if (searchQuery.value) {
    rooms = rooms.filter(r =>
      r.room_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filterStatus.value) {
    rooms = rooms.filter(r => r.status === filterStatus.value)
  }

  if (filterCategory.value) {
    rooms = rooms.filter(r => r.category.id === Number(filterCategory.value))
  }

  return rooms
})

const getRoomCountByStatus = (status: string) => {
  return hotelStore.rooms.filter(r => r.status === status).length
}

const getRoomStatusClass = (status: string) => {
  const classes = {
    available: 'border-green-300 bg-green-50 hover:border-green-400',
    occupied: 'border-blue-300 bg-blue-50 hover:border-blue-400',
    cleaning: 'border-amber-300 bg-amber-50 hover:border-amber-400',
    maintenance: 'border-red-300 bg-red-50 hover:border-red-400',
    out_of_order: 'border-gray-300 bg-gray-50 hover:border-gray-400'
  }
  return classes[status as keyof typeof classes] || ''
}

const getStatusSeverity = (status: string) => {
  const severities = {
    available: 'success',
    occupied: 'info',
    cleaning: 'warning',
    maintenance: 'danger',
    out_of_order: 'secondary'
  }
  return severities[status as keyof typeof severities] as any || 'secondary'
}

const toggleRoomSelection = (roomId: number) => {
  const index = selectedRooms.value.indexOf(roomId)
  if (index > -1) {
    selectedRooms.value.splice(index, 1)
  } else {
    selectedRooms.value.push(roomId)
  }
}

const editRoom = (room: Room) => {
  selectedRoom.value = { ...room }
  showRoomEditDialog.value = true
}

const saveRoomEdit = () => {
  if (selectedRoom.value) {
    const index = hotelStore.rooms.findIndex(r => r.id === selectedRoom.value!.id)
    if (index !== -1) {
      hotelStore.rooms[index] = { ...selectedRoom.value }
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Room updated successfully', life: 3000 })
    }
  }
  showRoomEditDialog.value = false
  selectedRoom.value = null
}

const editCategory = (category: RoomCategory) => {
  categoryForm.value = { ...category }
  showCategoryDialog.value = true
}

const saveCategory = () => {
  if (categoryForm.value.id) {
    const index = hotelStore.roomCategories.findIndex(c => c.id === categoryForm.value.id)
    if (index !== -1) {
      hotelStore.roomCategories[index] = { ...categoryForm.value }
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Category updated successfully', life: 3000 })
    }
  } else {
    hotelStore.roomCategories.push({
      ...categoryForm.value,
      id: hotelStore.roomCategories.length + 1
    })
    toast.add({ severity: 'success', summary: 'Created', detail: 'Category created successfully', life: 3000 })
  }
  showCategoryDialog.value = false
  categoryForm.value = { id: 0, name: '', description: '', base_price: 0, max_occupancy: 2, amenities: [] }
}

const createBulkRooms = () => {
  if (!bulkRoomForm.value.category) {
    toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please select a category', life: 3000 })
    return
  }

  const start = bulkRoomForm.value.startNumber
  const end = bulkRoomForm.value.endNumber
  const newRooms: Room[] = []

  for (let i = start; i <= end; i++) {
    newRooms.push({
      id: hotelStore.rooms.length + newRooms.length + 1,
      room_number: i.toString(),
      floor: bulkRoomForm.value.floor,
      category: bulkRoomForm.value.category,
      status: 'available'
    })
  }

  hotelStore.rooms.push(...newRooms)
  toast.add({ severity: 'success', summary: 'Created', detail: `${newRooms.length} rooms created successfully`, life: 3000 })

  showBulkRoomDialog.value = false
  bulkRoomForm.value = { startNumber: 101, endNumber: 110, floor: 1, category: null }
}

const applyBulkStatusChange = () => {
  if (!bulkStatusChange.value) return

  selectedRooms.value.forEach(roomId => {
    hotelStore.updateRoomStatus(roomId, bulkStatusChange.value as Room['status'])
  })

  toast.add({ severity: 'success', summary: 'Updated', detail: `${selectedRooms.value.length} rooms updated`, life: 3000 })
  showBulkStatusDialog.value = false
  selectedRooms.value = []
  bulkStatusChange.value = ''
}

const confirmBulkDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete ${selectedRooms.value.length} room(s)?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      hotelStore.rooms = hotelStore.rooms.filter(r => !selectedRooms.value.includes(r.id))
      toast.add({ severity: 'success', summary: 'Deleted', detail: 'Rooms deleted successfully', life: 3000 })
      selectedRooms.value = []
    }
  })
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
