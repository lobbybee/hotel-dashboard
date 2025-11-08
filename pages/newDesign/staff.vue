
<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 fade-in">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p class="text-gray-600">Manage hotel staff and permissions</p>
        </div>
        <Button label="Add Staff Member" icon="pi pi-plus" @click="openAddStaffDialog" />
      </div>
    </div>

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
          v-model="filterRole"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="All Roles"
          class="w-full sm:w-56"
        />
        <Dropdown
          v-model="filterStatus"
          :options="statusFilterOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="All Status"
          class="w-full sm:w-48"
        />
      </div>
    </div>

    <div v-if="filteredStaff.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-users text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">No staff members found</p>
      <p class="text-gray-400 text-sm">Add staff members to manage your hotel team</p>
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
            <tr v-for="member in filteredStaff" :key="member.id" class="hover:bg-gray-50 transition-colors">
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
                    @click="editStaff(member)"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    @click="confirmDelete(member)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog v-model:visible="staffDialogVisible" modal :header="editingStaff ? 'Edit Staff Member' : 'Add Staff Member'" :style="{ width: '35rem' }">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
          <InputText v-model="staffForm.username" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <InputText v-model="staffForm.email" type="email" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <InputText v-model="staffForm.phone_number" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
          <Dropdown
            v-model="staffForm.user_type"
            :options="roleOptions.filter(r => r.value)"
            optionLabel="label"
            optionValue="value"
            placeholder="Select role"
            class="w-full"
          />
        </div>
        <div v-if="staffForm.user_type === 'department_staff'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Departments</label>
          <MultiSelect
            v-model="staffForm.department"
            :options="departments"
            placeholder="Select departments"
            class="w-full"
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
        <Button label="Cancel" text @click="staffDialogVisible = false" />
        <Button :label="editingStaff ? 'Update' : 'Add'" @click="saveStaff" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore } from '@/stores/hotelStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import InputSwitch from 'primevue/inputswitch'
import type { Staff } from '../types'

const hotelStore = useHotelStore()
const toast = useToast()
const confirm = useConfirm()

const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const staffDialogVisible = ref(false)
const editingStaff = ref(false)

const staffForm = ref({
  id: 0,
  username: '',
  email: '',
  phone_number: '',
  user_type: '' as Staff['user_type'],
  is_active_hotel_user: true,
  department: [] as string[]
})

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Hotel Admin', value: 'hotel_admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Department Staff', value: 'department_staff' },
  { label: 'Other Staff', value: 'other_staff' }
]

const statusFilterOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const departments = [
  'Housekeeping',
  'Maintenance',
  'Food & Beverage',
  'Front Desk',
  'Kitchen',
  'Security',
  'Laundry'
]

const filteredStaff = computed(() => {
  let staff = [...hotelStore.staff]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    staff = staff.filter(s =>
      s.username.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    )
  }

  if (filterRole.value) {
    staff = staff.filter(s => s.user_type === filterRole.value)
  }

  if (filterStatus.value) {
    const isActive = filterStatus.value === 'active'
    staff = staff.filter(s => s.is_active_hotel_user === isActive)
  }

  return staff
})

const formatRole = (role: string) => {
  return role.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getRoleSeverity = (role: Staff['user_type']) => {
  const severities = {
    hotel_admin: 'danger',
    manager: 'warning',
    receptionist: 'info',
    department_staff: 'success',
    other_staff: 'secondary'
  }
  return severities[role] as any
}

const getRoleBgClass = (role: Staff['user_type']) => {
  const classes = {
    hotel_admin: 'bg-red-600',
    manager: 'bg-amber-600',
    receptionist: 'bg-blue-600',
    department_staff: 'bg-green-600',
    other_staff: 'bg-gray-600'
  }
  return classes[role]
}

const openAddStaffDialog = () => {
  editingStaff.value = false
  staffForm.value = {
    id: 0,
    username: '',
    email: '',
    phone_number: '',
    user_type: '' as Staff['user_type'],
    is_active_hotel_user: true,
    department: []
  }
  staffDialogVisible.value = true
}

const editStaff = (member: Staff) => {
  editingStaff.value = true
  staffForm.value = {
    ...member,
    phone_number: member.phone_number || ''
  }
  staffDialogVisible.value = true
}

const saveStaff = () => {
  if (!staffForm.value.username || !staffForm.value.email || !staffForm.value.user_type) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please fill in all required fields',
      life: 3000
    })
    return
  }

  if (editingStaff.value) {
    hotelStore.updateStaffMember(staffForm.value.id, staffForm.value)
    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Staff member updated successfully',
      life: 3000
    })
  } else {
    hotelStore.addStaffMember(staffForm.value)
    toast.add({
      severity: 'success',
      summary: 'Added',
      detail: 'Staff member added successfully',
      life: 3000
    })
  }

  staffDialogVisible.value = false
}

const confirmDelete = (member: Staff) => {
  confirm.require({
    message: `Are you sure you want to remove ${member.username} from the staff?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      hotelStore.deleteStaffMember(member.id)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Staff member removed successfully',
        life: 3000
      })
    }
  })
}
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
</style>
