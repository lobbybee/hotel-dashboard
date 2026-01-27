import { useOnboardingStore } from '~/stores/onboarding'
import { useAPI } from '~/composables/useAPI'
import { useAPIHelper } from '~/composables/useAPIHelper'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const onboardingStore = useOnboardingStore()

  // Only run middleware on client side
  if (!process.client) return

  // Skip middleware for login route
  if (to.path === '/login') return

  // Skip if coming from login to prevent loops
  if (from.path === '/login' && to.path === '/login') return

  // Initialize auth if not already done
  if (!authStore.user) {
    authStore.initializeAuth()
  }

  // Check authentication
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  const userRole = authStore.userRole

  // Department staff: restrict to /chat only
  if (userRole === 'department_staff') {
    if (to.path.startsWith('/chat')) return
    return navigateTo('/chat')
  }

  // Manager: restrict certain routes
  if (userRole === 'manager') {
    const restrictedRoutes = ['/hotel-profile', '/message_templates', '/payments']
    if (restrictedRoutes.some(route => to.path.startsWith(route))) {
      return navigateTo('/')
    }
  }

  // Skip onboarding check for onboarding pages
  if (to.path.startsWith('/onboard/')) return

  // Only check onboarding for hotel_admin
  if (userRole !== 'hotel_admin') return

  // Check if onboarding is cached as complete
  if (onboardingStore.isCached()) {
    onboardingStore.setComplete()
    return
  }

  // Set checking status (this triggers loading UI)
  onboardingStore.setChecking()

  try {
    const hotelId = authStore.hotelId
    if (!hotelId) {
      onboardingStore.setIncomplete('hotel')
      return navigateTo('/onboard/hotel')
    }

    const { API } = useAPI()
    const { getData } = useAPIHelper()

    // Fetch hotel, rooms, and staff data
    const [hotelRes, roomsRes, staffRes] = await Promise.all([
      API(`/hotels/${hotelId}/`),
      API(`/rooms/`, { params: { page_size: 1 } }),
      API(`/users/`)
    ])

    // Check hotel profile completeness
    const hotel = getData<any>(hotelRes)
    const requiredFields = ['address', 'city', 'state', 'country', 'pincode', 'phone', 'email']
    const missingFields = requiredFields.filter(field => !hotel[field] || hotel[field]?.trim() === '')

    if (missingFields.length > 0) {
      onboardingStore.setIncomplete('hotel')
      return navigateTo('/onboard/hotel')
    }

    // Check if hotel has rooms
    const rooms = getData<any>(roomsRes)

    // Check if we have results in the data object (paginated response)
    const roomList = rooms.results || rooms

    if (!roomList || roomList.length === 0) {
      onboardingStore.setIncomplete('rooms')
      return navigateTo('/onboard/rooms')
    }

    // Check if hotel has staff (more than just the admin)
    const staffResponse = getData<any>(staffRes)
    const staffList = staffResponse.results || staffResponse

    // We check for > 0 because sometimes the admin themself might not be in the list depending on filtering,
    // or if the list includes the current admin, we might want to ensure there is at least one person.
    // However, the original logic was <= 1, potentially assuming the admin is always returned.
    // Let's stick to the original logic's intent but fixed data access.

    if (!staffList || staffList.length <= 1) {
      onboardingStore.setIncomplete('staff')
      return navigateTo('/onboard/staffs')
    }

    // All checks passed - mark as complete
    onboardingStore.setComplete()

  } catch (error) {
    console.error('[ONBOARDING] Error checking status:', error)
    // On error, allow access but don't cache
    onboardingStore.reset()
  }
})