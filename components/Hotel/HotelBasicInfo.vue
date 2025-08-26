<template>
  <Panel toggleable class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <template #header>
      <div class="flex items-center gap-2 text-lg font-semibold w-full">
        <i class="pi pi-id-card text-primary-500"></i>
        <span>Basic Information</span>
      </div>
    </template>
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div class="md:col-span-2">
          <FloatLabel>
            <InputText 
              id="name" 
              v-model="localHotelForm.name" 
              class="w-full" 
              :class="{'p-invalid': errors.name}" 
              @update:model-value="onNameChange"
            />
            <label for="name">Hotel Name</label>
          </FloatLabel>
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>
        <div class="md:col-span-2">
          <FloatLabel>
            <Textarea 
              id="description" 
              v-model="localHotelForm.description" 
              rows="4" 
              class="w-full" 
              autoResize 
              :class="{'p-invalid': errors.description}" 
              @update:model-value="onDescriptionChange"
            />
            <label for="description">Description</label>
          </FloatLabel>
          <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
        </div>
        <div class="md:col-span-2">
          <FloatLabel>
            <InputText 
              id="address" 
              v-model="localHotelForm.address" 
              class="w-full" 
              :class="{'p-invalid': errors.address}" 
              @update:model-value="onAddressChange"
            />
            <label for="address">Address</label>
          </FloatLabel>
          <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <InputText 
              id="city" 
              v-model="localHotelForm.city" 
              class="w-full" 
              :class="{'p-invalid': errors.city}" 
              @update:model-value="onCityChange"
            />
            <label for="city">City</label>
          </FloatLabel>
          <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <InputText 
              id="state" 
              v-model="localHotelForm.state" 
              class="w-full" 
              :class="{'p-invalid': errors.state}" 
              @update:model-value="onStateChange"
            />
            <label for="state">State</label>
          </FloatLabel>
          <small v-if="errors.state" class="p-error">{{ errors.state }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <InputText 
              id="pincode" 
              v-model="localHotelForm.pincode" 
              class="w-full" 
              :class="{'p-invalid': errors.pincode}" 
              @update:model-value="onPincodeChange"
            />
            <label for="pincode">Pincode</label>
          </FloatLabel>
          <small v-if="errors.pincode" class="p-error">{{ errors.pincode }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <InputText 
              id="country" 
              v-model="localHotelForm.country" 
              class="w-full" 
              :class="{'p-invalid': errors.country}" 
              @update:model-value="onCountryChange"
            />
            <label for="country">Country</label>
          </FloatLabel>
          <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <InputText 
              id="phone" 
              v-model="localHotelForm.phone" 
              class="w-full" 
              :class="{'p-invalid': errors.phone}" 
              @update:model-value="onPhoneChange"
            />
            <label for="phone">Phone</label>
          </FloatLabel>
          <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <InputText 
              id="email" 
              v-model="localHotelForm.email" 
              type="email" 
              class="w-full" 
              :class="{'p-invalid': errors.email}" 
              @update:model-value="onEmailChange"
            />
            <label for="email">Email</label>
          </FloatLabel>
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Panel from 'primevue/panel';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

// Define props
const props = defineProps({
  hotelForm: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

// Define emits
const emit = defineEmits(['update:hotelForm', 'save']);

// Create a local copy of the hotel form
const localHotelForm = ref({ ...props.hotelForm });

// Watch for changes in the prop and update local copy
watch(() => props.hotelForm, (newVal) => {
  localHotelForm.value = { ...newVal };
}, { deep: true });

// Field change handlers
const onNameChange = (value) => {
  localHotelForm.value.name = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onDescriptionChange = (value) => {
  localHotelForm.value.description = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onAddressChange = (value) => {
  localHotelForm.value.address = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onCityChange = (value) => {
  localHotelForm.value.city = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onStateChange = (value) => {
  localHotelForm.value.state = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onPincodeChange = (value) => {
  localHotelForm.value.pincode = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onCountryChange = (value) => {
  localHotelForm.value.country = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onPhoneChange = (value) => {
  localHotelForm.value.phone = value;
  emit('update:hotelForm', localHotelForm.value);
};

const onEmailChange = (value) => {
  localHotelForm.value.email = value;
  emit('update:hotelForm', localHotelForm.value);
};

// Save handler
const saveBasicInfo = () => {
  emit('save');
};
</script>

<style scoped>
.p-error {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>