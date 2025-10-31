<template>
  <div class="staff-page">
    <div class="page-container">
      <!-- Header -->
      <header class="header">
        <div class="title-wrap">
          <h1 class="page-title">
            <i class="pi pi-users title-icon"></i>
            Staff Management
          </h1>
          <p class="page-subtitle">Manage hotel staff members and their roles</p>
        </div>
        <Button
          label="Add Staff Member"
          icon="pi pi-plus"
          :rounded="true"
          :raised="true"
          :loading="createAsyncStatus === 'pending'"
          @click="openAddStaffForm"
        />
      </header>

      <!-- Stats -->
      <div class="stats-bar">
        <Tag :value="`Total: ${totalStaffCount}`" severity="info" :rounded="true" />
        <Tag :value="`Active: ${activeStaffCount}`" severity="success" :rounded="true" />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="card loading-card">
        <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
        <p class="muted">Loading staff members...</p>
      </div>

      <!-- Error -->
      <Message v-else-if="error" severity="error" :closable="false" class="card message-card">
        <div class="message-flex">
          <div>
            <div class="message-title">Error loading staff members</div>
            <div class="message-detail">{{ error?.message || 'An unexpected error occurred' }}</div>
          </div>
          <Button label="Retry" icon="pi pi-refresh" text @click="refetch" />
        </div>
      </Message>

      <!-- Main -->
      <div v-else class="content">
        <!-- Toolbar -->
        <div class="card toolbar-card">
          <div class="toolbar">
            <div class="toolbar-title">Staff Members</div>
            <div class="toolbar-actions">
              <Dropdown
                v-model="selectedDepartmentFilter"
                :options="departmentFilterOptions"
                placeholder="All Departments"
                optionLabel="label"
                optionValue="value"
                class="toolbar-dropdown"
              />
              <Dropdown
                v-model="selectedRoleFilter"
                :options="roleFilterOptions"
                placeholder="All Roles"
                optionLabel="label"
                optionValue="value"
                class="toolbar-dropdown"
              />
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card table-card">
          <DataTable
            :value="filteredStaffMembers"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            stripedRows
            responsiveLayout="scroll"
            class="p-datatable-sm"
          >
            <template #empty>
              <div class="empty">
                <i class="pi pi-users empty-icon"></i>
                <h3 class="empty-title">No Staff Members Found</h3>
                <p class="empty-text">Get started by adding your first staff member.</p>
                <Button label="Add Staff Member" icon="pi pi-plus" :rounded="true" :raised="true" @click="openAddStaffForm" />
              </div>
            </template>

            <Column field="username" header="Staff Member" sortable>
              <template #body="slotProps">
                <div class="col-staff">
                  <div class="staff-name">{{ slotProps.data.username }}</div>
                  <div class="staff-id">ID: {{ slotProps.data.id }}</div>
                </div>
              </template>
            </Column>

            <Column field="user_type" header="Role & Department" sortable>
              <template #body="slotProps">
                <div class="col-role">
                  <div class="role-line">
                    <i class="pi pi-id-card" :style="{ color: getStaffRoleColor(slotProps.data.user_type) }"></i>
                    <span class="role-name">{{ slotProps.data.user_type.replace('_', ' ') }}</span>
                  </div>
                  <div v-if="slotProps.data.department && slotProps.data.department.length" class="dept-tags">
                    <Tag
                      v-for="dep in slotProps.data.department"
                      :key="dep"
                      :value="dep"
                      severity="info"
                      class="dept-tag"
                    />
                  </div>
                </div>
              </template>
            </Column>

            <Column field="email" header="Contact" sortable>
              <template #body="slotProps">
                <div class="col-contact">
                  <div class="contact-line">
                    <i class="pi pi-envelope contact-icon"></i>
                    <span>{{ slotProps.data.email }}</span>
                  </div>
                  <div v-if="slotProps.data.phone_number" class="contact-line">
                    <i class="pi pi-phone contact-icon"></i>
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
                <div class="actions">
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    :rounded="true"
                    severity="info"
                    @click="openEditStaffForm(slotProps.data)"
                    v-tooltip.top="'Edit'"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    text
                    :rounded="true"
                    severity="danger"
                    @click="openDeleteConfirmation(slotProps.data)"
                    v-tooltip.top="'Delete'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Staff Dialog -->
  <Dialog
    v-model:visible="staffDialogVisible"
    :header="editingStaff ? 'Edit Staff Member' : 'Add Staff Member'"
    :modal="true"
    :style="{ width: '520px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="dialog-body">
      <div class="field">
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

      <div class="field">
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

      <div class="field">
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

      <div class="field">
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

      <div class="field" v-if="staffForm.user_type === 'department_staff'">
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

      <div class="field">
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

      <div class="checkbox-line">
        <Checkbox
          id="is_active_hotel_user"
          v-model="staffForm.is_active_hotel_user"
          :binary="true"
        />
        <label for="is_active_hotel_user">Staff Member is Active</label>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text :rounded="true" @click="closeStaffForm" />
      <Button :label="editingStaff ? 'Update' : 'Create'" icon="pi pi-check" :rounded="true" @click="saveStaff" />
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
import Message from 'primevue/message';
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
.staff-page {
  padding: 2rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--surface-border);
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  color: var(--primary-color);
}

.page-subtitle {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.95rem;
}

.stats-bar {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0 1.25rem;
  flex-wrap: wrap;
}

.card {
  background: var(--surface-card);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}

.loading-card {
  padding: 3rem 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.muted {
  color: var(--text-color-secondary);
}

.message-card {
  padding: 1rem;
}

.message-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.message-title {
  color: var(--text-color);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.message-detail {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar-card {
  padding: 1rem 1.25rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.toolbar-title {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.toolbar-dropdown {
  min-width: 220px;
}

.table-card {
  padding: 0.5rem;
}

.empty {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-color-secondary);
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.empty-title {
  color: var(--text-color);
  margin: 0.25rem 0;
}

.empty-text {
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

/* Column cell styles */
.col-staff .staff-name {
  color: var(--text-color);
  font-weight: 600;
}
.col-staff .staff-id {
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.col-role .role-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.col-role .role-name {
  text-transform: capitalize;
  font-weight: 500;
  color: var(--text-color);
}
.dept-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}
.dept-tag {
  font-size: 0.75rem;
}

.col-contact .contact-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  font-size: 0.95rem;
}
.contact-icon {
  color: var(--text-color-secondary);
}

/* Actions */
.actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

/* Dialog */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field small.p-error {
  margin-top: 0.25rem;
  display: block;
}
.checkbox-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Delete Dialog */
.delete-body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.delete-icon {
  font-size: 1.5rem;
  color: var(--red-500, #ef4444);
}

/* DataTable theming */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: var(--surface-ground);
  color: var(--text-color);
  font-weight: 600;
  border-bottom: 1px solid var(--surface-border);
}
:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s ease;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: var(--surface-hover);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .toolbar-dropdown {
    min-width: 0;
    width: 100%;
  }
}
</style>