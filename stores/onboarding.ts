import { defineStore } from 'pinia'

type OnboardingStatus = 'idle' | 'checking' | 'incomplete' | 'complete'
type OnboardingStep = 'hotel' | 'rooms' | 'staff' | null

export const useOnboardingStore = defineStore('onboarding', {
    state: () => ({
        status: 'idle' as OnboardingStatus,
        incompleteStep: null as OnboardingStep,
        lastChecked: null as number | null,
    }),

    getters: {
        isChecking: (state) => state.status === 'checking',
        isComplete: (state) => state.status === 'complete',
        needsOnboarding: (state) => state.status === 'incomplete',
    },

    actions: {
        setChecking() {
            this.status = 'checking'
        },

        setIncomplete(step: OnboardingStep) {
            this.status = 'incomplete'
            this.incompleteStep = step
        },

        setComplete() {
            this.status = 'complete'
            this.incompleteStep = null
            this.lastChecked = Date.now()
            if (process.client) {
                localStorage.setItem('onboarding_complete', 'true')
            }
        },

        reset() {
            this.status = 'idle'
            this.incompleteStep = null
        },

        // Check if we can skip the API check (cached completion)
        isCached(): boolean {
            if (process.client) {
                return localStorage.getItem('onboarding_complete') === 'true'
            }
            return false
        },

        clearCache() {
            if (process.client) {
                localStorage.removeItem('onboarding_complete')
            }
            this.reset()
        }
    }
})
