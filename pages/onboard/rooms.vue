<template>
  <OnboardingOnboardLayout
    title="Room Setup"
    icon="pi-th-large"
    color-scheme="purple"
    :steps="steps"
    :current-step="currentStep"
    :is-loading="isLoading"
    loading-title="Setting Up Your Rooms"
    loading-subtitle="Please wait while we prepare your room configuration..."
    :is-saving="isCreating"
    :show-navigation="currentStep !== 0 && currentStep !== steps.length - 1"
    :continue-button-text="getButtonText()"
    :continue-disabled="isContinueDisabled"
    :api-error="apiError"
    @next="handleNext"
    @retry="retryFetch"
  >
    <!-- Slide 0: Welcome -->
    <template #slide-0>
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-th-large text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ (categories?.length || 0) > 0 ? 'Room Configuration' : 'Welcome to Room Setup' }}
        </h2>
        <p class="text-gray-600 leading-relaxed">
          {{ (categories?.length || 0) > 0
            ? `You have ${categories?.length || 0} room categories and ${totalRooms} rooms.`
            : "Let's set up your room categories and create your first rooms."
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
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Multiple room categories</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Pricing and occupancy</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-purple-600"></i> Bulk room creation</li>
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
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-green-700">Categories:</span>
                <span class="font-semibold text-green-800">{{ categories?.length || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-green-700">Total Rooms:</span>
                <span class="font-semibold text-green-800">{{ totalRooms }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button @click="nextStep" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
          {{ (categories?.length || 0) === 0 ? 'Get Started' : 'Add More' }}
          <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </template>

    <!-- Slide 1: Room Categories (Multiple) -->
    <template #slide-1>
      <div class="mb-4 text-center">
        <div class="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <i class="pi pi-tag text-white text-xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-1">Room Categories</h2>
        <p class="text-gray-600 text-sm">Add one or more categories, then continue</p>
      </div>

      <!-- Queued Categories (to be created) -->
      <div v-if="categoryQueue.length > 0" class="mb-4">
        <h3 class="font-semibold text-gray-900 mb-2 text-sm flex items-center">
          <i class="pi pi-list mr-2 text-purple-600"></i>
          Categories to Create ({{ categoryQueue.length }})
        </h3>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="(cat, idx) in categoryQueue" :key="idx" 
            @click="editCategory(idx)" 
            class="bg-purple-50 border rounded-lg p-2 text-sm flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors"
            :class="editingCategoryIndex === idx ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-200'"
          >
            <div class="flex items-center">
              <i v-if="editingCategoryIndex === idx" class="pi pi-pencil text-purple-600 mr-2 text-xs"></i>
              <span class="font-medium text-gray-900">{{ cat.name }}</span>
              <span class="text-purple-600 ml-2">₹{{ cat.base_price }}</span>
              <span class="text-gray-500 ml-2 text-xs">({{ cat.max_occupancy }} guests)</span>
            </div>
            <button @click.stop="removeCategoryFromQueue(idx)" class="text-red-500 hover:text-red-700 p-1">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
        </div>
        <!-- Add Another button when form is hidden -->
        <button v-if="!showCategoryForm" @click="showCategoryForm = true" class="w-full mt-3 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
          <i class="pi pi-plus mr-2"></i>Add Another Category
        </button>
      </div>

      <!-- Add Category Form -->
      <div v-if="showCategoryForm" class="bg-gray-50 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-3 text-sm flex items-center">
          <i v-if="editingCategoryIndex !== null" class="pi pi-pencil mr-2 text-purple-600"></i>
          {{ editingCategoryIndex !== null ? 'Edit Category' : (categoryQueue.length > 0 ? 'Add Another Category' : 'Category Details') }}
        </h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input v-model="categoryForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm" placeholder="e.g., Deluxe Room" :class="{ 'border-red-500': categoryErrors.name }" />
            <span v-if="categoryErrors.name" class="text-red-500 text-xs">{{ categoryErrors.name }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <div class="relative">
                <input v-model="categoryForm.base_price" type="number" class="w-full px-3 py-2 pl-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm" placeholder="0" :class="{ 'border-red-500': categoryErrors.base_price }" />
                <span class="absolute left-2 top-2 text-gray-500 text-sm">₹</span>
              </div>
              <span v-if="categoryErrors.base_price" class="text-red-500 text-xs">{{ categoryErrors.base_price }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
              <input v-model="categoryForm.max_occupancy" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm" placeholder="2" :class="{ 'border-red-500': categoryErrors.max_occupancy }" />
              <span v-if="categoryErrors.max_occupancy" class="text-red-500 text-xs">{{ categoryErrors.max_occupancy }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button v-if="editingCategoryIndex !== null" @click="updateCategoryInQueue" class="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
              <i class="pi pi-check mr-2"></i>Update
            </button>
            <template v-else>
              <button @click="addCategoryToQueue" class="flex-1 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                <i class="pi pi-plus mr-2"></i>Add Another
              </button>
              <button @click="addCategoryAndDone" class="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                <i class="pi pi-check mr-2"></i>Done
              </button>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- Slide 2: Create Rooms (Multiple Ranges) -->
    <template #slide-2>
      <div class="mb-4 text-center">
        <div class="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <i class="pi pi-door-open text-white text-xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-1">Create Rooms</h2>
        <p class="text-gray-600 text-sm">Add room ranges for different floors/categories</p>
      </div>

      <!-- Queued Room Ranges -->
      <div v-if="roomRangeQueue.length > 0" class="mb-4">
        <h3 class="font-semibold text-gray-900 mb-2 text-sm flex items-center">
          <i class="pi pi-list mr-2 text-green-600"></i>
          Room Ranges ({{ totalQueuedRooms }} rooms)
        </h3>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="(range, idx) in roomRangeQueue" :key="idx"
            @click="editRoomRange(idx)"
            class="bg-green-50 border rounded-lg p-2 text-sm flex justify-between items-center cursor-pointer hover:bg-green-100 transition-colors"
            :class="editingRoomRangeIndex === idx ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200'"
          >
            <div class="flex items-center">
              <i v-if="editingRoomRangeIndex === idx" class="pi pi-pencil text-green-600 mr-2 text-xs"></i>
              <span class="font-medium text-gray-900">{{ getCategoryNameById(range.category) }}</span>
              <span class="text-gray-600 ml-2">Floor {{ range.floor }}</span>
              <span class="text-green-600 ml-2">Rooms {{ range.start_number }}-{{ range.end_number }}</span>
              <span class="text-gray-500 ml-2 text-xs">({{ getRangeRoomCount(range) }} rooms)</span>
            </div>
            <button @click.stop="removeRoomRangeFromQueue(idx)" class="text-red-500 hover:text-red-700 p-1">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
        </div>
        <!-- Add Another button when form is hidden -->
        <button v-if="!showRoomRangeForm" @click="showRoomRangeForm = true" class="w-full mt-3 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
          <i class="pi pi-plus mr-2"></i>Add Another Range
        </button>
      </div>

      <!-- Add Room Range Form -->
      <div v-if="showRoomRangeForm" class="bg-gray-50 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-3 text-sm flex items-center">
          <i v-if="editingRoomRangeIndex !== null" class="pi pi-pencil mr-2 text-green-600"></i>
          {{ editingRoomRangeIndex !== null ? 'Edit Range' : (roomRangeQueue.length > 0 ? 'Add Another Range' : 'Room Range Details') }}
        </h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select v-model="roomRangeForm.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm" :class="{ 'border-red-500': roomRangeErrors.category }">
              <option :value="null">Select category</option>
              <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">{{ cat.name }} - ₹{{ cat.base_price }}</option>
            </select>
            <span v-if="roomRangeErrors.category" class="text-red-500 text-xs">{{ roomRangeErrors.category }}</span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
            <input v-model="roomRangeForm.floor" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm" placeholder="1" :class="{ 'border-red-500': roomRangeErrors.floor }" />
            <span v-if="roomRangeErrors.floor" class="text-red-500 text-xs">{{ roomRangeErrors.floor }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start #</label>
              <input v-model="roomRangeForm.start_number" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm" placeholder="101" :class="{ 'border-red-500': roomRangeErrors.start_number }" />
              <span v-if="roomRangeErrors.start_number" class="text-red-500 text-xs">{{ roomRangeErrors.start_number }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End #</label>
              <input v-model="roomRangeForm.end_number" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm" placeholder="110" :class="{ 'border-red-500': roomRangeErrors.end_number }" />
              <span v-if="roomRangeErrors.end_number" class="text-red-500 text-xs">{{ roomRangeErrors.end_number }}</span>
            </div>
          </div>

          <div v-if="currentRangeRoomCount > 0" class="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
            <p class="text-sm text-blue-800">{{ currentRangeRoomCount }} rooms on floor {{ roomRangeForm.floor }}</p>
          </div>

          <div class="flex gap-2">
            <button v-if="editingRoomRangeIndex !== null" @click="updateRoomRangeInQueue" class="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              <i class="pi pi-check mr-2"></i>Update
            </button>
            <template v-else>
              <button @click="addRoomRangeToQueue" class="flex-1 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                <i class="pi pi-plus mr-2"></i>Add Another
              </button>
              <button @click="addRoomRangeAndDone" class="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                <i class="pi pi-check mr-2"></i>Done
              </button>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- Slide 3: Complete -->
    <template #slide-3>
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-check text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Rooms Ready! 🎉</h2>
        <p class="text-gray-600 mb-6">Your room setup is complete.</p>

        <div class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
          <h3 class="font-semibold text-green-900 mb-4">What's next?</h3>
          <div class="space-y-3 text-left">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i class="pi pi-users text-green-600"></i></div>
              <span class="text-green-800">Add your staff members</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i class="pi pi-calendar text-green-600"></i></div>
              <span class="text-green-800">Start accepting bookings</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button @click="router.push('/onboard/staffs')" class="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
          Setup Staff <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </template>
  </OnboardingOnboardLayout>

  <!-- Bulk Create Confirmation Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showConfirmModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-modal-in">
          <div :class="confirmModalGradient" class="px-6 py-4 rounded-t-2xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i :class="confirmModalIcon" class="text-white text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ confirmModalTitle }}</h3>
                <p class="text-white/80 text-sm">Review before creating</p>
              </div>
            </div>
          </div>
          
          <div class="p-6 max-h-60 overflow-y-auto">
            <!-- Categories Confirmation -->
            <div v-if="confirmType === 'categories'" class="space-y-2">
              <div v-for="(cat, idx) in categoryQueue" :key="idx" class="p-3 bg-gray-50 rounded-lg flex justify-between">
                <span class="font-medium">{{ cat.name }}</span>
                <span class="text-purple-600">₹{{ cat.base_price }}</span>
              </div>
              <div class="mt-3 p-3 bg-purple-50 rounded-lg text-center">
                <p class="text-purple-800 font-semibold">{{ categoryQueue.length }} categories will be created</p>
              </div>
            </div>
            
            <!-- Rooms Confirmation -->
            <div v-if="confirmType === 'rooms'" class="space-y-2">
              <div v-for="(range, idx) in roomRangeQueue" :key="idx" class="p-3 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="font-medium">{{ getCategoryNameById(range.category) }}</span>
                  <span class="text-xs text-gray-500">{{ getRangeRoomCount(range) }} rooms</span>
                </div>
                <div class="text-sm text-gray-600">Floor {{ range.floor }}: {{ range.start_number }} - {{ range.end_number }}</div>
              </div>
              <div class="mt-3 p-3 bg-green-50 rounded-lg text-center">
                <p class="text-green-800 font-semibold">{{ totalQueuedRooms }} rooms will be created</p>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex space-x-3">
            <button @click="showConfirmModal = false" class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100">Edit</button>
            <button @click="confirmCreate" :disabled="isCreating" :class="confirmButtonClass" class="flex-1 px-4 py-3 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center">
              <i v-if="isCreating" class="pi pi-spinner pi-spin mr-2"></i>
              {{ isCreating ? 'Creating...' : 'Create All' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

definePageMeta({ layout: 'empty' })

const router = useRouter()
const toast = useToast()

const currentStep = ref(0)
const isLoading = ref(true)
const isCreating = ref(false)
const showConfirmModal = ref(false)
const confirmType = ref<'categories' | 'rooms'>('categories')

const steps = [{ title: 'Welcome' }, { title: 'Categories' }, { title: 'Rooms' }, { title: 'Complete' }]

// API hooks
const { data: categoriesData, isLoading: isCategoriesLoading, error: categoriesError, refetch: refetchCategories } = useFetchRoomCategories(computed(() => ({ page: 1, search: '' })))
const categories = computed(() => (categoriesData.value as any)?.results || (Array.isArray(categoriesData.value) ? categoriesData.value : []))
const { data: roomsData, isLoading: isRoomsLoading, error: roomsError, refetch: refetchRooms } = useFetchRooms(computed(() => ({ page: 1, search: '' })))
const { mutateAsync: createCategories } = useCreateRoomCategory()
const { mutateAsync: bulkCreateRooms } = useBulkCreateRooms()

// API Error state
const apiError = computed(() => categoriesError.value || roomsError.value)
const retryFetch = () => {
  refetchCategories()
  refetchRooms()
}

// Category form & queue
interface CategoryItem { name: string; description: string; base_price: number; max_occupancy: number }
const categoryForm = reactive<CategoryItem>({ name: '', description: '', base_price: 0, max_occupancy: 2 })
const categoryQueue = ref<CategoryItem[]>([])
const categoryErrors = ref<Record<string, string>>({})
const editingCategoryIndex = ref<number | null>(null)
const showCategoryForm = ref(true)

// Room range form & queue
interface RoomRange { category: number | null; floor: number; start_number: number; end_number: number }
const roomRangeForm = reactive<RoomRange>({ category: null, floor: 1, start_number: 101, end_number: 105 })
const roomRangeQueue = ref<RoomRange[]>([])
const roomRangeErrors = ref<Record<string, string>>({})
const editingRoomRangeIndex = ref<number | null>(null)
const showRoomRangeForm = ref(true)

// Computed
const totalRooms = computed(() => (roomsData.value as any)?.count || (roomsData.value as any)?.total || 0)
const allCategories = computed(() => categories.value)
const totalQueuedRooms = computed(() => roomRangeQueue.value.reduce((sum, r) => sum + getRangeRoomCount(r), 0))
const currentRangeRoomCount = computed(() => roomRangeForm.start_number && roomRangeForm.end_number ? Math.max(0, roomRangeForm.end_number - roomRangeForm.start_number + 1) : 0)

const confirmModalGradient = computed(() => confirmType.value === 'categories' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-emerald-600')
const confirmModalIcon = computed(() => confirmType.value === 'categories' ? 'pi pi-tag' : 'pi pi-door-open')
const confirmModalTitle = computed(() => confirmType.value === 'categories' ? 'Create Categories' : 'Create Rooms')
const confirmButtonClass = computed(() => confirmType.value === 'categories' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-emerald-600')

// Check if form has valid data
const hasCategoryFormData = computed(() => categoryForm.name && categoryForm.name.length >= 2 && categoryForm.base_price > 0 && categoryForm.max_occupancy >= 1)
const hasRoomRangeFormData = computed(() => roomRangeForm.category && roomRangeForm.floor >= 1 && roomRangeForm.start_number && roomRangeForm.end_number && roomRangeForm.start_number <= roomRangeForm.end_number)

// Continue only enabled when queue has items
const isContinueDisabled = computed(() => {
  if (currentStep.value === 1) return categoryQueue.value.length === 0
  if (currentStep.value === 2) return roomRangeQueue.value.length === 0
  return false
})

watch([isCategoriesLoading, isRoomsLoading], ([a, b]) => { if (!a && !b) isLoading.value = false })

// Helpers
const getCategoryNameById = (id: number | null) => allCategories.value.find((c: any) => c.id === id)?.name || 'Unknown'
const getRangeRoomCount = (range: RoomRange) => Math.max(0, range.end_number - range.start_number + 1)

const getButtonText = () => {
  if (currentStep.value === 1) {
    if (categoryQueue.value.length > 0) return `Create ${categoryQueue.value.length} ${categoryQueue.value.length === 1 ? 'Category' : 'Categories'}`
    return 'Continue'
  }
  if (currentStep.value === 2) {
    if (roomRangeQueue.value.length > 0) return `Create ${totalQueuedRooms.value} Rooms`
    return 'Continue'
  }
  return 'Continue'
}

// Category functions
const validateCategoryForm = () => {
  categoryErrors.value = {}
  if (!categoryForm.name || categoryForm.name.length < 2) { categoryErrors.value.name = 'Name required'; return false }
  if (!categoryForm.base_price || categoryForm.base_price <= 0) { categoryErrors.value.base_price = 'Enter price'; return false }
  if (!categoryForm.max_occupancy || categoryForm.max_occupancy < 1) { categoryErrors.value.max_occupancy = 'Min 1'; return false }
  return true
}

const addCategoryToQueue = () => {
  if (!validateCategoryForm()) return
  categoryQueue.value.push({ ...categoryForm })
  Object.assign(categoryForm, { name: '', description: '', base_price: 0, max_occupancy: 2 })
  categoryErrors.value = {}
}

const addCategoryAndDone = () => {
  if (!validateCategoryForm()) return
  categoryQueue.value.push({ ...categoryForm })
  Object.assign(categoryForm, { name: '', description: '', base_price: 0, max_occupancy: 2 })
  categoryErrors.value = {}
  showCategoryForm.value = false
}

const editCategory = (idx: number) => {
  const cat = categoryQueue.value[idx]
  Object.assign(categoryForm, { ...cat })
  editingCategoryIndex.value = idx
  categoryErrors.value = {}
  showCategoryForm.value = true
}

const updateCategoryInQueue = () => {
  if (!validateCategoryForm()) return
  if (editingCategoryIndex.value !== null) {
    categoryQueue.value[editingCategoryIndex.value] = { ...categoryForm }
    clearCategoryForm()
    showCategoryForm.value = false
  }
}

const clearCategoryForm = () => {
  Object.assign(categoryForm, { name: '', description: '', base_price: 0, max_occupancy: 2 })
  editingCategoryIndex.value = null
  categoryErrors.value = {}
}

const removeCategoryFromQueue = (idx: number) => {
  categoryQueue.value.splice(idx, 1)
  if (editingCategoryIndex.value === idx) clearCategoryForm()
  else if (editingCategoryIndex.value !== null && idx < editingCategoryIndex.value) editingCategoryIndex.value--
  // Show form if queue becomes empty
  if (categoryQueue.value.length === 0) showCategoryForm.value = true
}

// Room range functions
const validateRoomRangeForm = () => {
  roomRangeErrors.value = {}
  if (!roomRangeForm.category) { roomRangeErrors.value.category = 'Select category'; return false }
  if (!roomRangeForm.floor || roomRangeForm.floor < 1) { roomRangeErrors.value.floor = 'Enter floor'; return false }
  if (!roomRangeForm.start_number) { roomRangeErrors.value.start_number = 'Required'; return false }
  if (!roomRangeForm.end_number) { roomRangeErrors.value.end_number = 'Required'; return false }
  if (roomRangeForm.start_number > roomRangeForm.end_number) { roomRangeErrors.value.end_number = 'Must be >= start'; return false }
  return true
}

const addRoomRangeToQueue = () => {
  if (!validateRoomRangeForm()) return
  roomRangeQueue.value.push({ ...roomRangeForm })
  Object.assign(roomRangeForm, { category: null, floor: roomRangeForm.floor + 1, start_number: (roomRangeForm.floor + 1) * 100 + 1, end_number: (roomRangeForm.floor + 1) * 100 + 5 })
  roomRangeErrors.value = {}
}

const addRoomRangeAndDone = () => {
  if (!validateRoomRangeForm()) return
  roomRangeQueue.value.push({ ...roomRangeForm })
  Object.assign(roomRangeForm, { category: null, floor: 1, start_number: 101, end_number: 105 })
  roomRangeErrors.value = {}
  showRoomRangeForm.value = false
}

const editRoomRange = (idx: number) => {
  const range = roomRangeQueue.value[idx]
  Object.assign(roomRangeForm, { ...range })
  editingRoomRangeIndex.value = idx
  roomRangeErrors.value = {}
  showRoomRangeForm.value = true
}

const updateRoomRangeInQueue = () => {
  if (!validateRoomRangeForm()) return
  if (editingRoomRangeIndex.value !== null) {
    roomRangeQueue.value[editingRoomRangeIndex.value] = { ...roomRangeForm }
    clearRoomRangeForm()
    showRoomRangeForm.value = false
  }
}

const clearRoomRangeForm = () => {
  Object.assign(roomRangeForm, { category: null, floor: 1, start_number: 101, end_number: 105 })
  editingRoomRangeIndex.value = null
  roomRangeErrors.value = {}
}

const removeRoomRangeFromQueue = (idx: number) => {
  roomRangeQueue.value.splice(idx, 1)
  if (editingRoomRangeIndex.value === idx) clearRoomRangeForm()
  else if (editingRoomRangeIndex.value !== null && idx < editingRoomRangeIndex.value) editingRoomRangeIndex.value--
  // Show form if queue becomes empty
  if (roomRangeQueue.value.length === 0) showRoomRangeForm.value = true
}

// Navigation
const nextStep = () => { if (currentStep.value < steps.length - 1) currentStep.value++ }

const handleNext = () => {
  if (currentStep.value === 1) {
    // Only proceed if queue has items
    if (categoryQueue.value.length > 0) {
      confirmType.value = 'categories'
      showConfirmModal.value = true
      return
    }
    toast.add({ severity: 'warn', summary: 'Required', detail: 'Add at least one category', life: 3000 })
    return
  }
  if (currentStep.value === 2) {
    // Only proceed if queue has items
    if (roomRangeQueue.value.length > 0) {
      confirmType.value = 'rooms'
      showConfirmModal.value = true
      return
    }
    toast.add({ severity: 'warn', summary: 'Required', detail: 'Add at least one room range', life: 3000 })
    return
  }
  nextStep()
}

const confirmCreate = async () => {
  isCreating.value = true
  try {
    if (confirmType.value === 'categories') {
      // Send array for bulk create
      await (createCategories as any)(categoryQueue.value)
      toast.add({ severity: 'success', summary: 'Success', detail: `${categoryQueue.value.length} categories created!`, life: 3000 })
      categoryQueue.value = []
      await refetchCategories()
    } else {
      // Send array for bulk create
      const payload = roomRangeQueue.value.map(r => ({
        category: r.category!,
        floor: r.floor,
        start_number: r.start_number.toString(),
        end_number: r.end_number.toString()
      }))
      await (bulkCreateRooms as any)(payload)
      toast.add({ severity: 'success', summary: 'Success', detail: `${totalQueuedRooms.value} rooms created!`, life: 3000 })
      roomRangeQueue.value = []
      await refetchRooms()
    }
    showConfirmModal.value = false
    nextStep()
  } catch (error: any) {
    console.error('Create error:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create. Please try again.', life: 5000 })
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  currentStep.value = 0
  refetchCategories()
  refetchRooms()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.animate-modal-in { animation: modalIn 0.3s ease-out; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
