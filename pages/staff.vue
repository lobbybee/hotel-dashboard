<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-users text-primary-500"></i> Staff Management
          </h1>
          <p class="text-gray-500">Manage your hotel's staff members and their roles.</p>
        </div>
        <Button label="Add Staff Member" icon="pi pi-plus" @click="openAddStaffForm" :loading="createAsyncStatus === 'pending'" />
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
        <p class="font-bold">Error loading staff members</p>
        <p>{{ error?.message || 'An unexpected error occurred' }}</p>
        <Button label="Retry" icon="pi pi-refresh" @click="refetch" class="mt-3" />
      </div>

      <!-- Staff List -->
      <div v-else class="space-y-6">
        <transition-group name="fade-up" tag="div" class="space-y-6">
          <Card 
            v-for="staff in staffMembers || []" 
            :key="staff.id"
            class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <template #title>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <i class="pi pi-user" :style="{ color: getStaffRoleColor(staff.user_type) }"></i>
                  {{ staff.username }}
                </h3>
                <Badge :value="staff.is_active_hotel_user ? 'Active' : 'Inactive'" :severity="staff.is_active_hotel_user ? 'success' : 'danger'" class="px-3 py-1 text-sm" />
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-gray-600">
                  <i class="pi pi-envelope"></i>
                  <span>{{ staff.email }}</span>
                </div>
                
                <div v-if="staff.phone_number" class="flex items-center gap-2 text-gray-600">
                  <i class="pi pi-phone"></i>
                  <span>{{ staff.phone_number }}</span>
                </div>
                
                <div class="flex items-center gap-2 text-gray-600">
                  <i class="pi pi-id-card"></i>
                  <span class="capitalize">{{ staff.user_type }}</span>
                </div>
                
                <div class="flex flex-wrap gap-2 mt-4">
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-sm p-button-outlined" 
                    @click="openEditStaffForm(staff)"
                    label="Edit"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-sm p-button-danger p-button-outlined" 
                    @click="openDeleteConfirmation(staff)"
                    label="Delete"
                  />
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !error && (!staffMembers || staffMembers.length === 0)" class="text-center py-12">
        <i class="pi pi-users text-5xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Staff Members Found</h3>
        <p class="text-gray-500 mb-4">Get started by adding your first staff member.</p>
        <Button label="Add Staff Member" icon="pi pi-plus" @click="openAddStaffForm" />
      </div>

    </div>
  </div>

  <!-- Add/Edit Staff Dialog -->
  <Dialog 
    v-model:visible="staffDialogVisible" 
    :header="editingStaff ? 'Edit Staff Member' : 'Add Staff Member'"
    :modal="true"
    :style="{ width: '500px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="space-y-6">
      <div>
        <FloatLabel>
          <InputText 
            id="username" 
            v-model="staffForm.username" 
            class="w-full" 
            :class="{'p-invalid': staffErrors.username}" 
          />
          <label for="username">Username</label>
        </FloatLabel>
        <small v-if="staffErrors.username" class="p-error">{{ staffErrors.username }}</small>
      </div>
      
      <div>
        <FloatLabel>
          <InputText 
            id="email" 
            v-model="staffForm.email" 
            class="w-full" 
            :class="{'p-invalid': staffErrors.email}" 
          />
          <label for="email">Email</label>
        </FloatLabel>
        <small v-if="staffErrors.email" class="p-error">{{ staffErrors.email }}</small>
      </div>
      
      <div>
        <FloatLabel>
          <Password 
            id="password" 
            v-model="staffForm.password" 
            class="w-full"
            :class="{'p-invalid': staffErrors.password}" 
            toggleMask
            :feedback="false"
          />
          <label for="password">Password</label>
        </FloatLabel>
        <small v-if="staffErrors.password" class="p-error">{{ staffErrors.password }}</small>
      </div>
      
      <div>
        <FloatLabel>
          <Dropdown 
            id="user_type" 
            v-model="staffForm.user_type" 
            :options="userTypes" 
            optionLabel="label" 
            optionValue="value"
            class="w-full"
            :class="{'p-invalid': staffErrors.user_type}" 
          />
          <label for="user_type">Role</label>
        </FloatLabel>
        <small v-if="staffErrors.user_type" class="p-error">{{ staffErrors.user_type }}</small>
      </div>
      
      <div>
        <FloatLabel>
          <InputText 
            id="phone_number" 
            v-model="staffForm.phone_number" 
            class="w-full" 
            :class="{'p-invalid': staffErrors.phone_number}" 
          />
          <label for="phone_number">Phone Number</label>
        </FloatLabel>
        <small v-if="staffErrors.phone_number" class="p-error">{{ staffErrors.phone_number }}</small>
      </div>
      
      <div class="flex items-center">
        <Checkbox 
          id="is_active_hotel_user" 
          v-model="staffForm.is_active_hotel_user" 
          :binary="true" 
          class="mr-2"
        />
        <label for="is_active_hotel_user">Staff Member is Active</label>
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeStaffForm" />
      <Button 
        :label="editingStaff ? 'Update' : 'Create'" 
        icon="pi pi-check" 
        @click="saveStaff" 
      />
    </template>
  </Dialog>

  <!-- Delete Confirmation Dialog -->
  <Dialog 
    v-model:visible="deleteDialogVisible" 
    header="Confirm Delete"
    :modal="true"
    :style="{ width: '450px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
      <span>
        Are you sure you want to delete <b>{{ selectedStaff?.username }}</b>? This action cannot be undone.
      </span>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDeleteConfirmation" />
      <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteStaff" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import FloatLabel from 'primevue/floatlabel';
