<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

      <!-- Step 1: Request Reset -->
      <div v-if="step === 'request'">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p class="text-gray-600 text-sm">Enter your email to receive a password reset code.</p>
        </div>

        <form @submit.prevent="handleRequestReset" class="space-y-5">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-800">Email</label>
            <InputText
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
              :invalid="!!error"
              class="w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              required
            />
          </div>

          <Message v-if="error" severity="error" :closable="false" class="w-full" />
          <Message v-if="message" severity="info" :closable="false" class="w-full" />

          <Button
            type="submit"
            label="Send Reset Code"
            :loading="loading"
            icon="pi pi-envelope"
            class="w-full h-12 bg-blue-500 hover:bg-blue-600 border-none rounded-lg text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2"
          />
        </form>
      </div>

      <!-- Step 2: Confirm Reset -->
      <div v-if="step === 'confirm'">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirm Reset</h2>
          <p class="text-gray-600 text-sm">Enter the code from your email and a new password.</p>
        </div>

        <form @submit.prevent="handleConfirmReset" class="space-y-5">
          <div class="space-y-2">
            <label for="confirm-email" class="block text-sm font-medium text-gray-800">Email</label>
            <InputText
              id="confirm-email"
              v-model="email"
              class="w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 bg-gray-50 cursor-not-allowed"
              readonly
            />
          </div>

          <div class="space-y-2">
            <label for="otp" class="block text-sm font-medium text-gray-800">Reset Code (OTP)</label>
            <InputText
              id="otp"
              v-model="otp"
              placeholder="Enter 6-digit code"
              :invalid="!!error"
              class="w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="new_password" class="block text-sm font-medium text-gray-800">New Password</label>
            <Password
              id="new_password"
              v-model="new_password"
              placeholder="Enter new password"
              :invalid="!!error"
              :feedback="true"
              :toggleMask="true"
              class="w-full"
              input-class="w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 pr-12 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              required
            />
          </div>

          <Message v-if="message" severity="success" :closable="false" class="w-full" >
              Success
          </Message>
          <Message v-if="error" severity="error" :closable="false" class="w-full" >
              Error
          </Message>

          <Button
            type="submit"
            label="Set New Password"
            :loading="loading"
            icon="pi pi-check"
            class="w-full h-12 bg-blue-500 hover:bg-blue-600 border-none rounded-lg text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2"
          />
        </form>
      </div>

      <div class="text-center mt-6">
        <NuxtLink to="/login" class="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 hover:underline transition-colors duration-200 font-medium">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAPI, APIError } from '~/composables/useAPI';
import { useAPIHelper } from '~/composables/useAPIHelper';
import { PasswordResetRequestSchema, PasswordResetConfirmSchema } from '~/utils/schemas/auth';

definePageMeta({
  layout: 'auth'
});

const { requestPasswordReset, confirmPasswordReset } = useAPI();
const router = useRouter();
const { getErrorMessage } = useAPIHelper();

const step = ref('request'); // 'request' or 'confirm'
const email = ref('');
const otp = ref('');
const new_password = ref('');
const loading = ref(false);
const error = ref('');
const message = ref('');

async function handleRequestReset() {
  loading.value = true;
  error.value = '';
  message.value = '';

  // Zod Validation
  const validationResult = PasswordResetRequestSchema.safeParse({ email: email.value });
  if (!validationResult.success) {
    error.value = validationResult.error?.issues[0]?.message || 'Validation failed';
    loading.value = false;
    return;
  }

  try {
    const response = await requestPasswordReset({ email: email.value });
    message.value = response.message || "If an account with that email exists, a password reset OTP has been sent.";
    step.value = 'confirm';
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function handleConfirmReset() {
  loading.value = true;
  error.value = '';
  message.value = '';

  // Zod Validation
  const validationResult = PasswordResetConfirmSchema.safeParse({
    email: email.value,
    otp: otp.value,
    new_password: new_password.value
  });
  if (!validationResult.success) {
    error.value = validationResult.error?.issues[0]?.message || 'Validation failed';
    loading.value = false;
    return;
  }

  try {
    const response = await confirmPasswordReset({
      email: email.value,
      otp: otp.value,
      new_password: new_password.value
    });
    message.value = response.message || 'Password has been reset successfully. Redirecting to login...';
    error.value = ''; // Clear previous errors on success
    setTimeout(() => router.push('/login'), 3000);
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>


<style scoped>
/* Custom styles for PrimeVue components */
:deep(.p-inputtext) {
  @apply w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 transition-all duration-200;
}

:deep(.p-inputtext:focus) {
  @apply border-blue-500 ring-2 ring-blue-100 outline-none;
}

:deep(.p-inputtext:read-only) {
  @apply bg-gray-50 cursor-not-allowed;
}

:deep(.p-password) {
  @apply w-full;
}

:deep(.p-password .p-inputtext) {
  @apply w-full pr-12;
}

:deep(.p-button) {
  @apply w-full h-12 bg-blue-500 hover:bg-blue-600 border-none rounded-lg text-base font-semibold;
}

:deep(.p-button:hover:not(:disabled)) {
  @apply bg-blue-600 -translate-y-0.5 shadow-lg;
}

:deep(.p-button:disabled:hover) {
  @apply translate-y-0 shadow-none;
}

:deep(.p-message) {
  @apply mt-0;
}
</style>
