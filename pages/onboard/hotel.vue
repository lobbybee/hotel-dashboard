<template>
  <OnboardingOnboardLayout
    title="Hotel Setup"
    icon="pi-building"
    color-scheme="blue"
    :steps="steps"
    :current-step="currentStep"
    :is-loading="isLoading"
    loading-title="Loading Hotel Data"
    loading-subtitle="Please wait while we fetch your information..."
    :is-saving="isSaving"
    :show-navigation="currentStep !== 0 && currentStep !== steps.length - 1"
    :show-back-button="currentStep > 1"
    :continue-button-text="currentStep === steps.length - 2 ? 'Review & Save' : 'Continue'"
    :api-error="hotelError"
    @prev="previousStep"
    @next="handleNext"
    @retry="refetchHotel"
  >
    <!-- Slide 0: Welcome -->
    <template #slide-0>
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-building text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ hotel?.name ? 'Lets Get Started' : 'Welcome to Your Hotel Dashboard' }}
        </h2>
        <p class="text-gray-600 leading-relaxed">
          {{ hotel?.name
            ? `Let's review and update your ${hotel.name} profile information.`
            : "Let's set up your hotel profile in just a few simple steps."
          }}
        </p>
      </div>

      <div v-if="!hotel?.name" class="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-info-circle text-blue-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-blue-900 mb-2">What we'll collect:</h3>
            <ul class="space-y-2 text-sm text-blue-800">
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-blue-600"></i> Basic hotel information</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-blue-600"></i> Contact details</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-blue-600"></i> Location & address</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-blue-600"></i> Operational settings</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-else class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-check-circle text-green-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-green-900 mb-2">Your Profile Status</h3>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="flex items-center" v-if="hotel?.name"><i class="pi pi-check text-green-600 mr-2"></i><span>Basic Info</span></div>
              <div class="flex items-center" v-if="hotel?.phone"><i class="pi pi-check text-green-600 mr-2"></i><span>Contact</span></div>
              <div class="flex items-center" v-if="hotel?.address"><i class="pi pi-check text-green-600 mr-2"></i><span>Location</span></div>
              <div class="flex items-center" v-if="hotel?.check_in_time"><i class="pi pi-check text-green-600 mr-2"></i><span>Settings</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button @click="nextStep" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          {{ hotel?.name ? 'Review Profile' : 'Get Started' }}
          <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </template>

    <!-- Slide 1: Basic Information -->
    <template #slide-1>
      <div class="mb-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <i class="pi pi-building text-white text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p class="text-gray-600">Tell us about your hotel</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
          <input v-model="hotelForm.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Enter your hotel name" :class="{ 'border-red-500': errors.name }" />
          <span v-if="errors.name" class="text-red-500 text-sm mt-1 block">{{ errors.name }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea v-model="hotelForm.description" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Describe your hotel (optional)"></textarea>
        </div>
      </div>
    </template>

    <!-- Slide 2: Contact Information -->
    <template #slide-2>
      <div class="mb-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <i class="pi pi-phone text-white text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
        <p class="text-gray-600">How can guests reach you?</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <div class="relative">
            <input v-model="hotelForm.phone" type="tel" class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="+91 98765 43210" :class="{ 'border-red-500': errors.phone }" />
            <div class="absolute left-4 top-3.5 text-gray-400"><i class="pi pi-phone"></i></div>
          </div>
          <span v-if="errors.phone" class="text-red-500 text-sm mt-1 block">{{ errors.phone }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <div class="relative">
            <input v-model="hotelForm.email" type="email" class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="hotel@example.com" :class="{ 'border-red-500': errors.email }" />
            <div class="absolute left-4 top-3.5 text-gray-400"><i class="pi pi-envelope"></i></div>
          </div>
          <span v-if="errors.email" class="text-red-500 text-sm mt-1 block">{{ errors.email }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Google Review Link</label>
          <div class="relative">
            <input v-model="hotelForm.google_review_link" type="url" class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://g.page/your-hotel/review" />
            <div class="absolute left-4 top-3.5 text-gray-400"><i class="pi pi-google"></i></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Slide 3: Location -->
    <template #slide-3>
      <div class="mb-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <i class="pi pi-map-marker text-white text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Hotel Location</h2>
        <p class="text-gray-600">Where is your hotel located?</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <textarea v-model="hotelForm.address" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Enter complete address" :class="{ 'border-red-500': errors.address }"></textarea>
          <span v-if="errors.address" class="text-red-500 text-sm mt-1 block">{{ errors.address }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input v-model="hotelForm.city" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="City" :class="{ 'border-red-500': errors.city }" />
            <span v-if="errors.city" class="text-red-500 text-sm mt-1 block">{{ errors.city }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">State *</label>
            <input v-model="hotelForm.state" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="State" :class="{ 'border-red-500': errors.state }" />
            <span v-if="errors.state" class="text-red-500 text-sm mt-1 block">{{ errors.state }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
            <input v-model="hotelForm.pincode" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="000000" :class="{ 'border-red-500': errors.pincode }" />
            <span v-if="errors.pincode" class="text-red-500 text-sm mt-1 block">{{ errors.pincode }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <input v-model="hotelForm.country" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Country" :class="{ 'border-red-500': errors.country }" />
            <span v-if="errors.country" class="text-red-500 text-sm mt-1 block">{{ errors.country }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Slide 4: Operational Settings -->
    <template #slide-4>
      <div class="mb-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <i class="pi pi-cog text-white text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Operational Settings</h2>
        <p class="text-gray-600">Configure your hotel operations</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Check-in Time *</label>
          <div class="relative">
            <input v-model="hotelForm.check_in_time" type="time" class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="{ 'border-red-500': errors.check_in_time }" />
            <div class="absolute left-4 top-3.5 text-gray-400"><i class="pi pi-clock"></i></div>
          </div>
          <span v-if="errors.check_in_time" class="text-red-500 text-sm mt-1 block">{{ errors.check_in_time }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Timezone *</label>
          <select v-model="hotelForm.time_zone" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :class="{ 'border-red-500': errors.time_zone }">
            <option value="">Select timezone</option>
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
          <span v-if="errors.time_zone" class="text-red-500 text-sm mt-1 block">{{ errors.time_zone }}</span>
        </div>
      </div>
    </template>

    <!-- Slide 5: Complete -->
    <template #slide-5>
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-check text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">All Set! 🎉</h2>
        <p class="text-gray-600 leading-relaxed mb-6">Your hotel profile has been saved.</p>

        <div class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
          <h3 class="font-semibold text-green-900 mb-4">What's next?</h3>
          <div class="space-y-3 text-left">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i class="pi pi-th-large text-green-600"></i></div>
              <span class="text-green-800">Set up room categories and pricing</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i class="pi pi-users text-green-600"></i></div>
              <span class="text-green-800">Add your staff members</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button @click="goToRooms" class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
          Setup Rooms <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </template>
  </OnboardingOnboardLayout>

  <!-- Custom Confirmation Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showConfirmation" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showConfirmation = false"></div>
        
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-modal-in">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="pi pi-building text-white text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Confirm Hotel Details</h3>
                <p class="text-blue-100 text-sm">Please review before saving</p>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-6 space-y-4">
            <div class="space-y-3">
              <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                <i class="pi pi-building text-blue-600 mt-0.5"></i>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 font-medium">Hotel Name</p>
                  <p class="text-gray-900 font-semibold truncate">{{ hotelForm.name }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-gray-50 rounded-xl">
                  <p class="text-xs text-gray-500 font-medium flex items-center"><i class="pi pi-phone mr-1 text-green-600"></i> Phone</p>
                  <p class="text-gray-900 text-sm font-medium truncate">{{ hotelForm.phone }}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-xl">
                  <p class="text-xs text-gray-500 font-medium flex items-center"><i class="pi pi-envelope mr-1 text-green-600"></i> Email</p>
                  <p class="text-gray-900 text-sm font-medium truncate">{{ hotelForm.email }}</p>
                </div>
              </div>
              
              <div class="p-3 bg-gray-50 rounded-xl">
                <p class="text-xs text-gray-500 font-medium flex items-center"><i class="pi pi-map-marker mr-1 text-purple-600"></i> Location</p>
                <p class="text-gray-900 text-sm font-medium">{{ hotelForm.city }}, {{ hotelForm.state }}, {{ hotelForm.country }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-gray-50 rounded-xl">
                  <p class="text-xs text-gray-500 font-medium flex items-center"><i class="pi pi-clock mr-1 text-orange-600"></i> Check-in</p>
                  <p class="text-gray-900 text-sm font-medium">{{ hotelForm.check_in_time }}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-xl">
                  <p class="text-xs text-gray-500 font-medium flex items-center"><i class="pi pi-globe mr-1 text-orange-600"></i> Timezone</p>
                  <p class="text-gray-900 text-sm font-medium truncate">{{ hotelForm.time_zone }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex space-x-3">
            <button @click="showConfirmation = false" class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors">
              Edit
            </button>
            <button @click="confirmAndSave" :disabled="isSaving" class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center">
              <i v-if="isSaving" class="pi pi-spinner pi-spin mr-2"></i>
              {{ isSaving ? 'Saving...' : 'Confirm & Save' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useAPIHelper } from '~/composables/useAPIHelper'
import { HotelSchema } from '~/utils/schemas/hotel'
import type { Hotel } from '~/types/hotel'



definePageMeta({ layout: 'empty' })

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const { hotelId } = storeToRefs(authStore)
const { getErrorMessage } = useAPIHelper()

const currentStep = ref(0)
const isSaving = ref(false)
const isLoading = ref(true)
const showConfirmation = ref(false)

const steps = [
  { title: 'Welcome' },
  { title: 'Basic Info' },
  { title: 'Contact' },
  { title: 'Location' },
  { title: 'Settings' },
  { title: 'Complete' }
]

const hotelFormSchema = HotelSchema;


const hotelForm = ref({
  name: '', description: '', address: '', city: '', state: '', country: '', pincode: '',
  phone: '', email: '', check_in_time: '14:00', time_zone: 'Asia/Kolkata', google_review_link: ''
})

const errors = ref<Record<string, string>>({})

const handleNext = () => {
  // On last form step (Settings), show confirmation instead of advancing
  if (currentStep.value === steps.length - 2) {
    if (validateCurrentStep()) {
      showConfirmation.value = true
    }
    return
  }
  nextStep()
}

const nextStep = () => {
  if (!validateCurrentStep()) return
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const previousStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const validateCurrentStep = () => {
  errors.value = {}
  switch (currentStep.value) {
    case 1:
      if (!hotelForm.value.name || hotelForm.value.name.length < 3) { errors.value.name = 'Hotel name must be at least 3 characters'; return false }
      break
    case 2:
      if (!hotelForm.value.phone || hotelForm.value.phone.length < 10) { errors.value.phone = 'Valid phone number is required'; return false }
      if (!hotelForm.value.email || !hotelForm.value.email.includes('@')) { errors.value.email = 'Valid email address is required'; return false }
      break
    case 3:
      if (!hotelForm.value.address || hotelForm.value.address.length < 5) { errors.value.address = 'Address is required'; return false }
      if (!hotelForm.value.city || hotelForm.value.city.length < 2) { errors.value.city = 'City is required'; return false }
      if (!hotelForm.value.state || hotelForm.value.state.length < 2) { errors.value.state = 'State is required'; return false }
      if (!hotelForm.value.country || hotelForm.value.country.length < 2) { errors.value.country = 'Country is required'; return false }
      if (!hotelForm.value.pincode || hotelForm.value.pincode.length < 5) { errors.value.pincode = 'Valid pincode is required'; return false }
      break
    case 4:
      if (!hotelForm.value.check_in_time) { errors.value.check_in_time = 'Check-in time is required'; return false }
      if (!hotelForm.value.time_zone) { errors.value.time_zone = 'Time zone is required'; return false }
      break
  }
  return true
}

const confirmAndSave = async () => {
  const result = hotelFormSchema.safeParse(hotelForm.value)
  if (!result.success) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please check all fields', life: 5000 })
    showConfirmation.value = false
    return
  }

  isSaving.value = true
  try {
    const { mutate: updateHotelProfile } = usePatchHotel()
    if (!hotelId.value) throw new Error("Hotel ID is missing");
    await updateHotelProfile({ id: hotelId.value, ...result.data })
    toast.add({ severity: 'success', summary: 'Success', detail: 'Hotel profile saved!', life: 3000 })

    showConfirmation.value = false
    currentStep.value = steps.length - 1 // Go to complete slide
  } catch (error) {
    console.error('Failed to save:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: getErrorMessage(error), life: 5000 })
  } finally {
    isSaving.value = false
  }
}

const goToRooms = () => router.push('/onboard/rooms')

const { data: hotel, error: hotelError, refetch: refetchHotel } = useFetchHotel(hotelId) as { data: Ref<Hotel | null>, error: Ref<any>, refetch: () => void }


// Flag to prevent overwriting user edits after initial load
const formInitialized = ref(false)

watch(hotel, (data) => {
  if (data) {
    isLoading.value = false
    // Only populate form on initial load, not on refetch (preserves user edits)
    if (!formInitialized.value) {
      let checkInTime = data.check_in_time || '14:00'
      if (checkInTime?.includes(':')) {
        const parts = checkInTime.split(':')
        checkInTime = `${parts[0]}:${parts[1]}`
      }
      hotelForm.value = {
        name: data.name || '', description: data.description || '',
        address: data.address || '', city: data.city || '',
        state: data.state || '', country: data.country || '',
        pincode: data.pincode || '', phone: data.phone || '',
        email: data.email || '', check_in_time: checkInTime,
        time_zone: data.time_zone || 'Asia/Kolkata', google_review_link: data.google_review_link || ''
      }
      formInitialized.value = true
    }
  }
}, { immediate: true, deep: true })

watch(hotelError, (error) => {
  if (error) {
    isLoading.value = false
    toast.add({ severity: 'error', summary: 'Error', detail: getErrorMessage(error), life: 5000 })
  }
})

onMounted(() => {
  currentStep.value = 0
  errors.value = {}
  refetchHotel()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .animate-modal-in {
  animation: modalIn 0.3s ease-out;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
