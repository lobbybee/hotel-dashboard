<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Hotel Dashboard Login</h2>
        <p>Welcome back! Please enter your credentials</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label for="username">Username</label>
          <InputText
            id="username"
            v-model="username"
            placeholder="Enter your username"
            :invalid="!!error"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Enter your password"
            :invalid="!!error"
            :feedback="false"
            :toggleMask="true"
            class="w-full"
          />
        </div>

        <Message v-if="error" severity="error" :closable="false" class="w-full">
          {{ error }}
        </Message>

        <Button
          type="submit"
          label="Sign In"
          :loading="loading"
          icon="pi pi-lock"
          class="w-full mt-4"
        />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { login } = useAPI()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const response = await login({
      username: username.value,
      password: password.value
    })

    const userRole = response.user?.user_type
    if (userRole === 'manager' || userRole === 'hotel_admin') {
      router.push('/manager')
    } else if (userRole === 'receptionist') {
      router.push('/receptionist')
    } else {
      router.push('/') // Fallback
    }
  } catch (err) {
    // Handle APIError specifically
    if (err instanceof APIError && err.data && err.data.detail) {
      error.value = err.data.detail
    } else {
      error.value = err.message || 'Invalid username or password'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--p-surface-100);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: var(--p-surface-0);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--p-surface-900);
}

.login-header p {
  color: var(--p-surface-600);
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

:deep(.p-message) {
  margin-top: 0.5rem;
}

:deep(.p-password) {
  width: 100%;
}
</style>