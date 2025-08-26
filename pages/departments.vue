<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-building text-primary-500"></i> Department Management
          </h1>
          <p class="text-gray-500">Manage your hotel's departments and their settings.</p>
        </div>
        <Button label="Add Department" icon="pi pi-plus" @click="openAddDepartmentForm" />
      </header>

      <!-- Departments List -->
      <div class="space-y-6">
        <transition-group name="fade-up" tag="div" class="space-y-6">
          <Card 
            v-for="department in departments" 
            :key="department.id"
            class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <template #title>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <i :class="getDepartmentIcon(department.department_type)" :style="{ color: getDepartmentColor(department.department_type) }"></i>
                  {{ department.name }}
                </h3>
                <Badge :value="department.is_active ? 'Active' : 'Inactive'" :severity="department.is_active ? 'success' : 'danger'" class="px-3 py-1 text-sm" />
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-gray-600">
                  <i class="pi pi-clock"></i>
                  <span>{{ formatOperatingHours(department.operating_hours_start, department.operating_hours_end) }}</span>
                </div>
                
                <div v-if="department.whatsapp_number" class="flex items-center gap-2 text-gray-600">
                  <i class="pi pi-whatsapp text-green-500"></i>
                  <span>{{ department.whatsapp_number }}</span>
                </div>
                
                <div class="flex flex-wrap gap-2 mt-4">
                  <Button 
                    icon="pi pi-pencil" 
                    class="p-button-sm p-button-outlined" 
                    @click="openEditDepartmentForm(department)"
                    label="Edit"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-sm p-button-danger p-button-outlined" 
                    @click="openDeleteConfirmation(department)"
                    label="Delete"
                  />
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
      </div>

      <!-- Empty State -->
      <div v-if="departments.length === 0" class="text-center py-12">
        <i class="pi pi-building text-5xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Departments Found</h3>
        <p class="text-gray-500 mb-4">Get started by adding your first department.</p>
        <Button label="Add Department" icon="pi pi-plus" @click="openAddDepartmentForm" />
      </div>

    </div>
  </div>

  <!-- Add/Edit Department Dialog -->
  <Dialog 
    v-model:visible="departmentDialogVisible" 
    :header="editingDepartment ? 'Edit Department' : 'Add Department'"
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
            id="name" 
            v-model="departmentForm.name" 
            class="w-full" 
            :class="{'p-invalid': departmentErrors.name}" 
          />
          <label for="name">Department Name</label>
        </FloatLabel>
        <small v-if="departmentErrors.name" class="p-error">{{ departmentErrors.name }}</small>
      </div>
      
      <div>
        <FloatLabel>
          <Dropdown 
            id="department_type" 
            v-model="departmentForm.department_type" 
            :options="departmentTypes" 
            optionLabel="label" 
            optionValue="value"
            class="w-full"
            :class="{'p-invalid': departmentErrors.department_type}" 
          />
          <label for="department_type">Department Type</label>
        </FloatLabel>
        <small v-if="departmentErrors.department_type" class="p-error">{{ departmentErrors.department_type }}</small>
      </div>
      
      <div>
        <FloatLabel>
          <InputText 
            id="whatsapp_number" 
            v-model="departmentForm.whatsapp_number" 
            class="w-full" 
            :class="{'p-invalid': departmentErrors.whatsapp_number}" 
          />
          <label for="whatsapp_number">WhatsApp Number</label>
        </FloatLabel>
        <small v-if="departmentErrors.whatsapp_number" class="p-error">{{ departmentErrors.whatsapp_number }}</small>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <FloatLabel>
            <InputText 
              id="operating_hours_start" 
              v-model="departmentForm.operating_hours_start" 
              class="w-full" 
              :class="{'p-invalid': departmentErrors.operating_hours_start}" 
            />
            <label for="operating_hours_start">Opening Time (HH:MM)</label>
          </FloatLabel>
          <small v-if="departmentErrors.operating_hours_start" class="p-error">{{ departmentErrors.operating_hours_start }}</small>
        </div>
        
        <div>
          <FloatLabel>
            <InputText 
              id="operating_hours_end" 
              v-model="departmentForm.operating_hours_end" 
              class="w-full" 
              :class="{'p-invalid': departmentErrors.operating_hours_end}" 
            />
            <label for="operating_hours_end">Closing Time (HH:MM)</label>
          </FloatLabel>
          <small v-if="departmentErrors.operating_hours_end" class="p-error">{{ departmentErrors.operating_hours_end }}</small>
        </div>
      </div>
      
      <div class="flex items-center">
        <Checkbox 
          id="is_active" 
          v-model="departmentForm.is_active" 
          :binary="true" 
          class="mr-2"
        />
        <label for="is_active">Department is Active</label>
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDepartmentForm" />
      <Button 
        :label="editingDepartment ? 'Update' : 'Create'" 
        icon="pi pi-check" 
        @click="saveDepartment" 
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
        Are you sure you want to delete <b>{{ selectedDepartment?.name }}</b>? This action cannot be undone.
      </span>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDeleteConfirmation" />
      <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteDepartment" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import FloatLabel from 'primevue/floatlabel';
import Badge from 'primevue/badge';

