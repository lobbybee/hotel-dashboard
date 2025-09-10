<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <Toast />
    <div class="max-w-2xl mx-auto">
      <header class="mb-8 animate-fade-slide-down">
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <i class="pi pi-cog text-primary-500"></i> Settings
        </h1>
        <p class="text-gray-500">Manage your account settings.</p>
      </header>

      <Card class="shadow-md border border-gray-200">
        <template #title>
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <i class="pi pi-lock"></i>
            Change Password
          </h3>
        </template>
        <template #content>
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <div class="p-fluid space-y-6">
              <div class="flex flex-col gap-2">
                <label for="old_password">Old Password</label>
                <Password 
                  id="old_password" 
                  v-model="form.old_password" 
                  class="w-full" 
                  :class="{'p-invalid': errors.old_password}"
                  toggleMask
                  :feedback="false"
                />
                <small v-if="errors.old_password" class="p-error">{{ errors.old_password }}</small>
              </div>
              
              <div class="flex flex-col gap-2">
                <label for="new_password">New Password</label>
                <Password 
                  id="new_password" 
                  v-model="form.new_password" 
                  class="w-full" 
                  :class="{'p-invalid': errors.new_password}"
                  toggleMask
                />
                <small v-if="errors.new_password" class="p-error">{{ errors.new_password }}</small>
              </div>

              <div class="flex flex-col gap-2">
                <label for="confirm_password">Confirm New Password</label>
                <Password 
                  id="confirm_password" 
                  v-model="form.confirm_password" 
                  class="w-full" 
                  :class="{'p-invalid': errors.confirm_password}"
                  toggleMask
                  :feedback="false"
                />
                <small v-if="errors.confirm_password" class="p-error">{{ errors.confirm_password }}</small>
              </div>
            </div>
            
            <div class="flex justify-end gap-2">
              <Button type="button" label="Reset" icon="pi pi-refresh" class="p-button-text" @click="resetForm" />
              <Button 
                type="submit" 
                label="Change Password" 
                icon="pi pi-check" 
                :loading="isLoading"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useChangePassword } from '~/composables/useSettings';

const { changePassword, isLoading, error: apiError } = useChangePassword();
const toast = useToast();

const form = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
});

const errors = ref<Record<string, string>>({});

const resetForm = () => {
  form.old_password = '';
  form.new_password = '';
  form.confirm_password = '';
  errors.value = {};
};

const validate = () => {
  errors.value = {};
  if (!form.old_password) {
    errors.value.old_password = 'Old password is required.';
  }
  if (!form.new_password) {
    errors.value.new_password = 'New password is required.';
  } else if (form.new_password.length < 8) {
    errors.value.new_password = 'Password must be at least 8 characters long.';
  }
  if (form.new_password !== form.confirm_password) {
    errors.value.confirm_password = 'Passwords do not match.';
  }
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  try {
    await changePassword({
      old_password: form.old_password,
      new_password: form.new_password,
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password updated successfully!',
      life: 3000,
    });
    resetForm();

  } catch (err: any) {
    const errorData = err.data;
    if (errorData) {
        if (errorData.old_password) {
            errors.value.old_password = errorData.old_password[0];
        }
        if (errorData.new_password) {
            errors.value.new_password = errorData.new_password[0];
        }
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An unexpected error occurred. Please try again.',
            life: 3000,
        });
    }
  }
};
</script>

<style scoped>
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
