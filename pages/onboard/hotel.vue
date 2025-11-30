<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse">
        <i class="pi pi-building text-white text-3xl"></i>
      </div>
      <div class="animate-pulse">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Loading Hotel Data</h2>
        <p class="text-gray-600">Please wait while we fetch your information...</p>
      </div>
      <div class="mt-6">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  </div>

  <!-- Main Content (shown when not loading) -->
  <div v-else class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- Mobile-friendly header -->
    <div class="w-full px-4 py-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <i class="pi pi-building text-white text-lg"></i>
        </div>
        <h1 class="text-xl font-bold text-gray-900 hidden sm:block">Hotel Setup</h1>
      </div>

      <!-- Mobile step indicator -->
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Step</span>
        <span class="text-sm font-semibold text-blue-600">{{ currentStep + 1 }}/{{ totalSteps }}</span>
      </div>
    </div>

    <!-- Progress Bar - Mobile First -->
    <div class="w-full px-4 mb-8">
      <div class="relative">
        <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="flex justify-between mt-3">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex flex-col items-center"
            :class="{ 'opacity-100': index <= currentStep, 'opacity-50': index > currentStep }"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
              :class="{
                'bg-gradient-to-r from-blue-600 to-indigo-600 text-white': index < currentStep,
                'bg-blue-600 text-white ring-4 ring-blue-100': index === currentStep,
                'bg-gray-200 text-gray-500': index > currentStep
              }"
            >
              <i v-if="index < currentStep" class="pi pi-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="text-xs text-gray-600 mt-1 hidden sm:block">{{ step.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-md mx-auto px-4 pb-8">
      <!-- Slide Container with Animation -->
      <div class="relative overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-out"
          :style="{ transform: `translateX(-${currentStep * 100}%)` }"
        >
          <!-- Slide 1: Welcome -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <i class="pi pi-building text-white text-3xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                {{ hotel.name ? 'Lets Get Started' : 'Welcome to Your Hotel Dashboard' }}
              </h2>
              <p class="text-gray-600 leading-relaxed">
                {{ hotel.name
                  ? `Let's review and update your ${hotel.name} profile information. We'll guide you through each section to ensure everything is current.`
                  : "Let's set up your hotel profile in just a few simple steps. We'll guide you through collecting all the essential information to get your hotel running smoothly."
                }}
              </p>
            </div>

            <div v-if="!hotel.name" class="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
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
                  <p class="text-sm text-green-800 mb-3">We've found your existing hotel information. You can review and update any section as needed.</p>
                  <div class="grid grid-cols-2 gap-3 text-xs">
                    <div class="flex items-center" v-if="hotel.name">
                      <i class="pi pi-check text-green-600 mr-2"></i>
                      <span>Basic Info</span>
                    </div>
                    <div class="flex items-center" v-if="hotel.phone">
                      <i class="pi pi-check text-green-600 mr-2"></i>
                      <span>Contact</span>
                    </div>
                    <div class="flex items-center" v-if="hotel.address">
                      <i class="pi pi-check text-green-600 mr-2"></i>
                      <span>Location</span>
                    </div>
                    <div class="flex items-center" v-if="hotel.check_in_time">
                      <i class="pi pi-check text-green-600 mr-2"></i>
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-center">
              <button
                @click="nextStep"
                class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {{ hotel.name ? 'Review Profile' : 'Get Started' }}
                <i class="pi pi-arrow-right ml-2"></i>
              </button>
            </div>
          </div>

          <!-- Slide 2: Basic Information -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <i class="pi pi-building text-white text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p class="text-gray-600">Tell us about your hotel</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                <input
                  v-model="hotelForm.name"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter your hotel name"
                  :class="{ 'border-red-500': errors.name }"
                />
                <span v-if="errors.name" class="text-red-500 text-sm mt-1 block">{{ errors.name }}</span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="hotelForm.description"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Describe your hotel (optional)"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Slide 3: Contact Information -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
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
                  <input
                    v-model="hotelForm.phone"
                    type="tel"
                    class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="+91 98765 43210"
                    :class="{ 'border-red-500': errors.phone }"
                  />
                  <div class="absolute left-4 top-3.5 text-gray-400">
                    <i class="pi pi-phone"></i>
                  </div>
                </div>
                <span v-if="errors.phone" class="text-red-500 text-sm mt-1 block">{{ errors.phone }}</span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <div class="relative">
                  <input
                    v-model="hotelForm.email"
                    type="email"
                    class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="hotel@example.com"
                    :class="{ 'border-red-500': errors.email }"
                  />
                  <div class="absolute left-4 top-3.5 text-gray-400">
                    <i class="pi pi-envelope"></i>
                  </div>
                </div>
                <span v-if="errors.email" class="text-red-500 text-sm mt-1 block">{{ errors.email }}</span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Google Review Link</label>
                <div class="relative">
                  <input
                    v-model="hotelForm.google_review_link"
                    type="url"
                    class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="https://g.page/your-hotel/review"
                    :class="{ 'border-red-500': errors.google_review_link }"
                  />
                  <div class="absolute left-4 top-3.5 text-gray-400">
                    <i class="pi pi-google"></i>
                  </div>
                </div>
                <span v-if="errors.google_review_link" class="text-red-500 text-sm mt-1 block">{{ errors.google_review_link }}</span>
              </div>
            </div>
          </div>

          <!-- Slide 4: Location -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <i class="pi pi-map-marker text-white text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Hotel Location</h2>
              <p class="text-gray-600">Where is your hotel located?</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  v-model="hotelForm.address"
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Enter complete address"
                  :class="{ 'border-red-500': errors.address }"
                ></textarea>
                <span v-if="errors.address" class="text-red-500 text-sm mt-1 block">{{ errors.address }}</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    v-model="hotelForm.city"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="City"
                    :class="{ 'border-red-500': errors.city }"
                  />
                  <span v-if="errors.city" class="text-red-500 text-sm mt-1 block">{{ errors.city }}</span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    v-model="hotelForm.state"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="State"
                    :class="{ 'border-red-500': errors.state }"
                  />
                  <span v-if="errors.state" class="text-red-500 text-sm mt-1 block">{{ errors.state }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    v-model="hotelForm.pincode"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="000000"
                    :class="{ 'border-red-500': errors.pincode }"
                  />
                  <span v-if="errors.pincode" class="text-red-500 text-sm mt-1 block">{{ errors.pincode }}</span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    v-model="hotelForm.country"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Country"
                    :class="{ 'border-red-500': errors.country }"
                  />
                  <span v-if="errors.country" class="text-red-500 text-sm mt-1 block">{{ errors.country }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 5: Operational Settings -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
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
                  <input
                    v-model="hotelForm.check_in_time"
                    type="time"
                    class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    :class="{ 'border-red-500': errors.check_in_time }"
                  />
                  <div class="absolute left-4 top-3.5 text-gray-400">
                    <i class="pi pi-clock"></i>
                  </div>
                </div>
                <span v-if="errors.check_in_time" class="text-red-500 text-sm mt-1 block">{{ errors.check_in_time }}</span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Timezone *</label>
                <select
                  v-model="hotelForm.time_zone"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  :class="{ 'border-red-500': errors.time_zone }"
                >
                  <option value="">Select timezone</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
                <span v-if="errors.time_zone" class="text-red-500 text-sm mt-1 block">{{ errors.time_zone }}</span>
              </div>
            </div>
          </div>

          <!-- Slide 6: Complete -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <i class="pi pi-check text-white text-3xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">All Set! 🎉</h2>
              <p class="text-gray-600 leading-relaxed mb-6">
                Your hotel profile has been successfully set up. You're now ready to manage your hotel operations and provide excellent service to your guests.
              </p>

              <div class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
                <h3 class="font-semibold text-green-900 mb-4">What's next?</h3>
                <div class="space-y-3 text-left">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="pi pi-key text-green-600"></i>
                    </div>
                    <span class="text-green-800">Set up room types and pricing</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="pi pi-users text-green-600"></i>
                    </div>
                    <span class="text-green-800">Add staff members</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="pi pi-calendar text-green-600"></i>
                    </div>
                    <span class="text-green-800">Configure booking settings</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-3">
              <button
                @click="completeOnboarding"
                :disabled="isSaving"
                class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <i v-if="isSaving" class="pi pi-spinner pi-spin mr-2"></i>
                <span v-if="isSaving">Saving...</span>
                <span v-else>Setup Rooms</span>
              </button>

              <button
                @click="previousStep"
                class="w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Review Information
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons (for non-welcome slides) -->
      <div v-if="currentStep !== 0 && currentStep !== totalSteps - 1" class="flex justify-between items-center mt-8">
        <button
          @click="previousStep"
          class="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center"
        >
          <i class="pi pi-arrow-left mr-2"></i>
          Back
        </button>

        <button
          @click="nextStep"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
        >
          {{ currentStep === totalSteps - 2 ? 'Review' : 'Continue' }}
          <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'empty',
})

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const { hotelId } = storeToRefs(authStore)

