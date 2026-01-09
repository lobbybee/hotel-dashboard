<template>
  <!-- Loading State -->
  <div v-if="isLoading" :class="loadingContainerClass">
    <div class="text-center">
      <div :class="loadingIconClass">
        <i :class="`pi ${icon} text-white text-3xl`"></i>
      </div>
      <div class="animate-pulse">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ loadingTitle }}</h2>
        <p class="text-gray-600">{{ loadingSubtitle }}</p>
      </div>
      <div class="mt-6">
        <div :class="spinnerClass"></div>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="apiError" :class="mainContainerClass">
    <div class="flex-1 flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i class="pi pi-exclamation-triangle text-white text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p class="text-gray-600 mb-6">We couldn't load the data. Please check your connection and try again.</p>
        <button
          @click="$emit('retry')"
          class="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center mx-auto"
        >
          <i class="pi pi-refresh mr-2"></i>
          Try Again
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else :class="mainContainerClass">
    <!-- Header -->
    <div class="w-full px-4 py-6 flex justify-between items-center shrink-0">
      <div class="flex items-center space-x-3">
        <div :class="headerIconClass">
          <i :class="`pi ${icon} text-white text-lg`"></i>
        </div>
        <h1 class="text-xl font-bold text-gray-900 hidden sm:block">{{ title }}</h1>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Step</span>
        <span :class="stepIndicatorClass">{{ currentStep + 1 }}/{{ steps.length }}</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full px-4 mb-6 shrink-0">
      <div class="relative">
        <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div :class="progressBarClass" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        <div class="flex justify-between mt-3">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex flex-col items-center"
            :class="{ 'opacity-100': index <= currentStep, 'opacity-50': index > currentStep }"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
              :class="getStepDotClass(index)"
            >
              <i v-if="index < currentStep" class="pi pi-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="text-xs text-gray-600 mt-1 hidden sm:block">{{ step.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="flex-1 min-h-0 overflow-y-auto px-4">
      <div class="max-w-md mx-auto">
        <div class="relative overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${currentStep * 100}%)` }"
          >
            <div v-for="(_, index) in steps" :key="index" class="w-full flex-shrink-0 px-2">
              <slot :name="`slide-${index}`"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Navigation Footer -->
    <div v-if="showNavigation" class="shrink-0 border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4">
      <div class="max-w-md mx-auto">
        <slot name="nav-buttons">
          <div :class="showBackButton ? 'flex justify-between items-center' : 'flex justify-center'">
            <button
              v-if="showBackButton"
              @click="$emit('prev')"
              class="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center"
            >
              <i class="pi pi-arrow-left mr-2"></i>
              Back
            </button>
            <button
              @click="$emit('next')"
              :disabled="isSaving || continueDisabled"
              :class="[continueButtonClass, { 'opacity-50 cursor-not-allowed': continueDisabled }]"
            >
              <i v-if="isSaving" class="pi pi-spinner pi-spin mr-2"></i>
              <span>{{ continueButtonText }}</span>
              <i v-if="!isSaving" class="pi pi-arrow-right ml-2"></i>
            </button>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface Step {
  title: string
  icon?: string
}

export type ColorScheme = 'blue' | 'purple' | 'amber'

interface Props {
  title: string
  icon: string
  colorScheme?: ColorScheme
  steps: Step[]
  currentStep: number
  isLoading?: boolean
  loadingTitle?: string
  loadingSubtitle?: string
  isSaving?: boolean
  showNavigation?: boolean
  showBackButton?: boolean
  continueButtonText?: string
  continueDisabled?: boolean
  apiError?: Error | null
}

const props = withDefaults(defineProps<Props>(), {
  colorScheme: 'blue',
  isLoading: false,
  loadingTitle: 'Loading...',
  loadingSubtitle: 'Please wait...',
  isSaving: false,
  showNavigation: true,
  showBackButton: false,
  continueButtonText: 'Continue',
  continueDisabled: false,
  apiError: null,
})

defineEmits<{
  prev: []
  next: []
  retry: []
}>()

const progressPercentage = computed(() => {
  return ((props.currentStep + 1) / props.steps.length) * 100
})

// Color scheme classes
const colorClasses = {
  blue: {
    gradient: 'from-blue-600 to-indigo-600',
    bg: 'from-blue-50 via-white to-indigo-50',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
    border: 'border-blue-200',
    spinner: 'border-blue-200 border-t-blue-600',
  },
  purple: {
    gradient: 'from-purple-600 to-indigo-600',
    bg: 'from-purple-50 via-white to-indigo-50',
    text: 'text-purple-600',
    ring: 'ring-purple-100',
    border: 'border-purple-200',
    spinner: 'border-purple-200 border-t-purple-600',
  },
  amber: {
    gradient: 'from-amber-600 to-orange-600',
    bg: 'from-amber-50 via-white to-orange-50',
    text: 'text-amber-600',
    ring: 'ring-amber-100',
    border: 'border-amber-200',
    spinner: 'border-amber-200 border-t-amber-600',
  },
}

const colors = computed(() => colorClasses[props.colorScheme])

const loadingContainerClass = computed(() => [
  'h-screen bg-gradient-to-br flex items-center justify-center',
  colors.value.bg,
])

const loadingIconClass = computed(() => [
  'w-20 h-20 bg-gradient-to-r rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse',
  colors.value.gradient,
])

const spinnerClass = computed(() => [
  'w-12 h-12 border-4 rounded-full animate-spin mx-auto',
  colors.value.spinner,
])

const mainContainerClass = computed(() => [
  'h-screen flex flex-col bg-gradient-to-br overflow-hidden',
  colors.value.bg,
])

const headerIconClass = computed(() => [
  'w-10 h-10 bg-gradient-to-r rounded-xl flex items-center justify-center',
  colors.value.gradient,
])

const stepIndicatorClass = computed(() => [
  'text-sm font-semibold',
  colors.value.text,
])

const progressBarClass = computed(() => [
  'h-full bg-gradient-to-r rounded-full transition-all duration-500 ease-out',
  colors.value.gradient,
])

const getStepDotClass = (index: number) => {
  if (index < props.currentStep) {
    return [`bg-gradient-to-r text-white`, colors.value.gradient]
  }
  if (index === props.currentStep) {
    return [`bg-gradient-to-r text-white ring-4`, colors.value.gradient, colors.value.ring]
  }
  return 'bg-gray-200 text-gray-500'
}

const continueButtonClass = computed(() => [
  'bg-gradient-to-r text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center',
  colors.value.gradient,
])
</script>

<style scoped>
/* Smooth scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Focus states */
input:focus,
textarea:focus,
select:focus {
  outline: none;
}

/* Button animations */
button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
