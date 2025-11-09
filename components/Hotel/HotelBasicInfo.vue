<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Basic Information</h2>
    </div>

    <div class="space-y-6">
      <!-- Hotel Name - Full Width -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
        <InputText
          id="name"
          v-model="hotelForm.name"
          class="w-full"
          :class="{'p-invalid': errors.name}"
          placeholder="Enter hotel name"
        />
        <small v-if="errors.name" class="text-red-500 text-sm mt-1 block">{{ errors.name }}</small>
      </div>

      <!-- Description - Full Width -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <Textarea
          id="description"
          v-model="hotelForm.description"
          rows="4"
          class="w-full"
          :class="{'p-invalid': errors.description}"
          autoResize
          placeholder="Enter hotel description"
        />
        <small v-if="errors.description" class="text-red-500 text-sm mt-1 block">{{ errors.description }}</small>
      </div>

      <!-- Address - Full Width -->
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <Textarea
          id="address"
          v-model="hotelForm.address"
          rows="3"
          class="w-full"
          :class="{'p-invalid': errors.address}"
          placeholder="Enter complete address"
        />
        <small v-if="errors.address" class="text-red-500 text-sm mt-1 block">{{ errors.address }}</small>
      </div>

      <!-- City and State Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-2">City</label>
          <InputText
            id="city"
            v-model="hotelForm.city"
            class="w-full"
            :class="{'p-invalid': errors.city}"
            placeholder="Enter city"
          />
          <small v-if="errors.city" class="text-red-500 text-sm mt-1 block">{{ errors.city }}</small>
        </div>

        <div>
          <label for="state" class="block text-sm font-medium text-gray-700 mb-2">State</label>
          <InputText
            id="state"
            v-model="hotelForm.state"
            class="w-full"
            :class="{'p-invalid': errors.state}"
            placeholder="Enter state"
          />
          <small v-if="errors.state" class="text-red-500 text-sm mt-1 block">{{ errors.state }}</small>
        </div>
      </div>

      <!-- Pincode and Country Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="pincode" class="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
          <InputText
            id="pincode"
            v-model="hotelForm.pincode"
            class="w-full"
            :class="{'p-invalid': errors.pincode}"
            placeholder="Enter pincode"
          />
          <small v-if="errors.pincode" class="text-red-500 text-sm mt-1 block">{{ errors.pincode }}</small>
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <InputText
            id="country"
            v-model="hotelForm.country"
            class="w-full"
            :class="{'p-invalid': errors.country}"
            placeholder="Enter country"
          />
          <small v-if="errors.country" class="text-red-500 text-sm mt-1 block">{{ errors.country }}</small>
        </div>
      </div>

      <!-- Phone and Email Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <InputText
            id="phone"
            v-model="hotelForm.phone"
            class="w-full"
            :class="{'p-invalid': errors.phone}"
            placeholder="Enter phone number"
          />
          <small v-if="errors.phone" class="text-red-500 text-sm mt-1 block">{{ errors.phone }}</small>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <InputText
            id="email"
            v-model="hotelForm.email"
            class="w-full"
            :class="{'p-invalid': errors.email}"
            placeholder="Enter email address"
          />
          <small v-if="errors.email" class="text-red-500 text-sm mt-1 block">{{ errors.email }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

defineProps({
  hotelForm: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['update:hotelForm']);
</script>