const currentStep = ref(0)
const isSaving = ref(false)
const isLoading = ref(true)

// Form validation schema
const hotelFormSchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters').max(200),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  country: z.string().min(2, 'Country is required').max(100),
  pincode: z.string().min(5, 'Valid pincode is required').max(10),
  phone: z.string().min(10, 'Valid phone number is required').max(15),
  email: z.string().email('Invalid email address'),
  check_in_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  time_zone: z.string().min(2, 'Time zone is required').max(50),
  google_review_link: z.string().url('Invalid URL format').optional().or(z.literal('')),
})

// Hotel form data
const hotelForm = ref({
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  phone: '',
  email: '',
  check_in_time: '14:00',
  time_zone: 'Asia/Kolkata',
  google_review_link: ''
})

const errors = ref<Record<string, string>>({})

// Steps configuration
const steps = [
  { title: 'Welcome', icon: 'pi-home' },
  { title: 'Basic Info', icon: 'pi-building' },
  { title: 'Contact', icon: 'pi-phone' },
  { title: 'Location', icon: 'pi-map-marker' },
  { title: 'Settings', icon: 'pi-cog' },
  { title: 'Complete', icon: 'pi-check' }
]

const totalSteps = computed(() => steps.length)

const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / totalSteps.value) * 100
})

