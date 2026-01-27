<template>
  <OnboardingOnboardLayout
    title="Staff Setup"
    icon="pi-users"
    color-scheme="amber"
    :steps="steps"
    :current-step="currentStep"
    :is-loading="isLoading"
    loading-title="Setting Up Your Team"
    loading-subtitle="Please wait while we prepare your staff management..."
    :is-saving="isCreating"
    :show-navigation="currentStep !== 0 && currentStep !== steps.length - 1"
    :continue-button-text="getButtonText()"
    :continue-disabled="isContinueDisabled"
    :api-error="staffError"
    @next="handleNext"
    @retry="refetch"
  >
    <!-- Slide 0: Welcome -->
    <template #slide-0>
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-users text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ ((staffMembers as any)?.results?.length || (Array.isArray(staffMembers) ? staffMembers.length : 0)) > 0 ? 'Staff Management' : 'Welcome to Staff Setup' }}
        </h2>
        <p class="text-gray-600 leading-relaxed">
          {{ ((staffMembers as any)?.results?.length || (Array.isArray(staffMembers) ? staffMembers.length : 0)) > 0
            ? `You have ${(staffMembers as any)?.count || (staffMembers as any)?.results?.length || (Array.isArray(staffMembers) ? staffMembers.length : 0)} staff members in your team.`
            : "Let's set up your hotel staff team with roles and permissions."
          }}
        </p>
      </div>

      <div v-if="!((staffMembers as any)?.results?.length || (Array.isArray(staffMembers) ? staffMembers.length : 0))" class="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8">
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-info-circle text-amber-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-amber-900 mb-2">What we'll setup:</h3>
            <ul class="space-y-2 text-sm text-amber-800">
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Multiple staff accounts</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Role assignments</li>
              <li class="flex items-center"><i class="pi pi-check-circle mr-2 text-amber-600"></i> Department setup</li>
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
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-green-700">Total Staff:</span>
                <span class="font-semibold text-green-800">{{ (staffMembers as any)?.count || (staffMembers as any)?.results?.length || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-green-700">Active:</span>
                <span class="font-semibold text-green-800">{{ activeStaffCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button @click="nextStep" class="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
          {{ !((staffMembers as any)?.results?.length || (Array.isArray(staffMembers) ? staffMembers.length : 0)) ? 'Get Started' : 'Add More Staff' }}
          <i class="pi pi-arrow-right ml-2"></i>
        </button>
      </div>
    </template>

    <!-- Slide 1: Staff Management (Multiple) -->
    <template #slide-1>
      <div class="mb-4 text-center">
        <div class="w-14 h-14 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <i class="pi pi-user-plus text-white text-xl"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-1">Add Staff Members</h2>
        <p class="text-gray-600 text-sm">Add one or more staff, then continue</p>
      </div>

      <!-- Queued Staff (to be created) -->
      <div v-if="staffQueue.length > 0" class="mb-4">
        <h3 class="font-semibold text-gray-900 mb-2 text-sm flex items-center">
          <i class="pi pi-list mr-2 text-amber-600"></i>
          Staff to Create ({{ staffQueue.length }})
        </h3>
        <div class="space-y-2 max-h-28 overflow-y-auto">
          <div v-for="(staff, idx) in staffQueue" :key="idx"
            @click="editStaff(idx)"
            class="bg-amber-50 border rounded-lg p-2 text-sm flex justify-between items-center cursor-pointer hover:bg-amber-100 transition-colors"
            :class="editingStaffIndex === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-200'"
          >
            <div class="flex items-center space-x-2">
              <i v-if="editingStaffIndex === idx" class="pi pi-pencil text-amber-600 text-xs"></i>
              <div class="w-7 h-7 rounded-full flex items-center justify-center" :style="{ backgroundColor: getRoleColor(staff.user_type) }">
                <i class="pi pi-user text-white text-xs"></i>
              </div>
              <div>
                <span class="font-medium text-gray-900">{{ staff.username }}</span>
                <span class="text-amber-600 ml-2 text-xs">{{ formatRole(staff.user_type) }}</span>
              </div>
            </div>
            <button @click.stop="removeStaffFromQueue(idx)" class="text-red-500 hover:text-red-700 p-1">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
        </div>
        <!-- Add Another button when form is hidden -->
        <button v-if="!showStaffForm" @click="showStaffForm = true" class="w-full mt-3 py-2 border-2 border-dashed border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium">
          <i class="pi pi-plus mr-2"></i>Add Another Staff
        </button>
      </div>

      <!-- Add Staff Form -->
      <div v-if="showStaffForm" class="bg-gray-50 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-3 text-sm flex items-center">
          <i v-if="editingStaffIndex !== null" class="pi pi-pencil mr-2 text-amber-600"></i>
          {{ editingStaffIndex !== null ? 'Edit Staff' : (staffQueue.length > 0 ? 'Add Another Staff' : 'Staff Details') }}
        </h3>

        <div v-if="staffErrors.form" class="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <p class="text-red-700 text-xs flex items-center"><i class="pi pi-exclamation-triangle mr-1"></i>{{ staffErrors.form }}</p>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input v-model="staffForm.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm" placeholder="johndoe" :class="{ 'border-red-500': staffErrors.username }" />
              <span v-if="staffErrors.username" class="text-red-500 text-xs">{{ staffErrors.username }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input v-model="staffForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm" placeholder="john@example.com" :class="{ 'border-red-500': staffErrors.email }" />
              <span v-if="staffErrors.email" class="text-red-500 text-xs">{{ staffErrors.email }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input v-model="staffForm.phone_number" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm" placeholder="+91 98765 43210" :class="{ 'border-red-500': staffErrors.phone_number }" />
              <span v-if="staffErrors.phone_number" class="text-red-500 text-xs">{{ staffErrors.phone_number }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input v-model="staffForm.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm" placeholder="••••••••" :class="{ 'border-red-500': staffErrors.password }" />
              <span v-if="staffErrors.password" class="text-red-500 text-xs">{{ staffErrors.password }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select v-model="staffForm.user_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm" :class="{ 'border-red-500': staffErrors.user_type }">
              <option value="">Select role</option>
              <option v-for="type in userTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
            <span v-if="staffErrors.user_type" class="text-red-500 text-xs">{{ staffErrors.user_type }}</span>
          </div>

          <div v-if="staffForm.user_type === 'department_staff'" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Department *</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="dept in departmentChoices" :key="dept" class="flex items-center px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-amber-50 text-xs" :class="staffForm.department === dept ? 'border-amber-500 bg-amber-50' : 'border-gray-300'">
                <input v-model="staffForm.department" :value="dept" type="radio" class="sr-only" />
                <span>{{ dept }}</span>
              </label>
            </div>
          </div>

          <div class="flex gap-2">
            <button v-if="editingStaffIndex !== null" @click="updateStaffInQueue" class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
              <i class="pi pi-check mr-2"></i>Update
            </button>
            <template v-else>
              <button @click="addStaffToQueue" class="flex-1 py-2 border-2 border-dashed border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium">
                <i class="pi pi-plus mr-2"></i>Add Another
              </button>
              <button @click="addStaffAndDone" class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                <i class="pi pi-check mr-2"></i>Done
              </button>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- Slide 2: Complete -->
    <template #slide-2>
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-check text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Team Ready! 🎉</h2>
        <p class="text-gray-600 mb-6">Your staff setup is complete.</p>

        <div class="bg-green-50 border border-green-100 rounded-xl p-6 mb-8">
          <h3 class="font-semibold text-green-900 mb-4">What's next?</h3>
          <div class="space-y-3 text-left">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i class="pi pi-calendar text-green-600"></i></div>
              <span class="text-green-800">Start accepting bookings</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><i class="pi pi-chart-bar text-green-600"></i></div>
              <span class="text-green-800">Monitor your hotel performance</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <NuxtLink to="/">
          <button class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
            Go to Dashboard <i class="pi pi-arrow-right ml-2"></i>
          </button>
        </NuxtLink>
      </div>
    </template>
  </OnboardingOnboardLayout>

  <!-- Bulk Staff Confirmation Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showConfirmModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-modal-in">
          <div class="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 rounded-t-2xl">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="pi pi-users text-white text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Create Staff Members</h3>
                <p class="text-amber-100 text-sm">Review before creating</p>
              </div>
            </div>
          </div>
          
          <div class="p-6 max-h-60 overflow-y-auto space-y-2">
            <div v-for="(staff, idx) in staffQueue" :key="idx" class="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ backgroundColor: getRoleColor(staff.user_type) }">
                  <i class="pi pi-user text-white text-xs"></i>
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ staff.username }}</p>
                  <p class="text-xs text-gray-500">{{ staff.email }}</p>
                </div>
              </div>
              <span class="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">{{ formatRole(staff.user_type) }}</span>
            </div>
            <div class="mt-3 p-3 bg-amber-50 rounded-lg text-center">
              <p class="text-amber-800 font-semibold">{{ staffQueue.length }} staff members will be created</p>
            </div>
          </div>
          
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex space-x-3">
            <button @click="showConfirmModal = false" class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100">Edit</button>
            <button @click="confirmCreate" :disabled="isCreating" class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center">
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

const steps = [{ title: 'Welcome' }, { title: 'Staff' }, { title: 'Complete' }]

// API hooks
const { staff: staffMembers, isLoading: isStaffLoading, error: staffError, refetch } = useFetchStaff()
const { createStaff } = useCreateStaff()

// Staff form & queue
interface StaffItem {
  username: string
  email: string
  password: string
  user_type: string
  phone_number: string
  is_active_hotel_user: boolean
  department: string
}

const staffForm = reactive<StaffItem>({
  username: '', email: '', password: '', user_type: '',
  phone_number: '', is_active_hotel_user: true, department: ''
})
const staffQueue = ref<StaffItem[]>([])
const staffErrors = ref<Record<string, string>>({})
const editingStaffIndex = ref<number | null>(null)
const showStaffForm = ref(true)

const departmentChoices = ['Housekeeping', 'Room Service', 'Café/Restaurant']
const userTypes = [
  { label: 'Manager', value: 'manager' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Department Staff', value: 'department_staff' },
  { label: 'Other Staff', value: 'other_staff' }
]
const userTypeColors: Record<string, string> = {
  hotel_admin: '#F59E0B', manager: '#3B82F6', receptionist: '#10B981',
  department_staff: '#8B5CF6', other_staff: '#64748b'
}

// Computed
const activeStaffCount = computed(() => ((staffMembers.value as any)?.results || (Array.isArray(staffMembers.value) ? staffMembers.value : []))?.filter((s: any) => s.is_active_hotel_user).length || 0)
const hasStaffFormData = computed(() => staffForm.username && staffForm.username.length >= 2 && staffForm.email && staffForm.email.includes('@') && staffForm.password && staffForm.password.length >= 6 && staffForm.user_type && staffForm.phone_number && staffForm.phone_number.length >= 10)

// Continue only enabled when queue has items
const isContinueDisabled = computed(() => {
  if (currentStep.value === 1) return staffQueue.value.length === 0
  return false
})

watch(isStaffLoading, (loading) => { if (!loading) isLoading.value = false })

// Helpers
const getRoleColor = (type: string) => userTypeColors[type] || userTypeColors.other_staff
const formatRole = (type: string) => userTypes.find(t => t.value === type)?.label || type

const getButtonText = () => {
  if (currentStep.value === 1) {
    if (staffQueue.value.length > 0) return `Create ${staffQueue.value.length} Staff`
  }
  return 'Continue'
}

// Validation
const validateStaffForm = () => {
  staffErrors.value = {}
  if (!staffForm.username || staffForm.username.length < 2) { staffErrors.value.username = 'Required'; return false }
  if (!/^[a-zA-Z0-9@.+\-_]+$/.test(staffForm.username)) { staffErrors.value.username = 'Invalid characters'; return false }
  if (!staffForm.email || !staffForm.email.includes('@')) { staffErrors.value.email = 'Invalid email'; return false }
  if (!staffForm.password || staffForm.password.length < 6) { staffErrors.value.password = 'Min 6 chars'; return false }
  if (!staffForm.user_type) { staffErrors.value.user_type = 'Required'; return false }
  if (!staffForm.phone_number || staffForm.phone_number.length < 10) { staffErrors.value.phone_number = 'Invalid phone'; return false }
  if (staffForm.user_type === 'department_staff' && !staffForm.department) { staffErrors.value.form = 'Select department'; return false }
  // Check for duplicate username in queue
  if (staffQueue.value.some(s => s.username === staffForm.username)) { staffErrors.value.username = 'Already in list'; return false }
  return true
}

const addStaffToQueue = () => {
  if (!validateStaffForm()) return
  staffQueue.value.push({ ...staffForm })
  Object.assign(staffForm, { username: '', email: '', password: '', user_type: '', phone_number: '', is_active_hotel_user: true, department: '' })
  staffErrors.value = {}
}

const addStaffAndDone = () => {
  if (!validateStaffForm()) return
  staffQueue.value.push({ ...staffForm })
  Object.assign(staffForm, { username: '', email: '', password: '', user_type: '', phone_number: '', is_active_hotel_user: true, department: '' })
  staffErrors.value = {}
  showStaffForm.value = false
}

const editStaff = (idx: number) => {
  const staff = staffQueue.value[idx]
  Object.assign(staffForm, { ...staff })
  editingStaffIndex.value = idx
  staffErrors.value = {}
  showStaffForm.value = true
}

const updateStaffInQueue = () => {
  if (!validateStaffForm()) return
  if (editingStaffIndex.value !== null) {
    staffQueue.value[editingStaffIndex.value] = { ...staffForm }
    clearStaffForm()
    showStaffForm.value = false
  }
}

const clearStaffForm = () => {
  Object.assign(staffForm, { username: '', email: '', password: '', user_type: '', phone_number: '', is_active_hotel_user: true, department: '' })
  editingStaffIndex.value = null
  staffErrors.value = {}
}

const removeStaffFromQueue = (idx: number) => {
  staffQueue.value.splice(idx, 1)
  if (editingStaffIndex.value === idx) clearStaffForm()
  else if (editingStaffIndex.value !== null && idx < editingStaffIndex.value) editingStaffIndex.value--
  // Show form if queue becomes empty
  if (staffQueue.value.length === 0) showStaffForm.value = true
}

// Navigation
const nextStep = () => { if (currentStep.value < steps.length - 1) currentStep.value++ }

const handleNext = () => {
  if (currentStep.value === 1) {
    // Only proceed if queue has items
    if (staffQueue.value.length > 0) {
      showConfirmModal.value = true
      return
    }
    toast.add({ severity: 'warn', summary: 'Required', detail: 'Add at least one staff member', life: 3000 })
    return
  }
  nextStep()
}

const confirmCreate = async () => {
  isCreating.value = true
  try {
    // Map to API format
    const payload = staffQueue.value.map(s => ({
      username: s.username,
      email: s.email,
      password: s.password,
      user_type: s.user_type,
      phone_number: s.phone_number,
      is_active_hotel_user: s.is_active_hotel_user,
      department: s.user_type === 'department_staff' ? s.department : ''
    }))
    
    // Create staff members in parallel
    await Promise.all(payload.map(staff => createStaff(staff as any)))
    toast.add({ severity: 'success', summary: 'Success', detail: `${staffQueue.value.length} staff members created!`, life: 3000 })
    staffQueue.value = []
    showConfirmModal.value = false
    await refetch()
    nextStep()
  } catch (error: any) {
    console.error('Create error:', error)
    let msg = 'Failed to create staff'
    if (error?.data) {
      const errors = Object.entries(error.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ')
      if (errors) msg = errors
    }
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  currentStep.value = 0
  staffErrors.value = {}
  refetch()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.animate-modal-in { animation: modalIn 0.3s ease-out; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
