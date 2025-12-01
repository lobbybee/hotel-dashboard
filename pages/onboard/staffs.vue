<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-20 h-20 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse">
        <i class="pi pi-users text-white text-3xl"></i>
      </div>
      <div class="animate-pulse">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Setting Up Your Team</h2>
        <p class="text-gray-600">Please wait while we prepare your staff management...</p>
      </div>
      <div class="mt-6">
        <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  </div>

  <!-- Main Content (shown when not loading) -->
  <div v-else class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
    <!-- Mobile-friendly header -->
    <div class="w-full px-4 py-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
          <i class="pi pi-users text-white text-lg"></i>
        </div>
        <h1 class="text-xl font-bold text-gray-900 hidden sm:block">Staff Setup</h1>
      </div>

      <!-- Mobile step indicator -->
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Step</span>
        <span class="text-sm font-semibold text-amber-600">{{ currentStep + 1 }}/{{ totalSteps }}</span>
      </div>
    </div>

    <!-- Progress Bar - Mobile First -->
    <div class="w-full px-4 mb-8">
      <div class="relative">
        <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-full transition-all duration-500 ease-out"
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
                'bg-gradient-to-r from-amber-600 to-orange-600 text-white': index < currentStep,
                'bg-amber-600 text-white ring-4 ring-amber-100': index === currentStep,
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
              <div class="w-20 h-20 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <i class="pi pi-users text-white text-3xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                {{ (staffMembers?.value?.length || 0) > 0 ? 'Staff Management' : 'Welcome to Staff Setup' }}
              </h2>
              <p class="text-gray-600 leading-relaxed">
                {{ (staffMembers?.value?.length || 0) > 0
                  ? `You have ${staffMembers.value.length} staff member${staffMembers.value.length === 1 ? '' : 's'} in your team. Let's ensure you have the right roles and permissions.`
                  : "Let's set up your hotel staff team. This will help you manage permissions, roles, and ensure smooth operations across all departments."
                }}
              </p>
            </div>

            <div v-if="(!staffMembers?.value || staffMembers.value.length === 0)" class="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8">
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-info-circle text-amber-600"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900 mb-2">What we'll setup:</h3>
                  <ul class="space-y-2 text-sm text-amber-800">
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Staff member accounts</li>
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Role assignments (Admin, Manager, etc.)</li>
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Department assignments</li>
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Permission settings</li>
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
                  <h3 class="font-semibold text-green-900 mb-2">Your Team Status</h3>
                  <p class="text-sm text-green-800 mb-3">Current staff configuration status:</p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-green-700">Total Staff:</span>
                      <span class="font-semibold text-green-800">{{ staffMembers.value.length }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-green-700">Active Staff:</span>
                      <span class="font-semibold text-green-800">{{ activeStaffCount }}</span>
                    </div>
                    <div v-if="staffMembers.value.length > 0" class="mt-3 p-2 bg-green-100 rounded-lg">
                      <p class="text-xs text-green-700 font-medium">✓ Staff requirements met</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-center">
              <button
                @click="nextStep"
                class="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {{ (!staffMembers?.value || staffMembers.value.length === 0) ? 'Get Started' : 'Manage Staff' }}
                <i class="pi pi-arrow-right ml-2"></i>
              </button>
            </div>
          </div>

          <!-- Slide 2: Staff Management -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
              <div class="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <i class="pi pi-user-plus text-white text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Staff Management</h2>
              <p class="text-gray-600">{{ (!staffMembers?.value || staffMembers.value.length === 0) ? 'Create your first staff account' : 'Manage your existing staff and add new members' }}</p>
            </div>

            <!-- Existing Staff Members -->
            <div v-if="staffMembers?.value?.length > 0" class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Existing Staff Members</h3>
              <div class="space-y-3">
                <div
                  v-for="member in staffMembers.value.slice(0, 3)"
                  :key="member.id"
                  class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center"
                           :style="{ backgroundColor: getRoleColor(member.user_type) }">
                        <i class="pi pi-user text-white text-sm"></i>
                      </div>
                      <div>
                        <h4 class="font-semibold text-gray-900">{{ member.username }}</h4>
                        <p class="text-sm text-gray-600">{{ member.email }}</p>
                        <p class="text-xs text-gray-500">{{ member.phone_number }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :style="{ backgroundColor: getRoleColor(member.user_type) + '20', color: getRoleColor(member.user_type) }"
                      >
                        {{ formatRole(member.user_type) }}
                      </span>
                      <div class="mt-1">
                        <span
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          :class="member.is_active_hotel_user ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                        >
                          {{ member.is_active_hotel_user ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="staffMembers?.value?.length > 3" class="text-center py-2">
                  <p class="text-sm text-gray-500">... and {{ staffMembers.value.length - 3 }} more staff members</p>
                </div>
              </div>
            </div>

            <!-- Add New Staff Form -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h3 class="font-semibold text-gray-900 mb-3">
                {{ (!staffMembers?.value || staffMembers.value.length === 0) ? 'Create Your First Staff Account' : 'Add New Staff Member' }}
              </h3>

              <!-- Form validation error -->
              <div v-if="staffErrors.form" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div class="flex items-center">
                  <i class="pi pi-exclamation-triangle text-red-600 mr-2"></i>
                  <span class="text-red-700 text-sm">{{ staffErrors.form }}</span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <div class="relative">
                      <input
                        v-model="staffForm.username"
                        type="text"
                        class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="John Doe"
                        :class="{ 'border-red-500': staffErrors.username }"
                      />
                      <div class="absolute left-3 top-3.5 text-gray-400">
                        <i class="pi pi-user text-sm"></i>
                      </div>
                    </div>
                    <span v-if="staffErrors.username" class="text-red-500 text-sm mt-1 block">{{ staffErrors.username }}</span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <div class="relative">
                      <input
                        v-model="staffForm.email"
                        type="email"
                        class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="john@example.com"
                        :class="{ 'border-red-500': staffErrors.email }"
                      />
                      <div class="absolute left-3 top-3.5 text-gray-400">
                        <i class="pi pi-envelope text-sm"></i>
                      </div>
                    </div>
                    <span v-if="staffErrors.email" class="text-red-500 text-sm mt-1 block">{{ staffErrors.email }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <div class="relative">
                      <input
                        v-model="staffForm.phone_number"
                        type="tel"
                        class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="+91 98765 43210"
                        :class="{ 'border-red-500': staffErrors.phone_number }"
                      />
                      <div class="absolute left-3 top-3.5 text-gray-400">
                        <i class="pi pi-phone text-sm"></i>
                      </div>
                    </div>
                    <span v-if="staffErrors.phone_number" class="text-red-500 text-sm mt-1 block">{{ staffErrors.phone_number }}</span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div class="relative">
                      <input
                        v-model="staffForm.password"
                        type="password"
                        class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        placeholder="••••••••"
                        :class="{ 'border-red-500': staffErrors.password }"
                      />
                      <div class="absolute left-3 top-3.5 text-gray-400">
                        <i class="pi pi-lock text-sm"></i>
                      </div>
                    </div>
                    <span v-if="staffErrors.password" class="text-red-500 text-sm mt-1 block">{{ staffErrors.password }}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    v-model="staffForm.user_type"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    :class="{ 'border-red-500': staffErrors.user_type }"
                  >
                    <option value="">Select a role</option>
                    <option
                      v-for="type in userTypes"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                  <span v-if="staffErrors.user_type" class="text-red-500 text-sm mt-1 block">{{ staffErrors.user_type }}</span>
                </div>

                <!-- Department selection for department staff -->
                <div v-if="staffForm.user_type === 'department_staff'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <div class="space-y-2">
                    <label
                      v-for="department in departmentChoices"
                      :key="department"
                      class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                    >
                      <input
                        v-model="staffForm.department"
                        :value="department"
                        type="radio"
                        class="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span class="text-gray-700">{{ department }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      v-model="staffForm.is_active_hotel_user"
                      type="checkbox"
                      class="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span class="text-sm text-gray-700">Active staff member</span>
                  </label>
                  <p class="text-xs text-gray-500 mt-1">Inactive users cannot access the hotel system</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 3: Complete -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <i class="pi pi-check text-white text-3xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Team Ready! 🎉</h2>
              <p class="text-gray-600 leading-relaxed mb-6">
                Your staff setup is now complete! You have successfully configured your hotel team members with appropriate roles and permissions.
              </p>

              <div class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
                <h3 class="font-semibold text-green-900 mb-4">Team Summary</h3>
                <div class="space-y-3 text-left">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-users text-green-600"></i>
                      </div>
                      <span class="text-green-800">Total Staff</span>
                    </div>
                    <span class="font-semibold text-green-800">{{ staffMembers?.value?.length || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-check-circle text-green-600"></i>
                      </div>
                      <span class="text-green-800">Active Members</span>
                    </div>
                    <span class="font-semibold text-green-800">{{ activeStaffCount }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-shield text-green-600"></i>
                      </div>
                      <span class="text-green-800">Roles Assigned</span>
                    </div>
                    <span class="font-semibold text-green-800">{{ uniqueRoles.length }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                <h3 class="font-semibold text-blue-900 mb-2">Next Steps</h3>
                <div class="space-y-3 text-left">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="pi pi-cog text-blue-600"></i>
                    </div>
                    <span class="text-blue-800">Configure additional permissions</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="pi pi-calendar text-blue-600"></i>
                    </div>
                    <span class="text-blue-800">Set up staff schedules</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="pi pi-graduation-cap text-blue-600"></i>
                    </div>
                    <span class="text-blue-800">Train staff on hotel systems</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-3">
                <NuxtLink to="/" >
                    <button
                         @click="completeOnboarding"
                         :disabled="isSaving"
                         class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                       >

                         <span>Complete Setup</span>
                       </button>
                </NuxtLink>

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
          @click="handleContinue"
          :disabled="isCreatingStaff"
          class="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <i v-if="isCreatingStaff" class="pi pi-spinner pi-spin mr-2"></i>
          <span v-if="isCreatingStaff">Creating Staff...</span>
          <span v-else>{{ currentStep === totalSteps - 2 ? 'Complete Setup' : 'Continue' }}</span>
          <i v-if="!isCreatingStaff" class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
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
const isCreatingStaff = ref(false)

// API hooks
const {
  staff: staffMembers,
  isLoading: isStaffLoading,
  error: staffError,
  refetch
} = useFetchStaff()

const { createStaff, asyncStatus: createAsyncStatus } = useCreateStaff()

// Form data
const staffForm = reactive({
  username: '',
  email: '',
  password: '',
  user_type: '',
  phone_number: '',
  is_active_hotel_user: true,
  department: '' as string
})

const staffErrors = ref<Record<string, string>>({})

// Department choices (same as in staff.vue)
const departmentChoices = [
  'Housekeeping',
  'Room Service',
  'Café/Restaurant'
]

// User types (same as in staff.vue)
const userTypes = [
  { label: 'Hotel Admin', value: 'hotel_admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Department Staff', value: 'department_staff' },
  { label: 'Other Staff', value: 'other_staff' }
]

// User type colors (same as in staff.vue)
const userTypeColors: Record<string, string> = {
  hotel_admin: '#F59E0B',
  manager: '#3B82F6',
  receptionist: '#10B981',
  department_staff: '#8B5CF6',
  other_staff: '#64748b'
}

// Steps configuration
const steps = [
  { title: 'Welcome', icon: 'pi-home' },
  { title: 'Staff', icon: 'pi-users' },
  { title: 'Complete', icon: 'pi-check' }
]

const totalSteps = computed(() => steps.length)

const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / totalSteps.value) * 100
})

const activeStaffCount = computed(() => {
  if (!staffMembers.value) return 0
  return staffMembers.value.filter(staff => staff.is_active_hotel_user).length
})

const uniqueRoles = computed(() => {
  if (!staffMembers.value) return []
  const roles = new Set(staffMembers.value.map(staff => staff.user_type))
  return Array.from(roles)
})

// Watch for loading states
watch(isStaffLoading, (loading) => {
  if (!loading) {
    isLoading.value = false
  }
})

// Watch for errors
watch(staffError, (error) => {
  if (error) {
    isLoading.value = false
    console.error('Error fetching staff:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load staff members',
      life: 5000
    })
  }
})

// Helper functions (same as in staff.vue)
const getRoleColor = (userType: string) => {
  return userTypeColors[userType] || userTypeColors.other_staff
}

const formatRole = (userType: string) => {
  const type = userTypes.find(t => t.value === userType)
  return type ? type.label : userType
}

// Navigation functions
const handleContinue = async () => {
  // Validate current step before proceeding
  if (!validateCurrentStep()) {
    return
  }

  // If we're on the staff slide and there's meaningful data in the form, create staff first
  if (currentStep.value === 1 && hasSignificantFormData()) {
    const staffCreated = await saveStaff()
    // Proceed to next step after successful staff creation
    if (staffCreated && currentStep.value < totalSteps.value - 1) {
      currentStep.value++
    }
    return
  }

  // Proceed to next step if all conditions are met
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
  }
}

// Helper function to check if form has significant data
const hasSignificantFormData = () => {
  // Check if all required fields are filled
  return staffForm.username.trim() &&
         staffForm.email.trim() &&
         staffForm.user_type &&
         staffForm.password.trim()
}

const nextStep = () => {
  // This function is kept for compatibility but not used in the UI anymore
  handleContinue()
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Validation function for current step
const validateCurrentStep = () => {
  staffErrors.value = {}

  switch (currentStep.value) {
    case 1: // Staff Management - validate if form has significant data or if no staff exists
      // If form has significant data, validate it
      if (hasSignificantFormData()) {
        return validateStaffForm()
      }
      // If no form data and no existing staff, require adding staff
      if (!staffMembers?.value || staffMembers.value.length === 0) {
        staffErrors.value.form = 'Please add at least one staff member to continue'
        return false
      }
      return true
  }

  return true
}

const validateStaffForm = () => {
  const errors: Record<string, string> = {}

  if (!staffForm.username || staffForm.username.length < 2) {
    errors.username = 'Full name is required'
  }

  if (!staffForm.email || !/^\S+@\S+\.\S+$/.test(staffForm.email)) {
    errors.email = 'Valid email address is required'
  }

  if (!staffForm.password || staffForm.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (!staffForm.user_type) {
    errors.user_type = 'Please select a role'
  }

  if (!staffForm.phone_number || staffForm.phone_number.length < 10) {
    errors.phone_number = 'Valid phone number is required'
  }

  if (staffForm.user_type === 'department_staff' && !staffForm.department) {
    errors.department = 'Please select a department'
  }

  staffErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveStaff = async () => {
  if (!validateStaffForm()) {
    return false
  }

  isCreatingStaff.value = true

  try {
    const staffData = {
      username: staffForm.username,
      email: staffForm.email,
      password: staffForm.password,
      user_type: staffForm.user_type,
      phone_number: staffForm.phone_number,
      is_active_hotel_user: staffForm.is_active_hotel_user,
      department: staffForm.user_type === 'department_staff' ? staffForm.department : []
    }

    await createStaff(staffData)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Staff member added successfully!',
      life: 3000
    })

    // Reset form after successful creation
    Object.assign(staffForm, {
      username: '',
      email: '',
      password: '',
      user_type: '',
      phone_number: '',
      is_active_hotel_user: true,
      department: ''
    })
    staffErrors.value = {}

    // Refetch staff to update the list
    await refetch()

    return true

  } catch (error) {
    console.error('Failed to create staff:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to add staff member. Please try again.',
      life: 5000
    })
    return false
  } finally {
    isCreatingStaff.value = false
  }
}

// Complete onboarding
const completeOnboarding = async () => {
  // Ensure minimum requirements are met
  if (!staffMembers?.value || staffMembers.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Setup Incomplete',
      detail: 'Please add at least one staff member',
      life: 5000
    })
    currentStep.value = 1
    return
  }

  isSaving.value = true

  try {
    toast.add({
      severity: 'success',
      summary: 'Setup Complete!',
      detail: 'Staff configuration completed successfully',
      life: 3000
    })

    // Redirect to staff page
    await router.push('/staff')

  } catch (error) {
    console.error('Failed to complete onboarding:', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to complete staff setup. Please try again.',
      life: 5000
    })
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  // Reset any existing state
  currentStep.value = 0
  staffErrors.value = {}
  // Fetch data
  refetch()
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
  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
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

/* Radio button styling */
input[type="radio"]:checked {
  background-color: #F59E0B;
  border-color: #F59E0B;
}

/* Checkbox styling */
input[type="checkbox"]:checked {
  background-color: #F59E0B;
  border-color: #F59E0B;
}
</style>
