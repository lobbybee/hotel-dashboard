import { useOnboardingStore } from '~/stores/onboarding'
import { useAPI } from '~/composables/useAPI'

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

    // Fetch hotel, rooms, and staff data
    const [hotelRes, roomsRes, staffRes] = await Promise.all([
      API(`/hotels/${hotelId}/`),
      API(`/rooms/`, { params: { page_size: 1 } }),
      API(`/users/`)
    ])

    // Check hotel profile completeness
    const hotel = hotelRes as any
    const requiredFields = ['address', 'city', 'state', 'country', 'pincode', 'phone', 'email']
    const missingFields = requiredFields.filter(field => !hotel[field] || hotel[field]?.trim() === '')

    if (missingFields.length > 0) {
      onboardingStore.setIncomplete('hotel')
      return navigateTo('/onboard/hotel')
    }

    // Check if hotel has rooms
    const rooms = roomsRes as any
    if (!rooms.results || rooms.results.length === 0) {
      onboardingStore.setIncomplete('rooms')
      return navigateTo('/onboard/rooms')
    }

    // Check if hotel has staff (more than just the admin)
    const staff = staffRes as any
    // API returns array directly for users based on useStaff.ts
    // Wait, let me double check useStaff.ts. 
    // useStaff.ts says: return response.results; // API returns array directly
    // But useFetchStaff calls API('/users/') and returns response.results.
    // So the API response itself likely has a .results property or is paginated.
    // Let's re-read useStaff.ts carefully.
    // Line 35: const response = await API('/users/');
    // Line 36: return response.results; 
    // So distinct from rooms which is also paginated.

    // In the middleware, I am calling API('/users/'). The result `staffRes` will be the full response object.
    // So safely accessing .results is key.

    const staffList = staffRes.results || staffRes
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