
<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Guest Check-out</h1>
      <p class="text-gray-600">Manage guest departures and room turnover</p>
    </div>

    <div class="mb-6">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <InputText
          v-model="searchQuery"
          placeholder="Search by guest name or room number..."
          class="w-full"
        />
      </span>
    </div>

    <div v-if="filteredActiveStays.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">No active stays</p>
      <p class="text-gray-400 text-sm">All rooms are currently available</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="stay in filteredActiveStays"
        :key="stay.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <i class="pi pi-user text-primary-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ stay.guest.full_name }}</h3>
              <p class="text-sm text-gray-500">{{ stay.guest.email }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-home"></i>
              Room
            </span>
            <span class="font-semibold text-gray-900">{{ stay.room.room_number }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-tag"></i>
              Category
            </span>
            <Tag :value="stay.room.category.name" severity="info" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-phone"></i>
              WhatsApp
            </span>
            <span class="font-medium text-gray-900">{{ stay.guest.whatsapp_number }}</span>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-plus text-green-600"></i>
            <span>Check-in: {{ formatDate(stay.check_in_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-minus text-red-600"></i>
            <span>Check-out: {{ formatDate(stay.check_out_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="pi pi-clock text-blue-600"></i>
            <span class="font-medium text-blue-600">{{ getDaysStayed(stay) }} night(s)</span>
          </div>
        </div>

        <Button
          label="Check Out"
          icon="pi pi-sign-out"
          class="w-full"
          severity="danger"
          @click="initiateCheckout(stay)"
        />
      </div>
    </div>

    <Dialog v-model:visible="checkoutDialogVisible" modal header="Confirm Check-out" :style="{ width: '30rem' }">
      <div v-if="selectedStay" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-900 mb-2">
            <i class="pi pi-info-circle mr-2"></i>
            Guest Check-out Confirmation
          </p>
          <div class="space-y-1 text-sm">
            <p><strong>Guest:</strong> {{ selectedStay.guest.full_name }}</p>
            <p><strong>Room:</strong> {{ selectedStay.room.room_number }}</p>
            <p><strong>Duration:</strong> {{ getDaysStayed(selectedStay) }} night(s)</p>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p class="text-sm text-amber-900">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Room {{ selectedStay.room.room_number }} will be marked as "Cleaning" after checkout.
          </p>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="checkoutDialogVisible = false" />
        <Button label="Confirm Check-out" severity="danger" @click="confirmCheckout" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore } from '@/stores/hotelStore'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import type { Stay } from '../types'

const hotelStore = useHotelStore()
const toast = useToast()

const searchQuery = ref('')
const checkoutDialogVisible = ref(false)
const selectedStay = ref<Stay | null>(null)

const filteredActiveStays = computed(() => {
  let stays = hotelStore.activeStays

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    stays = stays.filter(stay =>
      stay.guest.full_name.toLowerCase().includes(query) ||
      stay.room.room_number.toLowerCase().includes(query) ||
      stay.guest.email.toLowerCase().includes(query)
    )
  }

  return stays
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDaysStayed = (stay: Stay) => {
  const checkIn = new Date(stay.check_in_date)
  const checkOut = new Date(stay.check_out_date)
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const initiateCheckout = (stay: Stay) => {
  selectedStay.value = stay
  checkoutDialogVisible.value = true
}

const confirmCheckout = () => {
  if (selectedStay.value) {
    hotelStore.checkOut(selectedStay.value.id)
    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: `${selectedStay.value.guest.full_name} has been checked out. Room ${selectedStay.value.room.room_number} is now marked for cleaning.`,
      life: 4000
    })
    checkoutDialogVisible.value = false
    selectedStay.value = null
  }
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
