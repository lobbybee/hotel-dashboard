
<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8 fade-in">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Hotel Profile</h1>
          <p class="text-gray-600">Manage your hotel information and settings</p>
        </div>
        <Button label="Save Changes" icon="pi pi-save" @click="saveProfile" :loading="saving" />
      </div>
    </div>

    <div class="space-y-6">
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-building text-primary-600"></i>
            <span>Basic Information</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
              <InputText v-model="form.name" class="w-full" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea v-model="form.description" rows="3" class="w-full" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <InputText v-model="form.address" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <InputText v-model="form.city" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <InputText v-model="form.state" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <InputText v-model="form.country" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <InputText v-model="form.pincode" class="w-full" />
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-phone text-primary-600"></i>
            <span>Contact Information</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <InputText v-model="form.phone" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <InputText v-model="form.email" type="email" class="w-full" />
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-cog text-primary-600"></i>
            <span>Operational Settings</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-in Time *</label>
              <Calendar
                v-model="checkInTime"
                timeOnly
                hourFormat="24"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Time Zone *</label>
              <Dropdown
                v-model="form.time_zone"
                :options="timeZones"
                placeholder="Select timezone"
                class="w-full"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">WiFi Password</label>
              <div class="relative">
                <InputText
                  v-model="form.wifi_password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-shield text-primary-600"></i>
              <span>Verification Status</span>
            </div>
            <Tag
              :value="form.status"
              :severity="getStatusSeverity(form.status)"
              class="text-sm"
            />
          </div>
        </template>
        <template #content>
          <div v-if="form.status === 'verified'" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-green-600 text-2xl"></i>
              <div>
                <h4 class="font-semibold text-green-900 mb-1">Hotel Verified</h4>
                <p class="text-sm text-green-700">
                  Your hotel has been verified and all features are active.
                </p>
              </div>
            </div>
          </div>

          <div v-else class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-exclamation-triangle text-amber-600 text-2xl"></i>
              <div class="flex-1">
                <h4 class="font-semibold text-amber-900 mb-1">Verification Pending</h4>
                <p class="text-sm text-amber-700 mb-3">
                  Complete your hotel profile and upload required documents to get verified.
                </p>
                <Button
                  label="Request Verification"
                  icon="pi pi-send"
                  size="small"
                  @click="requestVerification"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="form.status === 'verified'">
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-qrcode text-primary-600"></i>
            <span>Hotel QR Code</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col items-center gap-4">
            <div class="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div class="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                <i class="pi pi-qrcode text-6xl text-gray-400"></i>
              </div>
            </div>
            <p class="text-sm text-gray-600 text-center max-w-md">
              Share this QR code with guests for easy check-in and hotel information access
            </p>
            <Button label="Download QR Code" icon="pi pi-download" outlined />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHotelStore } from '@/stores/hotelStore'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'

const hotelStore = useHotelStore()
const toast = useToast()

const saving = ref(false)
const showPassword = ref(false)
const checkInTime = ref<Date | null>(null)

const form = ref({
  name: hotelStore.hotel.name,
  description: hotelStore.hotel.description,
  address: hotelStore.hotel.address,
  city: hotelStore.hotel.city,
  state: hotelStore.hotel.state,
  country: hotelStore.hotel.country,
  pincode: hotelStore.hotel.pincode,
  phone: hotelStore.hotel.phone,
  email: hotelStore.hotel.email,
  check_in_time: hotelStore.hotel.check_in_time,
  time_zone: hotelStore.hotel.time_zone,
  wifi_password: hotelStore.hotel.wifi_password,
  status: hotelStore.hotel.status
})

const timeZones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
]

onMounted(() => {
  const [hours, minutes] = form.value.check_in_time.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes), 0)
  checkInTime.value = date
})

const getStatusSeverity = (status: string) => {
  const severities: Record<string, any> = {
    verified: 'success',
    pending: 'warning',
    active: 'info',
    suspended: 'danger'
  }
  return severities[status] || 'secondary'
}

const saveProfile = async () => {
  saving.value = true

  if (checkInTime.value) {
    const hours = checkInTime.value.getHours().toString().padStart(2, '0')
    const minutes = checkInTime.value.getMinutes().toString().padStart(2, '0')
    form.value.check_in_time = `${hours}:${minutes}`
  }

  setTimeout(() => {
    Object.assign(hotelStore.hotel, form.value)
    toast.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: 'Hotel profile has been saved successfully',
      life: 3000
    })
    saving.value = false
  }, 1000)
}

const requestVerification = () => {
  toast.add({
    severity: 'info',
    summary: 'Verification Requested',
    detail: 'Your verification request has been submitted. Our team will review it shortly.',
    life: 4000
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