import Badge from 'primevue/badge';
import Password from 'primevue/password';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

// Import composables
import { 
  useFetchStaff, 
  useCreateStaff, 
  useUpdateStaff,
  usePartialUpdateStaff,
  useDeleteStaff 
} from '~/composables/useStaff';

// Initialize composables
const { staff: staffMembers, isLoading, error, refetch } = useFetchStaff();
const { createStaff, asyncStatus: createAsyncStatus } = useCreateStaff();
const { updateStaff, asyncStatus: updateAsyncStatus } = useUpdateStaff();
const { partialUpdateStaff } = usePartialUpdateStaff();
const { deleteStaff: deleteStaffAPI, asyncStatus: deleteAsyncStatus } = useDeleteStaff();

// Toast for notifications
const toast = useToast();

// User types based on requirements
const userTypes = [
  { label: 'Hotel Admin', value: 'hotel_admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Department Staff', value: 'department_staff' }
];

// Colors for user types
const userTypeColors: Record<string, string> = {
  hotel_admin: '#F59E0B',
  manager: '#3B82F6',
  receptionist: '#10B981',
  department_staff: '#8B5CF6'
};

// Form handling
const staffDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const editingStaff = ref<any>(null);
const selectedStaff = ref<any>(null);

const staffForm = reactive({
  username: '',
  email: '',
  password: '',
  user_type: '',
  phone_number: '',
  is_active_hotel_user: true
});

const staffErrors = ref<Record<string, string>>({});

// Helper functions
const getStaffRoleColor = (type: string) => {
  return userTypeColors[type] || '#6B7280';
};

// Form actions
const openAddStaffForm = () => {
  editingStaff.value = null;
  staffForm.username = '';
  staffForm.email = '';
  staffForm.password = '';
  staffForm.user_type = '';
  staffForm.phone_number = '';
  staffForm.is_active_hotel_user = true;
  staffErrors.value = {};
  staffDialogVisible.value = true;
};

const openEditStaffForm = (staff: any) => {
  editingStaff.value = staff;
  staffForm.username = staff.username;
  staffForm.email = staff.email;
  staffForm.password = ''; // Don't prefill password for security
  staffForm.user_type = staff.user_type;
  staffForm.phone_number = staff.phone_number || '';
  staffForm.is_active_hotel_user = staff.is_active_hotel_user;
  staffErrors.value = {};
  staffDialogVisible.value = true;
};

const closeStaffForm = () => {
  staffDialogVisible.value = false;
};

const saveStaff = async () => {
  // Form validation
  staffErrors.value = {};
  
  // Basic validation
  if (!staffForm.username.trim()) {
    staffErrors.value.username = 'Username is required';
  }
  
  if (!staffForm.email.trim()) {
    staffErrors.value.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(staffForm.email)) {
    staffErrors.value.email = 'Invalid email format';
  }
  
  if (!editingStaff.value && !staffForm.password) {
    // Only require password for new staff members
    staffErrors.value.password = 'Password is required';
  } else if (staffForm.password && staffForm.password.length < 6) {
    staffErrors.value.password = 'Password must be at least 6 characters';
  }
  
  if (!staffForm.user_type) {
    staffErrors.value.user_type = 'Role is required';
  }
  
  // If there are errors, don't proceed
  if (Object.keys(staffErrors.value).length > 0) {
    return;
  }
  
  try {
    if (editingStaff.value) {
      // Update existing staff member
      await partialUpdateStaff({ 
        id: editingStaff.value.id, 
        data: {
          username: staffForm.username,
          email: staffForm.email,
          user_type: staffForm.user_type,
          phone_number: staffForm.phone_number,
          is_active_hotel_user: staffForm.is_active_hotel_user
        }
      });
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff member updated successfully',
        life: 3000
      });
    } else {
      // Add new staff member
      await createStaff({
        username: staffForm.username,
        email: staffForm.email,
        password: staffForm.password,
        user_type: staffForm.user_type,
        phone_number: staffForm.phone_number
      });
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff member created successfully',
        life: 3000
      });
    }
    
    // Refresh the staff list
    await refetch();
    
    // Close the form
    closeStaffForm();
  } catch (err) {
    console.error('Error saving staff:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save staff member',
      life: 5000
    });
  }
};

// Delete actions
const openDeleteConfirmation = (staff: any) => {
  selectedStaff.value = staff;
  deleteDialogVisible.value = true;
};

const closeDeleteConfirmation = () => {
  deleteDialogVisible.value = false;
  selectedStaff.value = null;
};

const deleteStaff = async () => {
  if (selectedStaff.value) {
    try {
      await deleteStaffAPI(selectedStaff.value.id);
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff member deleted successfully',
        life: 3000
      });
      
      // Refresh the staff list
      await refetch();
      
      closeDeleteConfirmation();
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete staff member',
        life: 5000
      });
    }
  }
};

// Handle loading and error states
onMounted(() => {
  if (error.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load staff members',
      life: 5000
    });
  }
});
</script>

<style scoped>
/* Fade up transition */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Header animation */
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.p-error {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>