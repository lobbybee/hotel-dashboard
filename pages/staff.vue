<template>
  <div class="max-w-7xl mx-auto p-4">
    <!-- Header -->
    <div class="mb-8 fade-in">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p class="text-gray-600">Manage hotel staff members and their roles</p>
        </div>
        <Button
          label="Add Staff Member"
          icon="pi pi-plus"
          :loading="createAsyncStatus === 'pending'"
          @click="openAddStaffForm"
        />
      </div>
    </div>

      <!-- Search and Filter Bar -->
    <div class="mb-6 bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search staff by name or email..."
              class="w-full"
            />
          </span>
        </div>
        <Dropdown
          v-model="selectedDepartmentFilter"
          :options="departmentFilterOptions"
          placeholder="All Departments"
          optionLabel="label"
          optionValue="value"
          class="w-full sm:w-56"
        />
        <Dropdown
          v-model="selectedRoleFilter"
          :options="roleFilterOptions"
          placeholder="All Roles"
          optionLabel="label"
          optionValue="value"
          class="w-full sm:w-48"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
      <p class="text-gray-500 mt-4">Loading staff members...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading staff members</h3>
      <p class="text-gray-500 mb-4">{{ error?.message || 'An unexpected error occurred' }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="refetch" />
    </div>

        <!-- Table Content -->
    <div v-else>
      <div v-if="filteredStaffMembers.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
        <i class="pi pi-users text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg mb-2">No staff members found</p>
        <p class="text-gray-400 text-sm">Add staff members to manage your hotel team</p>
        <Button label="Add Staff Member" icon="pi pi-plus" class="mt-4" @click="openAddStaffForm" />
      </div>

      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="member in filteredStaffMembers" :key="member.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                      :class="getRoleBgClass(member.user_type)">
                      <i class="pi pi-user text-white"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ member.username }}</div>
                      <div class="text-sm text-gray-500">{{ member.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Tag
                    :value="formatRole(member.user_type)"
                    :severity="getRoleSeverity(member.user_type)"
                  />
                  <div v-if="member.department && member.department.length" class="mt-1">
                    <Tag
                      v-for="dep in member.department"
                      :key="dep"
                      :value="dep"
                      severity="secondary"
                      class="mr-1"
                      style="font-size: 0.75rem;"
                    />
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ member.phone_number || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Tag
                    :value="member.is_active_hotel_user ? 'Active' : 'Inactive'"
                    :severity="member.is_active_hotel_user ? 'success' : 'secondary'"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      @click="openEditStaffForm(member)"
                    />
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      @click="openDeleteConfirmation(member)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  <!-- Add/Edit Staff Dialog -->
  <Dialog v-model:visible="staffDialogVisible" modal :header="editingStaff ? 'Edit Staff Member' : 'Add Staff Member'" :style="{ width: '35rem' }">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
        <InputText v-model="staffForm.username" class="w-full" :class="{'p-invalid': staffErrors.username}" />
        <small v-if="staffErrors.username" class="p-error">{{ staffErrors.username }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <InputText v-model="staffForm.email" type="email" class="w-full" :class="{'p-invalid': staffErrors.email}" />
        <small v-if="staffErrors.email" class="p-error">{{ staffErrors.email }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ editingStaff ? 'Password (leave blank to keep current)' : 'Password *' }}</label>
        <Password v-model="staffForm.password" class="w-full" :class="{'p-invalid': staffErrors.password}" toggleMask :feedback="false" />
        <small v-if="staffErrors.password" class="p-error">{{ staffErrors.password }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <InputText v-model="staffForm.phone_number" class="w-full" :class="{'p-invalid': staffErrors.phone_number}" />
        <small v-if="staffErrors.phone_number" class="p-error">{{ staffErrors.phone_number }}</small>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
        <Dropdown
          v-model="staffForm.user_type"
          :options="userTypes.filter(r => r.value)"
          optionLabel="label"
          optionValue="value"
          placeholder="Select role"
          class="w-full"
          :class="{'p-invalid': staffErrors.user_type}"
        />
        <small v-if="staffErrors.user_type" class="p-error">{{ staffErrors.user_type }}</small>
      </div>
      <div v-if="staffForm.user_type === 'department_staff'">
        <label class="block text-sm font-medium text-gray-700 mb-2">Departments</label>
        <MultiSelect
          v-model="staffForm.department"
          :options="departmentChoices"
          placeholder="Select departments"
          class="w-full"
          display="chip"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div class="flex items-center gap-2">
          <InputSwitch v-model="staffForm.is_active_hotel_user" />
          <span class="text-sm text-gray-700">
            {{ staffForm.is_active_hotel_user ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" text @click="closeStaffForm" />
      <Button :label="editingStaff ? 'Update' : 'Add'" @click="saveStaff" />
    </template>
  </Dialog>

  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="deleteDialogVisible"
    header="Confirm Delete"
    :modal="true"
    :style="{ width: '460px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="delete-body">
      <i class="pi pi-exclamation-triangle delete-icon"></i>
      <span>
        Are you sure you want to delete <b>{{ selectedStaff?.username }}</b>? This action cannot be undone.
      </span>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text :rounded="true" @click="closeDeleteConfirmation" />
      <Button label="Delete" icon="pi pi-trash" severity="danger" :rounded="true" @click="deleteStaff" />
    </template>
  </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Password from 'primevue/password';
import ProgressSpinner from 'primevue/progressspinner';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import InputSwitch from 'primevue/inputswitch';
import { useToast } from 'primevue/usetoast';

import {
  useFetchStaff,
  useCreateStaff,
  useUpdateStaff,
  usePartialUpdateStaff,
  useDeleteStaff
} from '~/composables/useStaff';

const { staff: staffMembers, isLoading, error, refetch } = useFetchStaff();
const { createStaff, asyncStatus: createAsyncStatus } = useCreateStaff();
const { updateStaff, asyncStatus: updateAsyncStatus } = useUpdateStaff();
const { partialUpdateStaff } = usePartialUpdateStaff();
const { deleteStaff: deleteStaffAPI, asyncStatus: deleteAsyncStatus } = useDeleteStaff();

const toast = useToast();

const departmentChoices = [
  'Housekeeping', 'Room Service', 'Café/Restaurant'
];

const userTypes = [
  { label: 'Hotel Admin', value: 'hotel_admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Department Staff', value: 'department_staff' },
  { label: 'Other Staff', value: 'other_staff' }
];

const userTypeColors: Record<string, string> = {
  hotel_admin: '#F59E0B',
  manager: '#3B82F6',
  receptionist: '#10B981',
  department_staff: '#8B5CF6',
  other_staff: '#64748b'
};

const selectedDepartmentFilter = ref<string>('all');
const selectedRoleFilter = ref<string>('all');

const departmentFilterOptions = computed(() => {
  const options = [{ label: 'All Departments', value: 'all' }];
  departmentChoices.forEach(dep => options.push({ label: dep, value: dep }));
  return options;
});

const roleFilterOptions = computed(() => {
  const options = [{ label: 'All Roles', value: 'all' }];
  userTypes.forEach(type => options.push({ label: type.label, value: type.value }));
  return options;
});

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

const totalStaffCount = computed(() => staffMembers.value?.length || 0);
const activeStaffCount = computed(() =>
  staffMembers.value?.filter((staff: any) => staff.is_active_hotel_user).length || 0
);

const filteredStaffMembers = computed(() => {
  if (!staffMembers.value) return [];
  let filtered = [...staffMembers.value];

  if (selectedDepartmentFilter.value !== 'all') {
    filtered = filtered.filter((staff: any) =>
      staff.department?.includes(selectedDepartmentFilter.value)
    );
  }
  if (selectedRoleFilter.value !== 'all') {
    filtered = filtered.filter((staff: any) =>
      staff.user_type === selectedRoleFilter.value
    );
  }
  return filtered;
});

const getStaffRoleColor = (type: string) => {
  return userTypeColors[type] || 'var(--primary-color)';
};

const formatRole = (role: string) => {
  return role.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
};

const getRoleSeverity = (role: string) => {
  const severities = {
    hotel_admin: 'danger',
    manager: 'warning',
    receptionist: 'info',
    department_staff: 'success',
    other_staff: 'secondary'
  }
  return severities[role as keyof typeof severities] || 'secondary';
};

const getRoleBgClass = (role: string) => {
  const classes = {
    hotel_admin: 'bg-red-600',
    manager: 'bg-amber-600',
    receptionist: 'bg-blue-600',
    department_staff: 'bg-green-600',
    other_staff: 'bg-gray-600'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-600';
};

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
  staffForm.password = '';
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
  staffErrors.value = {};

  if (!staffForm.username.trim()) {
    staffErrors.value.username = 'Username is required';
  }
  if (!staffForm.email.trim()) {
    staffErrors.value.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(staffForm.email)) {
    staffErrors.value.email = 'Invalid email format';
  }
  if (!editingStaff.value && !staffForm.password) {
    staffErrors.value.password = 'Password is required';
  } else if (staffForm.password && staffForm.password.length < 6) {
    staffErrors.value.password = 'Password must be at least 6 characters';
  }
  if (!staffForm.user_type) {
    staffErrors.value.user_type = 'Role is required';
  }

  if (Object.keys(staffErrors.value).length > 0) {
    return;
  }

  try {
    if (editingStaff.value) {
      const updateData: any = {
        username: staffForm.username,
        email: staffForm.email,
        user_type: staffForm.user_type,
        phone_number: staffForm.phone_number,
        is_active_hotel_user: staffForm.is_active_hotel_user,
      };
      if (staffForm.password) {
        updateData.password = staffForm.password;
      }
      if (staffForm.user_type === 'department_staff') {
        updateData.department = staffForm.department;
      }
      await partialUpdateStaff({ id: editingStaff.value.id, data: updateData });

      toast.add({ severity: 'success', summary: 'Success', detail: 'Staff member updated successfully', life: 3000 });
    } else {
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

      toast.add({ severity: 'success', summary: 'Success', detail: 'Staff member created successfully', life: 3000 });
    }

    await refetch();
    closeStaffForm();
  } catch (err) {
    console.error('Error saving staff:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save staff member', life: 5000 });
  }
};

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
      toast.add({ severity: 'success', summary: 'Success', detail: 'Staff member deleted successfully', life: 3000 });
      await refetch();
      closeDeleteConfirmation();
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete staff member', life: 5000 });
    }
  }
};

onMounted(() => {
  if (error.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load staff members', life: 5000 });
  }
});
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

/* Role background classes */
.bg-red-600 {
  background-color: #DC2626;
}

.bg-amber-600 {
  background-color: #D97706;
}

.bg-blue-600 {
  background-color: #2563EB;
}

.bg-green-600 {
  background-color: #059669;
}

.bg-gray-600 {
  background-color: #4B5563;
}

/* Utility classes */
.max-w-7xl {
  max-width: 80rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.p-4 {
  padding: 1rem;
}

.p-8 {
  padding: 2rem;
}

.py-16 {
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-0\.5rem {
  gap: 0.125rem;
}

.w-full {
  width: 100%;
}

.w-10 {
  width: 2.5rem;
}

.h-10 {
  height: 2.5rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-col {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4B5563;
}

.text-gray-500 {
  color: #6B7280;
}

.text-gray-400 {
  color: #9CA3AF;
}

.text-gray-300 {
  color: #D1D5DB;
}

.text-red-300 {
  color: #FCA5A5;
}

.text-white {
  color: #FFFFFF;
}

.bg-white {
  background-color: #FFFFFF;
}

.bg-gray-50 {
  background-color: #F9FAFB;
}

.border {
  border-width: 1px;
}

.border-gray-200 {
  border-color: #E5E7EB;
}

.border-gray-300 {
  border-color: #D1D5DB;
}

.border-b {
  border-bottom-width: 1px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

.divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
  border-color: #E5E7EB;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-auto {
  overflow-x: auto;
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}

/* Hover effects */
.hover\:bg-gray-50:hover {
  background-color: #F9FAFB;
}

/* Responsive classes */
@media (min-width: 640px) {
  .sm\:flex-row {
    flex-direction: row;
  }

  .sm\:w-56 {
    width: 14rem;
  }

  .sm\:w-48 {
    width: 12rem;
  }
}

/* Delete Dialog */
.delete-body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.delete-icon {
  font-size: 1.5rem;
  color: #ef4444;
}
</style>