// Mock data for departments
const departments = ref([
  {
    id: 1,
    name: 'Front Desk',
    department_type: 'reception',
    whatsapp_number: '+1234567890',
    operating_hours_start: '08:00',
    operating_hours_end: '22:00',
    is_active: true
  },
  {
    id: 2,
    name: 'Housekeeping',
    department_type: 'housekeeping',
    whatsapp_number: '+1234567891',
    operating_hours_start: '07:00',
    operating_hours_end: '20:00',
    is_active: true
  },
  {
    id: 3,
    name: 'Maintenance',
    department_type: 'maintenance',
    whatsapp_number: '+1234567892',
    operating_hours_start: '09:00',
    operating_hours_end: '18:00',
    is_active: true
  }
]);

// Department types from Django model
const departmentTypes = [
  { label: 'Reception', value: 'reception' },
  { label: 'Housekeeping', value: 'housekeeping' },
  { label: 'Room Service', value: 'room_service' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Concierge', value: 'concierge' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Spa & Wellness', value: 'spa' },
  { label: 'Laundry', value: 'laundry' },
  { label: 'Transport', value: 'transport' },
  { label: 'Other', value: 'other' }
];

// Icons and colors for department types
const departmentIcons: Record<string, string> = {
  reception: 'pi pi-users',
  housekeeping: 'pi pi-home',
  room_service: 'pi pi-concierge-bell',
  maintenance: 'pi pi-wrench',
  concierge: 'pi pi-map-marker',
  restaurant: 'pi pi-utensils',
  spa: 'pi pi-spa',
  laundry: 'pi pi-tshirt',
  transport: 'pi pi-car',
  other: 'pi pi-ellipsis-h'
};

const departmentColors: Record<string, string> = {
  reception: '#3B82F6',
  housekeeping: '#10B981',
  room_service: '#F59E0B',
  maintenance: '#8B5CF6',
  concierge: '#EC4899',
  restaurant: '#EF4444',
  spa: '#06B6D4',
  laundry: '#8B5CF6',
  transport: '#F97316',
  other: '#6B7280'
};

// Form handling
const departmentDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const editingDepartment = ref<any>(null);
const selectedDepartment = ref<any>(null);

const departmentForm = reactive({
  name: '',
  department_type: '',
  whatsapp_number: '',
  operating_hours_start: '',
  operating_hours_end: '',
  is_active: true
});

const departmentErrors = ref<Record<string, string>>({});

// Helper functions
const getDepartmentIcon = (type: string) => {
  return departmentIcons[type] || 'pi pi-building';
};

const getDepartmentColor = (type: string) => {
  return departmentColors[type] || '#6B7280';
};

const formatOperatingHours = (start: string, end: string) => {
  return `${start} - ${end}`;
};

// Form actions
const openAddDepartmentForm = () => {
  editingDepartment.value = null;
  departmentForm.name = '';
  departmentForm.department_type = '';
  departmentForm.whatsapp_number = '';
  departmentForm.operating_hours_start = '';
  departmentForm.operating_hours_end = '';
  departmentForm.is_active = true;
  departmentErrors.value = {};
  departmentDialogVisible.value = true;
};

const openEditDepartmentForm = (department: any) => {
  editingDepartment.value = department;
  departmentForm.name = department.name;
  departmentForm.department_type = department.department_type;
  departmentForm.whatsapp_number = department.whatsapp_number;
  departmentForm.operating_hours_start = department.operating_hours_start;
  departmentForm.operating_hours_end = department.operating_hours_end;
  departmentForm.is_active = department.is_active;
  departmentErrors.value = {};
  departmentDialogVisible.value = true;
};

const closeDepartmentForm = () => {
  departmentDialogVisible.value = false;
};

const saveDepartment = () => {
  // Form validation would go here
  departmentErrors.value = {};
  
  // Basic validation
  if (!departmentForm.name.trim()) {
    departmentErrors.value.name = 'Department name is required';
  }
  
  if (!departmentForm.department_type) {
    departmentErrors.value.department_type = 'Department type is required';
  }
  
  if (!departmentForm.operating_hours_start) {
    departmentErrors.value.operating_hours_start = 'Opening time is required';
  }
  
  if (!departmentForm.operating_hours_end) {
    departmentErrors.value.operating_hours_end = 'Closing time is required';
  }
  
  // If there are errors, don't proceed
  if (Object.keys(departmentErrors.value).length > 0) {
    return;
  }
  
  // Save logic would go here
  if (editingDepartment.value) {
    // Update existing department
    const index = departments.value.findIndex(d => d.id === editingDepartment.value.id);
    if (index !== -1) {
      departments.value[index] = {
        ...departments.value[index],
        ...departmentForm
      };
    }
  } else {
    // Add new department
    departments.value.push({
      id: departments.value.length + 1,
      ...departmentForm
    });
  }
  
  closeDepartmentForm();
};

// Delete actions
const openDeleteConfirmation = (department: any) => {
  selectedDepartment.value = department;
  deleteDialogVisible.value = true;
};

const closeDeleteConfirmation = () => {
  deleteDialogVisible.value = false;
  selectedDepartment.value = null;
};

const deleteDepartment = () => {
  if (selectedDepartment.value) {
    departments.value = departments.value.filter(d => d.id !== selectedDepartment.value.id);
    closeDeleteConfirmation();
  }
};
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