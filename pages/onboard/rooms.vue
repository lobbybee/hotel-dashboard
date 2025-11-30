<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse">
        <i class="pi pi-th-large text-white text-3xl"></i>
      </div>
      <div class="animate-pulse">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Setting Up Your Rooms</h2>
        <p class="text-gray-600">Please wait while we prepare your room configuration...</p>
      </div>
      <div class="mt-6">
        <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  </div>

  <!-- Main Content (shown when not loading) -->
  <div v-else class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
    <!-- Mobile-friendly header -->
    <div class="w-full px-4 py-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <i class="pi pi-th-large text-white text-lg"></i>
        </div>
        <h1 class="text-xl font-bold text-gray-900 hidden sm:block">Room Setup</h1>
      </div>

      <!-- Mobile step indicator -->
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Step</span>
        <span class="text-sm font-semibold text-purple-600">{{ currentStep + 1 }}/{{ totalSteps }}</span>
      </div>
    </div>

    <!-- Progress Bar - Mobile First -->
    <div class="w-full px-4 mb-8">
      <div class="relative">
        <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
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
                'bg-gradient-to-r from-purple-600 to-indigo-600 text-white': index < currentStep,
                'bg-purple-600 text-white ring-4 ring-purple-100': index === currentStep,
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
              <div class="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <i class="pi pi-th-large text-white text-3xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">
                {{ (categories?.length || 0) > 0 ? 'Room Configuration' : 'Welcome to Room Setup' }}
              </h2>
              <p class="text-gray-600 leading-relaxed">
                {{ (categories?.length || 0) > 0
                  ? `You have ${categories?.length || 0} room categor${(categories?.length || 0) === 1 ? 'y' : 'ies'} and ${totalRooms} room${totalRooms === 1 ? '' : 's'}. Let's ensure your room setup is complete.`
                  : "Let's set up your room categories and create your first rooms. This will help you manage your hotel inventory effectively."
                }}
              </p>
            </div>

            <div v-if="(categories?.length || 0) === 0" class="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="pi pi-info-circle text-purple-600"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-purple-900 mb-2">What we'll setup:</h3>
                  <ul class="space-y-2 text-sm text-purple-800">
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Room categories (Deluxe, Standard, etc.)</li>
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Pricing and occupancy settings</li>
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Room amenities and features</li>
                    <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Create your first rooms</li>
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
                  <h3 class="font-semibold text-green-900 mb-2">Your Room Status</h3>
                  <p class="text-sm text-green-800 mb-3">Current room configuration status:</p>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-green-700">Categories:</span>
                      <span class="font-semibold text-green-800">{{ categories?.length || 0 }} {{ (categories?.length || 0) === 1 ? 'type' : 'types' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-green-700">Total Rooms:</span>
                      <span class="font-semibold text-green-800">{{ totalRooms }}</span>
                    </div>
                    <div v-if="(categories?.length || 0) > 0 && totalRooms > 0" class="mt-3 p-2 bg-green-100 rounded-lg">
                      <p class="text-xs text-green-700 font-medium">✓ Minimum requirements met</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-center">
              <button
                @click="nextStep"
                class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {{ (categories?.length || 0) === 0 ? 'Get Started' : 'Review Categories' }}
                <i class="pi pi-arrow-right ml-2"></i>
              </button>
            </div>
          </div>

          <!-- Slide 2: Room Categories -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <i class="pi pi-tag text-white text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Room Categories</h2>
              <p class="text-gray-600">{{ (categories?.length || 0) === 0 ? 'Create your first room category' : 'Review and manage your room categories' }}</p>
            </div>

            <!-- Existing Categories -->
            <div v-if="(categories?.length || 0) > 0" class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Existing Categories</h3>
              <div class="space-y-3">
                <div
                  v-for="category in categories.filter(c => c && c.id && c.name)"
                  :key="category?.id || category"
                  class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ category?.name }}</h4>
                      <p class="text-sm text-gray-600">{{ category?.description }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-purple-600">₹{{ category?.base_price }}</p>
                      <p class="text-xs text-gray-500">{{ category?.max_occupancy }} guests</p>
                    </div>
                  </div>
                  <div v-if="category?.amenities && category?.amenities?.length > 0" class="flex flex-wrap gap-2">
                    <span
                      v-for="amenity in category.amenities?.slice(0, 3) || []"
                      :key="amenity"
                      class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    >
                      {{ amenity }}
                    </span>
                    <span v-if="category.amenities?.length > 3" class="text-xs text-gray-500">
                      +{{ category.amenities.length - 3 }} more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add New Category Form -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h3 class="font-semibold text-gray-900 mb-3">
                {{ (categories?.length || 0) === 0 ? 'Create Your First Category' : 'Add Another Category (Optional)' }}
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                  <input
                    v-model="categoryForm.name"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="e.g., Deluxe Room, Standard Room, Suite"
                    :class="{ 'border-red-500': categoryErrors.name }"
                  />
                  <span v-if="categoryErrors.name" class="text-red-500 text-sm mt-1 block">{{ categoryErrors.name }}</span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    v-model="categoryForm.description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                    placeholder="Describe this room category"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
                    <div class="relative">
                      <input
                        v-model="categoryForm.base_price"
                        type="number"
                        class="w-full px-4 py-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="0"
                        :class="{ 'border-red-500': categoryErrors.base_price }"
                      />
                      <div class="absolute left-3 top-3.5 text-gray-500">₹</div>
                    </div>
                    <span v-if="categoryErrors.base_price" class="text-red-500 text-sm mt-1 block">{{ categoryErrors.base_price }}</span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Max Occupancy *</label>
                    <div class="relative">
                      <input
                        v-model="categoryForm.max_occupancy"
                        type="number"
                        min="1"
                        class="w-full px-4 py-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="2"
                        :class="{ 'border-red-500': categoryErrors.max_occupancy }"
                      />
                      <div class="absolute left-3 top-3.5 text-gray-500">
                        <i class="pi pi-user text-xs"></i>
                      </div>
                    </div>
                    <span v-if="categoryErrors.max_occupancy" class="text-red-500 text-sm mt-1 block">{{ categoryErrors.max_occupancy }}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div class="max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
                    <div class="grid grid-cols-2 gap-2">
                      <label
                        v-for="amenity in availableAmenities"
                        :key="amenity"
                        class="flex items-center space-x-2 text-sm cursor-pointer hover:bg-purple-50 p-2 rounded"
                      >
                        <input
                          v-model="categoryForm.amenities"
                          :value="amenity"
                          type="checkbox"
                          class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span class="text-gray-700">{{ amenity }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 3: Create Rooms -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="mb-8">
              <div class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <i class="pi pi-door-open text-white text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Create Rooms</h2>
              <p class="text-gray-600">{{ totalRooms === 0 ? 'Let\'s create your first rooms' : 'Add more rooms to your inventory' }}</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Room Category *</label>
                <select
                  v-model="bulkAddForm.categoryId"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  :class="{ 'border-red-500': bulkAddErrors.categoryId }"
                >
                  <option value="">Select a category</option>
                  <option
                    v-for="category in (Array.isArray(categories) ? categories.filter(c => c && c.id && c.name) : [])"
                    :key="category?.id"
                    :value="category?.id"
                  >
                    {{ category?.name || 'Unnamed Category' }} - ₹{{ category?.base_price || 0 }}
                  </option>
                </select>
                <span v-if="bulkAddErrors.categoryId" class="text-red-500 text-sm mt-1 block">{{ bulkAddErrors.categoryId }}</span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
                <div class="relative">
                  <input
                    v-model="bulkAddForm.floor"
                    type="number"
                    min="1"
                    class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="1"
                    :class="{ 'border-red-500': bulkAddErrors.floor }"
                  />
                  <div class="absolute left-4 top-3.5 text-gray-400">
                    <i class="pi pi-building"></i>
                  </div>
                </div>
                <span v-if="bulkAddErrors.floor" class="text-red-500 text-sm mt-1 block">{{ bulkAddErrors.floor }}</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Start Room Number *</label>
                  <input
                    v-model="bulkAddForm.startRoomNumber"
                    type="number"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="101"
                    :class="{ 'border-red-500': bulkAddErrors.startRoomNumber }"
                  />
                  <span v-if="bulkAddErrors.startRoomNumber" class="text-red-500 text-sm mt-1 block">{{ bulkAddErrors.startRoomNumber }}</span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">End Room Number *</label>
                  <input
                    v-model="bulkAddForm.endRoomNumber"
                    type="number"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="110"
                    :class="{ 'border-red-500': bulkAddErrors.endRoomNumber }"
                  />
                  <span v-if="bulkAddErrors.endRoomNumber" class="text-red-500 text-sm mt-1 block">{{ bulkAddErrors.endRoomNumber }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Room Prefix</label>
                  <input
                    v-model="bulkAddForm.roomPrefix"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="e.g., DEL-"
                  />
                  <p class="text-xs text-gray-500 mt-1">Optional prefix for room numbers</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Room Suffix</label>
                  <input
                    v-model="bulkAddForm.roomSuffix"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="e.g., -A"
                  />
                  <p class="text-xs text-gray-500 mt-1">Optional suffix for room numbers</p>
                </div>
              </div>

              <div v-if="estimatedRoomCount > 0" class="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="pi pi-info-circle text-blue-600"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-blue-900">Room Preview</p>
                    <p class="text-xs text-blue-800">
                      Creating {{ estimatedRoomCount }} room{{ estimatedRoomCount === 1 ? '' : 's' }} on floor {{ bulkAddForm.floor }}
                    </p>
                    <p class="text-xs text-blue-700 mt-1">
                      Example: {{ formatRoomNumber(bulkAddForm.startRoomNumber) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 4: Complete -->
          <div class="w-full flex-shrink-0 px-4">
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <i class="pi pi-check text-white text-3xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Rooms Ready! 🎉</h2>
              <p class="text-gray-600 leading-relaxed mb-6">
                Your room setup is now complete! You have successfully configured your hotel's room inventory and are ready to start managing your bookings.
              </p>

              <div class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
                <h3 class="font-semibold text-green-900 mb-4">Setup Summary</h3>
                <div class="space-y-3 text-left">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-tag text-green-600"></i>
                      </div>
                      <span class="text-green-800">Room Categories</span>
                    </div>
                    <span class="font-semibold text-green-800">{{ categories?.length || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-th-large text-green-600"></i>
                      </div>
                      <span class="text-green-800">Total Rooms</span>
                    </div>
                    <span class="font-semibold text-green-800">{{ totalRooms }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="pi pi-building text-green-600"></i>
                      </div>
                      <span class="text-green-800">Floors Used</span>
                    </div>
                    <span class="font-semibold text-green-800">{{ uniqueFloors.length }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col space-y-3">

              <button
                @click="router.push('/onboard/staffs')"
                class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Next Onboard Staffs
                <i class="pi pi-arrow-right ml-2"></i>
              </button>

              <button
                @click="previousStep"
                class="w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Review Setup
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

        <div class="flex space-x-3">
          <button
            @click="nextStep"
            :disabled="isCreatingCategory || isCreatingRooms"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <i v-if="currentStep === 1 && isCreatingCategory" class="pi pi-spinner pi-spin mr-2"></i>
            <i v-else-if="currentStep === 2 && isCreatingRooms" class="pi pi-spinner pi-spin mr-2"></i>
            {{ currentStep === totalSteps - 2 ? 'Complete Setup' : 'Continue' }}
            <i class="pi pi-arrow-right ml-2"></i>
          </button>
        </div>
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
const isCreatingCategory = ref(false)
const isCreatingRooms = ref(false)

// API hooks
const {
  data: categoriesData,
  isLoading: isCategoriesLoading,
  error: categoriesError,
  refetch: refetchCategories
} = useFetchRoomCategories({ page: 1, search: '' })

// Computed properties to extract the actual data
const categories = computed(() => categoriesData.value?.results || [])

const {
  data: roomsData,
  isLoading: isRoomsLoading,
  error: roomsError,
  refetch: refetchRooms
} = useFetchRooms({ page: 1, search: '' })

const { mutateAsync: createCategory, status: createCategoryStatus } = useCreateRoomCategory()
const { mutateAsync: bulkCreateRooms, status: bulkCreateRoomsStatus } = useBulkCreateRooms()

// Forms
const categoryForm = reactive({
  name: '',
  description: '',
  base_price: 0,
  max_occupancy: 2,
  amenities: [] as string[],
})

const DEFAULT_BULK_ADD_FORM = {
  startRoomNumber: 101,
  endRoomNumber: 105,
  floor: 1,
  categoryId: null as number | null,
  roomPrefix: '',
  roomSuffix: '',
}

const bulkAddForm = reactive({ ...DEFAULT_BULK_ADD_FORM })

const categoryErrors = ref<Record<string, string>>({})
const bulkAddErrors = ref<Record<string, string>>({})

// Available amenities (same as in rooms.vue)
const availableAmenities = [
  "WiFi",
  "TV",
  "Smart TV",
  "Mini Fridge",
  "Mini Bar",
  "Coffee Maker",
  "Balcony",
  "Room Service",
  "Safe",
  "Hair Dryer",
  "Iron",
  "Bathrobe",
  "Jacuzzi",
  "Swimming Pool Access",
  "Gym Access",
  "Parking",
  "Breakfast Included",
]

// Steps configuration
const steps = [
  { title: 'Welcome', icon: 'pi-home' },
  { title: 'Categories', icon: 'pi-tag' },
  { title: 'Rooms', icon: 'pi-th-large' },
  { title: 'Complete', icon: 'pi-check' }
]

const totalSteps = computed(() => steps.length)

const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / totalSteps.value) * 100
})

const totalRooms = computed(() => roomsData.value?.total || 0)

const uniqueFloors = computed(() => {
  const floors = new Set()
  if (roomsData.value?.data) {
    roomsData.value.data.forEach(room => floors.add(room.floor))
  }
  return Array.from(floors)
})

const estimatedRoomCount = computed(() => {
  if (bulkAddForm.startRoomNumber && bulkAddForm.endRoomNumber) {
    return Math.max(0, bulkAddForm.endRoomNumber - bulkAddForm.startRoomNumber + 1)
  }
  return 0
})

// Watch for loading states
watch([isCategoriesLoading, isRoomsLoading], ([categoriesLoading, roomsLoading]) => {
  if (!categoriesLoading && !roomsLoading) {
    isLoading.value = false
  }
})

// Watch for errors
watch(categoriesError, (error) => {
  if (error) {
    isLoading.value = false
    console.error('Error fetching categories:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load room categories',
      life: 5000
    })
  }
})

watch(roomsError, (error) => {
  if (error) {
    isLoading.value = false
    console.error('Error fetching rooms:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load rooms',
      life: 5000
    })
  }
})

// Navigation functions
const nextStep = async () => {
  // Validate current step before proceeding
  if (!validateCurrentStep()) {
    return
  }

  // Handle category creation when moving from step 1 to 2
  if (currentStep.value === 1 &&
      (categoryForm.name || categoryForm.base_price || categoryForm.max_occupancy)) {
    // Create category first, then proceed
    await saveCategory()
    // Don't proceed if category creation failed
    if (isCreatingCategory.value) {
      return
    }
  }

  // Handle room creation when moving from step 2 to 3
  if (currentStep.value === 2 &&
      (bulkAddForm.startRoomNumber && bulkAddForm.endRoomNumber && bulkAddForm.categoryId)) {
    // Create rooms first, then proceed
    await bulkAddRooms()
    // Don't proceed if room creation failed
    if (isCreatingRooms.value) {
      return
    }
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
  categoryErrors.value = {}
  bulkAddErrors.value = {}

  switch (currentStep.value) {
    case 1: // Room Categories
      // If user has filled out the category form, validate it
      if (categoryForm.name || categoryForm.base_price || categoryForm.max_occupancy) {
        return validateCategoryForm()
      }
      // No category data entered, allow to proceed
      return true

    case 2: // Create Rooms - only validate if user is trying to add
      if (bulkAddForm.categoryId || bulkAddForm.startRoomNumber || bulkAddForm.endRoomNumber) {
        return validateBulkAddForm()
      }
      // Check if we have at least 1 room already
      return totalRooms.value >= 1
  }

  return true
}

const validateCategoryForm = () => {
  const errors: Record<string, string> = {}

  if (!categoryForm.name || categoryForm.name.length < 2) {
    errors.name = 'Category name is required'
  }

  if (!categoryForm.base_price || categoryForm.base_price <= 0) {
    errors.base_price = 'Base price must be greater than 0'
  }

  if (!categoryForm.max_occupancy || categoryForm.max_occupancy < 1) {
    errors.max_occupancy = 'Max occupancy must be at least 1'
  }

  categoryErrors.value = errors
  return Object.keys(errors).length === 0
}

const validateBulkAddForm = () => {
  const errors: Record<string, string> = {}

  if (!bulkAddForm.categoryId) {
    errors.categoryId = 'Please select a room category'
  }

  if (!bulkAddForm.floor || bulkAddForm.floor < 1) {
    errors.floor = 'Floor must be at least 1'
  }

  if (!bulkAddForm.startRoomNumber || bulkAddForm.startRoomNumber < 1) {
    errors.startRoomNumber = 'Start room number is required'
  }

  if (!bulkAddForm.endRoomNumber || bulkAddForm.endRoomNumber < 1) {
    errors.endRoomNumber = 'End room number is required'
  }

  if (bulkAddForm.startRoomNumber && bulkAddForm.endRoomNumber &&
      bulkAddForm.startRoomNumber > bulkAddForm.endRoomNumber) {
    errors.endRoomNumber = 'End room number must be greater than start'
  }

  bulkAddErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveCategory = async () => {
  if (!validateCategoryForm()) {
    return
  }

  isCreatingCategory.value = true

  try {
    await createCategory(categoryForm)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Room category created successfully!',
      life: 3000
    })

    // Reset form
    Object.assign(categoryForm, {
      name: '',
      description: '',
      base_price: 0,
      max_occupancy: 2,
      amenities: []
    })

    // Refetch categories to include the newly created one
    // Small delay to ensure the category is properly saved on the backend
    await new Promise(resolve => setTimeout(resolve, 500))
    await refetchCategories()

  } catch (error) {
    console.error('Failed to create category:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create room category. Please try again.',
      life: 5000
    })
  } finally {
    isCreatingCategory.value = false
  }
}

const formatRoomNumber = (num: number) => {
  let result = ''
  if (bulkAddForm.roomPrefix) {
    result += bulkAddForm.roomPrefix
  }
  result += num.toString()
  if (bulkAddForm.roomSuffix) {
    result += bulkAddForm.roomSuffix
  }
  return result
}

const bulkAddRooms = async () => {
  if (!validateBulkAddForm()) {
    return
  }

  isCreatingRooms.value = true

  try {
    await bulkCreateRooms({
      category: bulkAddForm.categoryId!,
      floor: bulkAddForm.floor,
      start_number: bulkAddForm.startRoomNumber.toString(),
      end_number: bulkAddForm.endRoomNumber.toString(),
      room_prefix: bulkAddForm.roomPrefix || undefined,
      room_suffix: bulkAddForm.roomSuffix || undefined,
    })

    const roomCount = bulkAddForm.endRoomNumber - bulkAddForm.startRoomNumber + 1
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${roomCount} rooms created successfully!`,
      life: 3000
    })

    // Reset form
    Object.assign(bulkAddForm, DEFAULT_BULK_ADD_FORM)

    // Refetch rooms
    await refetchRooms()

  } catch (error) {
    console.error('Failed to create rooms:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create rooms. Please try again.',
      life: 5000
    })
  } finally {
    isCreatingRooms.value = false
  }
}

// Complete onboarding
const completeOnboarding = async () => {
  // Ensure minimum requirements are met
  if (categories.value && categories.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Setup Incomplete',
      detail: 'Please create at least one room category',
      life: 5000
    })
    currentStep.value = 1
    return
  }

  isSaving.value = true

  try {
    // Auto-create rooms if none exist
    if (totalRooms.value === 0 && categories.value.length > 0) {
      const firstCategory = categories.value[0]
      // Reset form to defaults and set the category
      Object.assign(bulkAddForm, {
        ...DEFAULT_BULK_ADD_FORM,
        categoryId: firstCategory.id
      })

      await bulkCreateRooms({
        category: firstCategory.id,
        floor: bulkAddForm.floor || 1,
        start_number: (bulkAddForm.startRoomNumber || 101).toString(),
        end_number: (bulkAddForm.endRoomNumber || 105).toString(),
        room_prefix: bulkAddForm.roomPrefix || undefined,
        room_suffix: bulkAddForm.roomSuffix || undefined,
      })

      toast.add({
        severity: 'info',
        summary: 'Rooms Created',
        detail: '5 sample rooms have been automatically created',
        life: 3000
      })
    }

    toast.add({
      severity: 'success',
      summary: 'Setup Complete!',
      detail: 'Room configuration completed successfully',
      life: 3000
    })

    // Redirect to rooms page
    await router.push('/rooms')

  } catch (error) {
    console.error('Failed to complete onboarding:', error)

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to complete room setup. Please try again.',
      life: 5000
    })
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  // Reset any existing state
  currentStep.value = 0
  categoryErrors.value = {}
  bulkAddErrors.value = {}
  // Fetch data
  refetchCategories()
  refetchRooms()
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
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
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

/* Checkbox styling */
input[type="checkbox"]:checked {
  background-color: #9333ea;
  border-color: #9333ea;
}
</style>
