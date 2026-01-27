<template>
  <div class="page-container bg-gray-50">
    <!-- Toast notification will be handled by the parent layout -->
    <div class="content-container">
      <header class="mb-8 animate-fade-slide-down">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-cog text-blue-600 text-xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
            <p class="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>
      </header>

      <div class="card bg-white shadow-sm border border-gray-200 rounded-xl">
        <div class="p-6 lg:p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-lock text-blue-600"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Change Password</h2>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Old Password Field -->
            <div class="field-group">
              <label for="old_password" class="field-label">
                Old Password
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input 
                  id="old_password"
                  v-model="form.old_password"
                  :type="showOldPassword ? 'text' : 'password'"
                  :class="[
                    'field-input pr-12',
                    { 'border-red-300 focus:border-red-500 focus:ring-red-200': errors.old_password }
                  ]"
                  placeholder="Enter your current password"
                  :aria-invalid="errors.old_password ? 'true' : 'false'"
                  :aria-describedby="errors.old_password ? 'old_password-error' : undefined"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  @click="showOldPassword = !showOldPassword"
                  :aria-label="showOldPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showOldPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              <div v-if="errors.old_password" id="old_password-error" class="field-error">
                <i class="pi pi-exclamation-circle mr-1"></i>
                {{ errors.old_password }}
              </div>
            </div>
            
            <!-- New Password Field -->
            <div class="field-group">
              <label for="new_password" class="field-label">
                New Password
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input 
                  id="new_password"
                  v-model="form.new_password"
                  :type="showNewPassword ? 'text' : 'password'"
                  :class="[
                    'field-input pr-12',
                    { 'border-red-300 focus:border-red-500 focus:ring-red-200': errors.new_password }
                  ]"
                  placeholder="Enter your new password"
                  :aria-invalid="errors.new_password ? 'true' : 'false'"
                  :aria-describedby="errors.new_password ? 'new_password-error' : undefined"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  @click="showNewPassword = !showNewPassword"
                  :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              <div v-if="errors.new_password" id="new_password-error" class="field-error">
                <i class="pi pi-exclamation-circle mr-1"></i>
                {{ errors.new_password }}
              </div>
              <div class="field-hint">
                Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="field-group">
              <label for="confirm_password" class="field-label">
                Confirm New Password
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input 
                  id="confirm_password"
                  v-model="form.confirm_password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :class="[
                    'field-input pr-12',
                    { 'border-red-300 focus:border-red-500 focus:ring-red-200': errors.confirm_password }
                  ]"
                  placeholder="Confirm your new password"
                  :aria-invalid="errors.confirm_password ? 'true' : 'false'"
                  :aria-describedby="errors.confirm_password ? 'confirm_password-error' : undefined"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                >
                  <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              <div v-if="errors.confirm_password" id="confirm_password-error" class="field-error">
                <i class="pi pi-exclamation-circle mr-1"></i>
                {{ errors.confirm_password }}
              </div>
            </div>
            
            <!-- Form Actions -->
            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="resetForm"
                :disabled="isLoading"
              >
                <i class="pi pi-refresh mr-2"></i>
                Reset
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2"></i>
                <i v-else class="pi pi-check mr-2"></i>
                {{ isLoading ? 'Updating...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useChangePassword } from '~/composables/useSettings';
import { useAPIHelper } from '~/composables/useAPIHelper';

const { changePassword, isLoading, error: apiError } = useChangePassword();
const { getErrorMessage } = useAPIHelper();

const form = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
});

const errors = ref<Record<string, string>>({});
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const resetForm = () => {
  form.old_password = '';
  form.new_password = '';
  form.confirm_password = '';
  errors.value = {};
  showOldPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
};

const validate = () => {
  errors.value = {};
  
  if (!form.old_password.trim()) {
    errors.value.old_password = 'Current password is required.';
  }
  
  if (!form.new_password.trim()) {
    errors.value.new_password = 'New password is required.';
  } else if (form.new_password.length < 8) {
    errors.value.new_password = 'Password must be at least 8 characters long.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.new_password)) {
    errors.value.new_password = 'Password must include uppercase, lowercase, number, and special character.';
  }
  
  if (!form.confirm_password.trim()) {
    errors.value.confirm_password = 'Please confirm your new password.';
  } else if (form.new_password !== form.confirm_password) {
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

    // Show success message
    showToast({
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
        errors.value.old_password = Array.isArray(errorData.old_password) 
          ? errorData.old_password[0] 
          : errorData.old_password;
      }
      if (errorData.new_password) {
        errors.value.new_password = Array.isArray(errorData.new_password) 
          ? errorData.new_password[0] 
          : errorData.new_password;
      }
    } else {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: getErrorMessage(err),
        life: 3000,
      });
    }
  }
};

// Toast function - assuming it's provided by parent or global state
const showToast = (options: any) => {
  // This should be implemented based on your toast system
  console.log('Toast:', options);
};
</script>

<style scoped>
/* Page Layout - Using design system container patterns */
.page-container {
  @apply min-h-screen py-6 px-4 sm:px-6 lg:px-8;
}

.content-container {
  @apply max-w-2xl mx-auto;
}

/* Card Component - Following design system */
.card {
  @apply overflow-hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  @apply shadow-md;
  transform: translateY(-1px);
}

/* Form Field Patterns - Following design system field pattern */
.field-group {
  @apply space-y-2;
}

.field-label {
  @apply block text-sm font-medium text-gray-700;
}

.field-input {
  @apply block w-full px-4 py-3 border border-gray-300 rounded-lg;
  @apply text-gray-900 placeholder-gray-500;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500;
  @apply transition-colors duration-200 ease-in-out;
  @apply text-base;
}

.field-input:focus-visible {
  @apply ring-2 ring-blue-200 ring-offset-2 ring-offset-white;
}

.field-error {
  @apply flex items-center text-sm text-red-600;
  @apply mt-1;
}

.field-hint {
  @apply text-sm text-gray-500 mt-1;
}

/* Button System - Following design system */
.btn {
  @apply inline-flex items-center justify-center px-6 py-3;
  @apply text-sm font-medium rounded-lg;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply transition-all duration-200 ease-in-out;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply min-w-[120px];
}

.btn:focus-visible {
  @apply ring-2 ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
  @apply focus:ring-blue-500;
  @apply shadow-sm hover:shadow-md;
  @apply active:scale-[0.98];
}

.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-300;
  @apply hover:bg-gray-50 hover:border-gray-400;
  @apply focus:ring-blue-500;
  @apply active:scale-[0.98];
}

/* Animations - Following design system */
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fade-slide-down {
  0% { 
    opacity: 0; 
    transform: translateY(-10px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Responsive Design - Mobile-first approach */
@media (max-width: 640px) {
  .page-container {
    @apply py-4 px-3;
  }
  
  .field-input {
    @apply px-3 py-2.5;
  }
  
  .btn {
    @apply px-4 py-2.5 text-sm;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-slide-down {
    animation: none;
  }
  
  .card,
  .btn,
  .field-input {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    @apply border-2 border-gray-400;
  }
  
  .field-input {
    @apply border-2 border-gray-600;
  }
  
  .btn-primary {
    @apply bg-black text-white border-2 border-black;
  }
  
  .btn-secondary {
    @apply bg-white text-black border-2 border-black;
  }
}


</style>