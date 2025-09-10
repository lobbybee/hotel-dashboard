<template>
  <div class="reset-container">
    <div class="reset-card">
      <!-- Step 1: Request Reset -->
      <div v-if="step === 'request'">
        <div class="reset-header">
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset code.</p>
        </div>

        <form @submit.prevent="handleRequestReset" class="reset-form">
          <div class="field">
            <label for="email">Email</label>
            <InputText
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
              :invalid="!!error"
              class="w-full"
              required
            />
          </div>

          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Message v-if="message" severity="info" :closable="false">{{ message }}</Message>


          <Button
            type="submit"
            label="Send Reset Code"
            :loading="loading"
            icon="pi pi-envelope"
            class="w-full mt-2"
          />
        </form>
      </div>

      <!-- Step 2: Confirm Reset -->
      <div v-if="step === 'confirm'">
        <div class="reset-header">
          <h2>Confirm Reset</h2>
          <p>Enter the code from your email and a new password.</p>
        </div>

        <form @submit.prevent="handleConfirmReset" class="reset-form">
          <div class="field">
            <label for="confirm-email">Email</label>
            <InputText
              id="confirm-email"
              v-model="email"
              class="w-full"
              readonly
            />
          </div>

          <div class="field">
            <label for="otp">Reset Code (OTP)</label>
            <InputText
              id="otp"
              v-model="otp"
              placeholder="Enter 6-digit code"
              :invalid="!!error"
              class="w-full"
              required
            />
          </div>

          <div class="field">
            <label for="new_password">New Password</label>
            <Password
              id="new_password"
              v-model="new_password"
              placeholder="Enter new password"
              :invalid="!!error"
              :feedback="true"
              :toggleMask="true"
              class="w-full"
              required
            />
          </div>

          <Message v-if="message" severity="success" :closable="false">{{ message }}</Message>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

          <Button
            type="submit"
            label="Set New Password"
            :loading="loading"
            icon="pi pi-check"
            class="w-full mt-2"
          />
        </form>
      </div>

      <div class="text-center mt-4">
        <NuxtLink to="/login" class="back-to-login">
          &larr; Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAPI, APIError } from '~/composables/useAPI';

definePageMeta({
  layout: 'auth'
});

const { requestPasswordReset, confirmPasswordReset } = useAPI();
const router = useRouter();

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
  try {
    const response = await requestPasswordReset({ email: email.value });
    message.value = response.message || "If an account with that email exists, a password reset OTP has been sent.";
    step.value = 'confirm';
  } catch (err) {
    if (err instanceof APIError && err.data) {
        error.value = Object.values(err.data).flat().join(' ') || 'An error occurred.';
    } else {
        error.value = err.message || 'An error occurred.';
    }
  } finally {
    loading.value = false;
  }
}

async function handleConfirmReset() {
  loading.value = true;
  error.value = '';
  message.value = '';
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
    if (err instanceof APIError && err.data) {
        // A more robust way to display multiple errors
        const errorMessages = Object.entries(err.data).map(([key, value]) => {
            if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${value}`;
        });
        error.value = errorMessages.join('; ');
    } else {
        error.value = err.message || 'An error occurred.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--p-surface-100);
}

.reset-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: var(--p-surface-0);
}

.reset-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--p-surface-900);
}

.reset-header p {
  color: var(--p-surface-600);
  font-size: 0.875rem;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
  color: var(--p-surface-800);
}

.back-to-login {
  color: var(--p-primary-color);
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 500;
}

.back-to-login:hover {
  text-decoration: underline;
}

:deep(.p-message) {
  margin: 0;
}

:deep(.p-password) {
  width: 100%;
}
</style>