export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Only run middleware on client side after auth is initialized
  if (!process.client) return;

  // Skip middleware for login route to prevent infinite loops
  if (to.path === '/login') {
    return;
  }

  // Skip middleware if coming from login to prevent redirect loops
  if (from.path === '/login' && to.path === '/login') {
    return;
  }

  // Initialize auth if not already done
  if (!authStore.user) {
    authStore.initializeAuth();
  }

  // Check authentication after initialization
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  const userRole = authStore.userRole;

  // If user is department_staff, restrict access to /chat only
  if (userRole === 'department_staff') {
    // Allow access to /chat route and its sub-routes
    if (to.path.startsWith('/chat')) {
      return;
    }
    // Redirect department_staff users to /chat if they try to access other routes
    return navigateTo('/chat');
  }

  // If user is manager, restrict access to billing, hotel profile, and message templates
  if (userRole === 'manager') {
    // Define restricted routes for managers
    const restrictedRoutes = ['/hotel-profile', '/message_templates', '/payments'];
    
    // Check if the requested path is restricted
    if (restrictedRoutes.some(route => to.path.startsWith(route))) {
      // Redirect managers to dashboard if they try to access restricted routes
      return navigateTo('/');
    }
  }

  // hotel_admin has full access to all routes, no restrictions needed

  // For other roles, allow normal access
  return;
});