// Navigation functions
const nextStep = () => {
  // Validate current step before proceeding
  if (!validateCurrentStep()) {
    return
  }

  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Validation function for current step
const validateCurrentStep = () => {
  errors.value = {}

  switch (currentStep.value) {
    case 1: // Basic Information
      if (!hotelForm.value.name || hotelForm.value.name.length < 3) {
        errors.value.name = 'Hotel name must be at least 3 characters'
        return false
      }
      break

    case 2: // Contact Information
      if (!hotelForm.value.phone || hotelForm.value.phone.length < 10) {
        errors.value.phone = 'Valid phone number is required'
        return false
      }
      if (!hotelForm.value.email || !hotelForm.value.email.includes('@')) {
        errors.value.email = 'Valid email address is required'
        return false
      }
      break

    case 3: // Location
      if (!hotelForm.value.address || hotelForm.value.address.length < 5) {
        errors.value.address = 'Address is required'
        return false
      }
      if (!hotelForm.value.city || hotelForm.value.city.length < 2) {
        errors.value.city = 'City is required'
        return false
      }
      if (!hotelForm.value.state || hotelForm.value.state.length < 2) {
        errors.value.state = 'State is required'
        return false
      }
      if (!hotelForm.value.country || hotelForm.value.country.length < 2) {
        errors.value.country = 'Country is required'
        return false
      }
      if (!hotelForm.value.pincode || hotelForm.value.pincode.length < 5) {
        errors.value.pincode = 'Valid pincode is required'
        return false
      }
      break

    case 4: // Operational Settings
      if (!hotelForm.value.check_in_time || !hotelForm.value.check_in_time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        errors.value.check_in_time = 'Valid check-in time is required'
        return false
      }
      if (!hotelForm.value.time_zone) {
        errors.value.time_zone = 'Time zone is required'
        return false
      }
      break
  }

  return true
}

// Complete onboarding
const completeOnboarding = async () => {
  // Validate all fields
  const result = hotelFormSchema.safeParse(hotelForm.value)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const newErrors: Record<string, string> = {}

    for (const key in fieldErrors) {
      if (fieldErrors[key]) {
        newErrors[key] = fieldErrors[key]![0]
      }
    }

    errors.value = newErrors

    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the errors before proceeding',
      life: 5000
    })

    return
  }

  isSaving.value = true

  try {
    // Use the updateHotelProfile mutation
    const { mutate: updateHotelProfile } = usePatchHotel()

    await updateHotelProfile({
      id: hotelId.value,
      ...result.data
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Hotel profile setup completed successfully!',
      life: 3000
    })

    // Redirect to rooms setup
    await router.push('/onboard/rooms')

  } catch (error) {
    console.error('Failed to save hotel profile:', error)

    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to save hotel profile. Please try again.',
      life: 5000
    })
  } finally {
    isSaving.value = false
  }
}

// Fetch existing hotel data
const { data: hotel, isLoading: isHotelLoading, error: hotelError, refetch: refetchHotel } = useFetchHotel(hotelId)

// Watch for hotel data changes and populate form
watch(hotel, (newHotelData) => {
  if (newHotelData) {
    isLoading.value = false

    // Format check_in_time to HH:MM format if it's in HH:MM:SS format
    let checkInTime = newHotelData.check_in_time || '14:00'
    if (checkInTime && checkInTime.includes(':')) {
      const timeParts = checkInTime.split(':')
      if (timeParts.length >= 2) {
        checkInTime = `${timeParts[0]}:${timeParts[1]}`
      }
    }

    hotelForm.value = {
      name: newHotelData.name || '',
      description: newHotelData.description || '',
      address: newHotelData.address || '',
      city: newHotelData.city || '',
      state: newHotelData.state || '',
      country: newHotelData.country || '',
      pincode: newHotelData.pincode || '',
      phone: newHotelData.phone || '',
      email: newHotelData.email || '',
      check_in_time: checkInTime,
      time_zone: newHotelData.time_zone || 'Asia/Kolkata',
      google_review_link: newHotelData.google_review_link || ''
    }
  }
}, { immediate: true, deep: true })

// Watch for loading errors
watch(hotelError, (error) => {
  if (error) {
    isLoading.value = false
    console.error('Error fetching hotel data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load hotel data',
      life: 5000
    })
  }
})

onMounted(() => {
  // Reset any existing state
  currentStep.value = 0
  errors.value = {}
  // Fetch hotel data
  refetchHotel()
})
</script>

<style scoped>
/* Custom animations and transitions */
.transition-transform {
  transition-property: transform;
}

.transition-all {
  transition-property: all;
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

/* Custom scrollbar for mobile */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Focus states */
input:focus,
textarea:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Animation classes */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

/* Button animations */
button:active {
  transform: scale(0.98);
}
</style>
