<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-users text-primary-500"></i> Staff Management
          </h1>
          <p class="text-gray-500">Manage hotel staff members and their roles</p>
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

      <!-- Main Content -->
      <div v-else class="space-y-6">

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Total Staff Card -->
          <Card class="shadow-sm border border-gray-200 bg-white">
            <template #content>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i class="pi pi-users text-3xl text-blue-600"></i>
                </div>
                <div>
                  <p class="text-gray-500 text-sm font-medium">Total Staff</p>
                  <h3 class="text-3xl font-bold text-gray-800">{{ totalStaffCount }}</h3>
                </div>
              </div>
            </template>
          </Card>

          <!-- Active Staff Card -->
          <Card class="shadow-sm border border-gray-200 bg-white">
            <template #content>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center">
                  <i class="pi pi-check-circle text-3xl text-green-600"></i>
                </div>
                <div>
                  <p class="text-gray-500 text-sm font-medium">Active Staff</p>
                  <h3 class="text-3xl font-bold text-gray-800">{{ activeStaffCount }}</h3>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Staff Members Section -->
        <Card class="shadow-sm border border-gray-200 bg-white">
          <template #title>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-800">Staff Members</h2>
              <div class="flex gap-3">
                <Dropdown
                  v-model="selectedDepartmentFilter"
                  :options="departmentFilterOptions"
                  placeholder="All Departments"
                  class="w-48"
                  optionLabel="label"
                  optionValue="value"
                />
                <Dropdown
                  v-model="selectedRoleFilter"
                  :options="roleFilterOptions"
                  placeholder="All Roles"
                  class="w-48"
                  optionLabel="label"
                  optionValue="value"
                />
              </div>
            </div>
          </template>
          <template #content>
            <DataTable
              :value="filteredStaffMembers"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              stripedRows
              class="p-datatable-sm"
              responsiveLayout="scroll"
            >
              <template #empty>
                <div class="text-center py-8">
                  <i class="pi pi-users text-5xl text-gray-300 mb-4"></i>
                  <h3 class="text-xl font-semibold text-gray-700 mb-2">No Staff Members Found</h3>
                  <p class="text-gray-500 mb-4">Get started by adding your first staff member.</p>
                  <Button label="Add Staff Member" icon="pi pi-plus" @click="openAddStaffForm" />
                </div>
              </template>

              <Column field="username" header="Staff Member" sortable>
                <template #body="slotProps">
                  <div>
                    <div class="font-semibold text-gray-800">{{ slotProps.data.username }}</div>
                    <div class="text-sm text-gray-500">ID: {{ slotProps.data.id }}</div>
                  </div>
                </template>
              </Column>

              <Column field="user_type" header="Role & Department" sortable>
                <template #body="slotProps">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-id-card" :style="{ color: getStaffRoleColor(slotProps.data.user_type) }"></i>
                      <span class="font-medium capitalize">{{ slotProps.data.user_type.replace('_', ' ') }}</span>
                    </div>
                    <div v-if="slotProps.data.department && slotProps.data.department.length" class="flex flex-wrap gap-1">
                      <Tag v-for="dep in slotProps.data.department" :key="dep" :value="dep" class="text-xs" severity="info"></Tag>
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="email" header="Contact" sortable>
                <template #body="slotProps">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 text-sm">
                      <i class="pi pi-envelope text-gray-400"></i>
                      <span>{{ slotProps.data.email }}</span>
                    </div>
                    <div v-if="slotProps.data.phone_number" class="flex items-center gap-2 text-sm text-gray-600">
                      <i class="pi pi-phone text-gray-400"></i>
                      <span>{{ slotProps.data.phone_number }}</span>
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="is_active_hotel_user" header="Status" sortable>
                <template #body="slotProps">
                  <Badge
                    :value="slotProps.data.is_active_hotel_user ? 'active' : 'inactive'"
                    :severity="slotProps.data.is_active_hotel_user ? 'success' : 'danger'"
                  />
                </template>
              </Column>

              <Column header="Actions" :exportable="false">
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-sm p-button-text p-button-info"
                      @click="openEditStaffForm(slotProps.data)"
                      v-tooltip.top="'Edit'"
                    />
                    <Button
                      icon="pi pi-trash"
                      class="p-button-sm p-button-text p-button-danger"
                      @click="openDeleteConfirmation(slotProps.data)"
                      v-tooltip.top="'Delete'"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
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
          <label for="password">{{ editingStaff ? 'Password (leave blank to keep current)' : 'Password' }}</label>
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

      <div v-if="staffForm.user_type === 'department_staff'">
        <FloatLabel>
          <MultiSelect
            id="department"
            v-model="staffForm.department"
            :options="departmentChoices"
            class="w-full"
            display="chip"
          />
          <label for="department">Departments</label>
        </FloatLabel>
      </div>

      <div>
        <FloatLabel>
          <InputText
            id="phone_number"
            v-model="staffForm.phone_number"
            class="w-full"
            :class="{'p-invalid': staffErrors.phone_number}"
          />
          <label for="phone_number">Phone Number (optional)</label>
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
        <label for="is_active_hotel_user" class="cursor-pointer">Staff Member is Active</label>
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
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
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

