<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Guest Check-in</h1>
      <p class="text-gray-600">Manage guest check-ins and registrations</p>
    </div>

    <TabView>
      <TabPanel value="0" header="Pending Stays">
        <div class="mt-6">
          <div v-if="hotelStore.pendingStays.length === 0" class="text-center py-12">
            <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">No pending check-ins</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="stay in hotelStore.pendingStays"
              :key="stay.id"
              class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-semibold text-lg text-gray-900">{{ stay.guest.full_name }}</h3>
                  <p class="text-sm text-gray-500">{{ stay.guest.email }}</p>
                </div>
                <Tag
                  :value="stay.identity_verified ? 'Verified' : 'Not Verified'"
                  :severity="stay.identity_verified ? 'success' : 'warning'"
                />
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <i class="pi pi-phone"></i>
                  <span>{{ stay.guest.whatsapp_number }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <i class="pi pi-calendar"></i>
                  <span>Expected: {{ formatDate(stay.expected_check_in_date!) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <i class="pi pi-users"></i>
                  <span>{{ stay.guest.number_of_guests }} Guest(s)</span>
                </div>
              </div>

              <Button
                label="Check In"
                icon="pi pi-check"
                class="w-full"
                @click="openCheckInDialog(stay)"
              />
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="1" header="Manual Walk-in">
        <div class="mt-6">
          <Card>
            <template #content>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Search Guest by Phone</label>
                  <div class="flex gap-2">
                    <InputText
                      v-model="searchPhone"
                      placeholder="Enter phone number"
                      class="flex-1"
                    />
                    <Button
                      label="Search"
                      icon="pi pi-search"
                      @click="searchGuest"
                    />
                  </div>
                </div>

                <Divider />

                <div v-if="!selectedGuest" class="space-y-4">
                  <h3 class="font-semibold text-lg">New Guest Registration</h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <InputText v-model="newGuest.full_name" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <InputText v-model="newGuest.email" type="email" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
                      <InputText v-model="newGuest.whatsapp_number" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                      <InputText v-model="newGuest.nationality" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <Calendar v-model="guestDOB" dateFormat="yy-mm-dd" class="w-full" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                      <InputNumber v-model="newGuest.number_of_guests" :min="1" class="w-full" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Room *</label>
                    <Dropdown
                      v-model="selectedRoom"
                      :options="hotelStore.getAvailableRooms()"
                      optionLabel="room_number"
                      placeholder="Select a room"
                      class="w-full"
                    >
                      <template #option="slotProps">
                        <div class="flex justify-between items-center w-full">
                          <span>Room {{ slotProps.option.room_number }}</span>
                          <Tag :value="slotProps.option.category.name" severity="info" />
                        </div>
                      </template>
                    </Dropdown>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                    <Calendar v-model="checkoutDate" dateFormat="yy-mm-dd" :minDate="new Date()" class="w-full" />
                  </div>

                  <Button
                    label="Complete Check-in"
                    icon="pi pi-check"
                    class="w-full"
                    @click="completeWalkInCheckIn"
                    :disabled="!isWalkInFormValid"
                  />
                </div>

                <div v-else class="space-y-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-900 mb-2">Guest Found</h4>
                    <p class="text-blue-700">{{ selectedGuest.full_name }}</p>
                    <p class="text-sm text-blue-600">{{ selectedGuest.email }}</p>
                    <Button
                      label="Use Different Guest"
                      icon="pi pi-times"
                      text
                      size="small"
                      class="mt-2"
                      @click="selectedGuest = null"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Room *</label>
                    <Dropdown
                      v-model="selectedRoom"
                      :options="hotelStore.getAvailableRooms()"
                      optionLabel="room_number"
                      placeholder="Select a room"
                      class="w-full"
                    >
                      <template #option="slotProps">
                        <div class="flex justify-between items-center w-full">
                          <span>Room {{ slotProps.option.room_number }}</span>
                          <Tag :value="slotProps.option.category.name" severity="info" />
                        </div>
                      </template>
                    </Dropdown>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                    <Calendar v-model="checkoutDate" dateFormat="yy-mm-dd" :minDate="new Date()" class="w-full" />
                  </div>

                  <Button
                    label="Complete Check-in"
                    icon="pi pi-check"
                    class="w-full"
                    @click="completeExistingGuestCheckIn"
                    :disabled="!selectedRoom || !checkoutDate"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </TabPanel>
    </TabView>

    <Dialog v-model:visible="checkInDialogVisible" modal header="Confirm Check-in" :style="{ width: '30rem' }">
      <div v-if="selectedStay" class="space-y-4">
        <div>
          <p class="text-sm text-gray-600 mb-1">Guest Name</p>
          <p class="font-semibold">{{ selectedStay.guest.full_name }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-1">Email</p>
          <p>{{ selectedStay.guest.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Assign Room</label>
          <Dropdown
            v-model="selectedRoom"
            :options="hotelStore.getAvailableRooms()"
            optionLabel="room_number"
            placeholder="Select a room"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex justify-between items-center w-full">
                <span>Room {{ slotProps.option.room_number }}</span>
                <Tag :value="slotProps.option.category.name" severity="info" />
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="checkInDialogVisible = false" />
        <Button label="Check In" @click="confirmCheckIn" :disabled="!selectedRoom" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore } from '@/stores/hotelStore'
import { useToast } from 'primevue/usetoast'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import type { Stay, Guest, Room } from '../types'

const hotelStore = useHotelStore()
const toast = useToast()

const searchPhone = ref('')
const selectedGuest = ref<Guest | null>(null)
const selectedRoom = ref<Room | null>(null)
const checkoutDate = ref<Date | null>(null)
const guestDOB = ref<Date | null>(null)
const checkInDialogVisible = ref(false)
const selectedStay = ref<Stay | null>(null)

const newGuest = ref({
  full_name: '',
  email: '',
  whatsapp_number: '',
  nationality: '',
  number_of_guests: 1,
  guest_names: [],
  identity_documents: []
})

const isWalkInFormValid = computed(() => {
  return newGuest.value.full_name &&
    newGuest.value.email &&
    newGuest.value.whatsapp_number &&
    newGuest.value.nationality &&
    selectedRoom.value &&
    checkoutDate.value
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const searchGuest = () => {
  const guest = hotelStore.guests.find(g => g.whatsapp_number === searchPhone.value)
  if (guest) {
    selectedGuest.value = guest
    toast.add({ severity: 'success', summary: 'Guest Found', detail: `Found ${guest.full_name}`, life: 3000 })
  } else {
    toast.add({ severity: 'info', summary: 'Not Found', detail: 'No guest found with this number', life: 3000 })
  }
}

const openCheckInDialog = (stay: Stay) => {
  selectedStay.value = stay
  selectedRoom.value = null
  checkInDialogVisible.value = true
}

const confirmCheckIn = () => {
  if (selectedStay.value && selectedRoom.value) {
    hotelStore.checkIn(selectedStay.value.id, selectedRoom.value.id)
    toast.add({ severity: 'success', summary: 'Checked In', detail: `${selectedStay.value.guest.full_name} checked in successfully`, life: 3000 })
    checkInDialogVisible.value = false
    selectedStay.value = null
    selectedRoom.value = null
  }
}

const completeWalkInCheckIn = () => {
  if (!isWalkInFormValid.value) return

  const guest = hotelStore.addGuest({
    ...newGuest.value,
    date_of_birth: guestDOB.value ? guestDOB.value.toISOString() : '',
    guest_names: [newGuest.value.full_name]
  })

  hotelStore.addStay({
    guest,
    room: selectedRoom.value!,
    check_in_date: new Date().toISOString(),
    check_out_date: checkoutDate.value!.toISOString(),
    status: 'active',
    identity_verified: false
  })

  hotelStore.updateRoomStatus(selectedRoom.value!.id, 'occupied')

  toast.add({ severity: 'success', summary: 'Check-in Complete', detail: `${guest.full_name} checked in to room ${selectedRoom.value!.room_number}`, life: 3000 })

  newGuest.value = {
    full_name: '',
    email: '',
    whatsapp_number: '',
    nationality: '',
    number_of_guests: 1,
    guest_names: [],
    identity_documents: []
  }
  selectedRoom.value = null
  checkoutDate.value = null
  guestDOB.value = null
}

const completeExistingGuestCheckIn = () => {
  if (!selectedGuest.value || !selectedRoom.value || !checkoutDate.value) return

  hotelStore.addStay({
    guest: selectedGuest.value,
    room: selectedRoom.value,
    check_in_date: new Date().toISOString(),
    check_out_date: checkoutDate.value.toISOString(),
    status: 'active',
    identity_verified: selectedGuest.value.identity_documents.length > 0
  })

  hotelStore.updateRoomStatus(selectedRoom.value.id, 'occupied')

  toast.add({ severity: 'success', summary: 'Check-in Complete', detail: `${selectedGuest.value.full_name} checked in to room ${selectedRoom.value.room_number}`, life: 3000 })

  selectedGuest.value = null
  selectedRoom.value = null
  checkoutDate.value = null
  searchPhone.value = ''
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
