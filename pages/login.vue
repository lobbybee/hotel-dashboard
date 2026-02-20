<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">

      <!-- Left side - Login Form -->
      <div class="flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <div class="mb-10">
             <img src="/logo.png" alt="LobbyBee" class="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-lg md:hidden" />
            <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-2 font-sans">Welcome Back !</h1>
            <p class="text-gray-600 text-base">Login to your lobbybee account</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <InputText
                id="username"
                v-model="username"
                placeholder="Username"
                :invalid="!!error"
                class="w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            <div>
              <Password
                id="password"
                v-model="password"
                placeholder="Password"
                :invalid="!!error"
                :feedback="false"
                :toggleMask="true"
                class="w-full"
                input-class="w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 pr-12 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            <div class="text-right -mt-2">
              <NuxtLink to="/reset" class="text-sm text-gray-600 hover:text-blue-500 hover:underline transition-colors duration-200">
                Forgot Password?
              </NuxtLink>
            </div>

            <Message v-if="error" severity="error" :closable="false" class="w-full">
              {{ error }}
            </Message>

            <Button
              type="submit"
              label="Sign In"
              :loading="loading"
              class="w-full h-12 bg-blue-500 hover:bg-blue-600 border-none rounded-lg text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0 disabled:hover:shadow-none"
            />
          </form>
        </div>
      </div>

      <!-- Right side - Branding -->
      <div class=" hidden md:flex bg-gradient-to-br from-yellow-50 to-orange-100 flex flex-col items-center justify-center p-6 lg:p-12 text-center order-first lg:order-last">
        <div class="mb-8">
          <img src="/logo.png" alt="LobbyBee" class="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-lg" />
        </div>
        <div class="max-w-md">
          <h2 class="text-xl lg:text-2xl font-semibold text-gray-800 leading-relaxed font-sans">
            "Turn chats into check-ins – Smart WhatsApp automation for hotels."
          </h2>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup lang="ts">
import { useAPI, APIError, ForbiddenUserError } from '~/composables/useAPI';
import { useAPIHelper } from '~/composables/useAPIHelper';
import { LoginSchema } from '~/utils/schemas/auth';

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { login } = useAPI()
const { getData, getErrorMessage } = useAPIHelper()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  // Zod Validation
  const validationResult = LoginSchema.safeParse({
    username: username.value,
    password: password.value
  });

  if (!validationResult.success) {
    // Explicitly handle Zod error
    const zodError = validationResult.error;
    if (zodError) {
      error.value = zodError.issues[0].message;
    }
    loading.value = false;
    return;
  }




  try {
    const response = await login({
      username: username.value,
      password: password.value
    })
    
    // Response data type should ideally be inferred or imported
    const data = getData<{ user: { user_type: string } }>(response)
    const userRole = data.user?.user_type

    if (userRole === 'manager' || userRole === 'hotel_admin') {
      router.push('/manager')
    } else if (userRole === 'receptionist') {
      router.push('/receptionist')
    } else if (userRole === 'department_staff') {
      router.push('/chat')
    } else {
      router.push('/') // Fallback
    }
  } catch (err) {
    if (err instanceof ForbiddenUserError) {
      error.value = err.message
    } else if (err instanceof APIError) {
       error.value = getErrorMessage(err)
    } else {
      error.value = (err as Error).message || 'Invalid username or password'
    }
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
/* Custom styles for PrimeVue components that need CSS overrides */
:deep(.p-inputtext) {
  @apply w-full h-12 text-base border-2 border-gray-200 rounded-lg px-4 transition-all duration-200;
}

:deep(.p-inputtext:focus) {
  @apply border-blue-500 ring-2 ring-blue-100 outline-none;
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
