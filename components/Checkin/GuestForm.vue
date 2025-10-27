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
      <div>
        <label for="number_of_guests" class="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
        <InputNumber
          id="number_of_guests"
          :modelValue="guestForm.number_of_guests"
          @update:modelValue="update('number_of_guests', $event)"
          class="w-full"
          :min="1"
          :max="10"
        />
      </div>

      <!-- Accompanying guest names -->
      <div v-if="guestForm.number_of_guests > 1" class="col-span-2">
        <h5 class="font-medium text-gray-700 mb-2">Accompanying Guests</h5>
        <div v-for="index in (guestForm.number_of_guests - 1)" :key="index" class="mb-4 p-3 border border-gray-200 rounded-lg">
          <label :for="`guest_name_${index}`" class="block text-sm text-gray-600 mb-1">Guest {{ index }} Name</label>
          <InputText
            :id="`guest_name_${index}`"
            :modelValue="getGuestName(index)"
            @update:modelValue="updateGuestName(index, $event)"
            class="w-full mb-2"
            placeholder="Enter guest name"
          />

          <div class="mt-2">
            <label class="block text-sm text-gray-600 mb-1">Document Type</label>
            <Dropdown
              :modelValue="getAccompanyingGuestDocType(index)"
              @update:modelValue="updateAccompanyingGuestDocType(index, $event)"
              :options="documentTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Select document type"
              class="w-full mb-2"
            />
            <label class="block text-sm text-gray-600 mb-1">Identity Document</label>
            <FileUpload
              :name="`accompanying_guest_${index}_document`"
              @select="onAccompanyingGuestDocSelect(index, $event)"
              :multiple="false"
              accept="image/*,application/pdf"
              :maxFileSize="2000000"
            >
              <template #empty>
                <p class="text-gray-500 text-sm">Drag and drop document here to upload</p>
              </template>
            </FileUpload>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import FileUpload from 'primevue/fileupload';
import Dropdown from 'primevue/dropdown';

const props = defineProps(['guestForm']);
const emit = defineEmits(['update-guest-field', 'accompanying-guest-doc-select']);

const documentTypes = [
  { label: 'AADHAR ID', value: 'aadhar_id' },
  { label: 'Driving License', value: 'driving_license' },
  { label: 'National ID', value: 'national_id' },
  { label: 'Voter ID', value: 'voter_id' },
  { label: 'Other', value: 'other' }
];

const update = (field: string, value: any) => {
  emit('update-guest-field', { field, value });
};

const getGuestName = (index: number) => {
  if (!props.guestForm.guest_names || props.guestForm.guest_names.length < index) {
    return '';
  }
  return props.guestForm.guest_names[index - 1] || '';
};

const updateGuestName = (index: number, value: string) => {
  const guestNames = [...(props.guestForm.guest_names || [])];
  guestNames[index - 1] = value;
  emit('update-guest-field', { field: 'guest_names', value: guestNames });
};

const onAccompanyingGuestDocSelect = (index: number, event: any) => {
  // Emit event to parent component to handle document upload
  emit('accompanying-guest-doc-select', { index, files: event.files });
};

const getAccompanyingGuestDocType = (index: number) => {
  return props.guestForm[`accompanying_guest_${index}_doc_type`] || null;
};

const updateAccompanyingGuestDocType = (index: number, value: string) => {
  emit('update-guest-field', { field: `accompanying_guest_${index}_doc_type`, value });
};
</script>
