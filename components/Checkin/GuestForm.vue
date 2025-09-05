<template>
  <div class="space-y-6">
    <h4 class="font-semibold text-gray-700 border-b pb-2">Guest & Stay Information</h4>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <InputText id="full_name" :modelValue="guestForm.full_name" @update:modelValue="update('full_name', $event)" class="w-full" />
      </div>
      <div>
        <label for="whatsapp_number" class="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
        <InputText id="whatsapp_number" :modelValue="guestForm.whatsapp_number" @update:modelValue="update('whatsapp_number', $event)" class="w-full" />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <InputText id="email" :modelValue="guestForm.email" @update:modelValue="update('email', $event)" class="w-full" />
      </div>
      <div>
        <label for="dob" class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <Calendar id="dob" :modelValue="guestForm.date_of_birth" @update:modelValue="update('date_of_birth', $event)" class="w-full" />
      </div>
      <div>
        <label for="nationality" class="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
        <InputText id="nationality" :modelValue="guestForm.nationality" @update:modelValue="update('nationality', $event)" class="w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';

const props = defineProps(['guestForm']);
const emit = defineEmits(['update-guest-field']);

const update = (field: string, value: any) => {
  emit('update-guest-field', { field, value });
};
</script>
