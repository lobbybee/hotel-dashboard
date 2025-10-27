<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-2">Basic Information</h2>
    </div>

    <div class="space-y-6">
      <!-- Hotel Name - Full Width -->
      <div>
        <FloatLabel>
          <InputText
            id="name"
            v-model="localHotelForm.name"
            class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
            :class="{'border-red-500': errors.name}"
            @update:model-value="onNameChange"
          />
          <label for="name" class="text-gray-800">Hotel Name</label>
        </FloatLabel>
        <small v-if="errors.name" class="text-red-500 text-sm mt-1 block">{{ errors.name }}</small>
      </div>

      <!-- Description - Full Width -->
      <div>
        <FloatLabel>
          <Textarea
            id="description"
            v-model="localHotelForm.description"
            rows="4"
            class="w-full rounded-lg px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 resize-none"
            :class="{'border-red-500': errors.description}"
            autoResize
            @update:model-value="onDescriptionChange"
          />
          <label for="description" class="text-gray-800">Description</label>
        </FloatLabel>
        <small v-if="errors.description" class="text-red-500 text-sm mt-1 block">{{ errors.description }}</small>
      </div>

      <!-- Address - Full Width -->
      <div>
        <FloatLabel>
          <Textarea
            id="address"
            v-model="localHotelForm.address"
            class="w-full rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
            :class="{'border-red-500': errors.address}"
            @update:model-value="onAddressChange"
          />
          <label for="address" class="text-gray-800">Address</label>
        </FloatLabel>
        <small v-if="errors.address" class="text-red-500 text-sm mt-1 block">{{ errors.address }}</small>
      </div>

      <!-- City and State Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FloatLabel>
            <InputText
              id="city"
              v-model="localHotelForm.city"
              class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
              :class="{'border-red-500': errors.city}"
              @update:model-value="onCityChange"
            />
            <label for="city" class="text-gray-800">City</label>
          </FloatLabel>
          <small v-if="errors.city" class="text-red-500 text-sm mt-1 block">{{ errors.city }}</small>
        </div>

        <div>
          <FloatLabel>
            <InputText
              id="state"
              v-model="localHotelForm.state"
              class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
              :class="{'border-red-500': errors.state}"
              @update:model-value="onStateChange"
            />
            <label for="state" class="text-gray-800">State</label>
          </FloatLabel>
          <small v-if="errors.state" class="text-red-500 text-sm mt-1 block">{{ errors.state }}</small>
        </div>
      </div>

      <!-- Pincode and Country Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FloatLabel>
            <InputText
              id="pincode"
              v-model="localHotelForm.pincode"
              class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
              :class="{'border-red-500': errors.pincode}"
              @update:model-value="onPincodeChange"
            />
            <label for="pincode" class="text-gray-800">Pincode</label>
          </FloatLabel>
          <small v-if="errors.pincode" class="text-red-500 text-sm mt-1 block">{{ errors.pincode }}</small>
        </div>

        <div>
          <FloatLabel>
            <InputText
              id="country"
              v-model="localHotelForm.country"
              class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
              :class="{'border-red-500': errors.country}"
              @update:model-value="onCountryChange"
            />
            <label for="country" class="text-gray-800">Country</label>
          </FloatLabel>
          <small v-if="errors.country" class="text-red-500 text-sm mt-1 block">{{ errors.country }}</small>
        </div>
      </div>

      <!-- Phone and Email Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FloatLabel>
            <InputText
              id="phone"
              v-model="localHotelForm.phone"
              class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
              :class="{'border-red-500': errors.phone}"
              @update:model-value="onPhoneChange"
            />
            <label for="phone" class="text-gray-800">Phone</label>
          </FloatLabel>
          <small v-if="errors.phone" class="text-red-500 text-sm mt-1 block">{{ errors.phone }}</small>
        </div>

        <div>
          <FloatLabel>
            <InputText
              id="email"
              v-model="localHotelForm.email"
              type="email"
              class="w-full h-12 rounded-lg px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
              :class="{'border-red-500': errors.email}"
              @update:model-value="onEmailChange"
            />
            <label for="email" class="text-gray-800">Email</label>
          </FloatLabel>
          <small v-if="errors.email" class="text-red-500 text-sm mt-1 block">{{ errors.email }}</small>
        </div>
      </div>
    </div>
  </div>
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