const departmentChoices = [
  'Housekeeping', 'Room Service', 'Café/Restaurant'
];

// User types based on requirements
const userTypes = [
  { label: 'Hotel Admin', value: 'hotel_admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Department Staff', value: 'department_staff' },
  { label: 'Other Staff', value: 'other_staff' }
];

// Colors for user types
const userTypeColors: Record<string, string> = {
  hotel_admin: '#F59E0B',
  manager: '#3B82F6',
  receptionist: '#10B981',
  department_staff: '#8B5CF6',
  other_staff: '#64748b'
};

// Filters
const selectedDepartmentFilter = ref<string>('all');
const selectedRoleFilter = ref<string>('all');

const departmentFilterOptions = computed(() => {
  const options = [{ label: 'All Departments', value: 'all' }];
  departmentChoices.forEach(dep => {
    options.push({ label: dep, value: dep });
  });
  return options;
});

const roleFilterOptions = computed(() => {
  const options = [{ label: 'All Roles', value: 'all' }];
  userTypes.forEach(type => {
    options.push({ label: type.label, value: type.value });
  });
  return options;
});

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
  is_active_hotel_user: true,
  department: [] as string[]
});

const staffErrors = ref<Record<string, string>>({});

// Computed properties
const totalStaffCount = computed(() => staffMembers.value?.length || 0);

const activeStaffCount = computed(() =>
  staffMembers.value?.filter((staff: any) => staff.is_active_hotel_user).length || 0
);

const filteredStaffMembers = computed(() => {
  if (!staffMembers.value) return [];

  let filtered = [...staffMembers.value];

  // Filter by department
  if (selectedDepartmentFilter.value !== 'all') {
    filtered = filtered.filter((staff: any) =>
      staff.department?.includes(selectedDepartmentFilter.value)
    );
  }

  // Filter by role
  if (selectedRoleFilter.value !== 'all') {
    filtered = filtered.filter((staff: any) =>
      staff.user_type === selectedRoleFilter.value
    );
  }

  return filtered;
});

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
  staffForm.department = [];
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
  staffForm.department = staff.department || [];
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
      const updateData: any = {
        username: staffForm.username,
        email: staffForm.email,
        user_type: staffForm.user_type,
        phone_number: staffForm.phone_number,
        is_active_hotel_user: staffForm.is_active_hotel_user,
      };

      // Only include password if it was changed
      if (staffForm.password) {
        updateData.password = staffForm.password;
      }

      if (staffForm.user_type === 'department_staff') {
        updateData.department = staffForm.department;
      }

      await partialUpdateStaff({
        id: editingStaff.value.id,
        data: updateData
      });

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff member updated successfully',
        life: 3000
      });
    } else {
      // Add new staff member
      const createData: any = {
        username: staffForm.username,
        email: staffForm.email,
        password: staffForm.password,
        user_type: staffForm.user_type,
        phone_number: staffForm.phone_number,
      };
      if (staffForm.user_type === 'department_staff') {
        createData.department = staffForm.department;
      }
      await createStaff(createData);

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
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: all 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f9fafb;
}
</style>
