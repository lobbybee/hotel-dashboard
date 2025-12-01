<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
    <div class="flex h-screen overflow-hidden">
      <!-- Mobile Drawer -->
      <Drawer v-model:visible="sidebarVisible" position="left" :pt="{ content: { class: 'p-0' } }" class="w-72 md:hidden">
        <MainSideBar
          :user-role="userRole"
          :navigation="navigation"
          @navigate="sidebarVisible = false"
        />
      </Drawer>

      <!-- Desktop Sidebar -->
      <aside class="hidden w-72 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <MainSideBar :user-role="userRole" :navigation="navigation" />
      </aside>

      <!-- Main Content -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- Main Header -->
        <header class="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6">
          <div class="flex items-center gap-3">
            <Button
              @click="sidebarVisible = true"
              rounded
              text
              class="md:hidden"
              aria-label="Toggle sidebar"
            >
              <template #icon>
                <Icon name="prime:bars" class="h-5 w-5" />
              </template>
            </Button>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">


            <Button text rounded aria-label="Notifications">
              <template #icon>
                <Icon name="prime:bell" class="h-5 w-5" />
              </template>
              <Badge v-if="totalUnreadMessages > 0" :value="totalUnreadMessages" severity="danger" />
            </Button>

            <div class="relative">
              <Button @click="toggleUserMenu" text class="flex items-center gap-2 rounded-full p-1 text-left">
                <Avatar :label="userInitials" shape="circle" class="bg-gradient-to-br from-orange-400 to-blue-400 text-white" />
                <div class="hidden xl:block">
                  <p class="truncate text-sm font-semibold text-gray-800">
                    {{ user?.first_name }} {{ user?.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ getRoleLabel(userRole) }}
                  </p>
                </div>
                <Icon name="prime:chevron-down" class="hidden h-3 w-3 text-gray-500 xl:block" />
              </Button>
              <Menu ref="userMenu" :model="userMenuItems" :popup="true" class="mt-2 w-60">
                <template #item="{ item, props }">
                  <div v-if="item.separator" class="my-1 border-t border-gray-200" />
                  <NuxtLink v-else-if="item.route" :to="item.route" class="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-100" v-bind="props.action">
                    <Icon :name="item.icon" class="mr-2 h-5 w-5" />
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                  <a v-else @click="item.command" class="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-100" v-bind="props.action">
                    <Icon :name="item.icon" class="mr-2 h-5 w-5" />
                    <span>{{ item.label }}</span>
                  </a>
                </template>
              </Menu>
            </div>
          </div>
        </header>

        <!-- New Check-in Notification Alert -->
        <div v-if="hasNewStays && !isCheckinPage" class="mx-4 sm:mx-6 mb-4">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0">
                  <i class="pi pi-user-plus text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-blue-900">New Check-in Request</h3>
                  <p class="text-sm text-blue-700">
                    {{ pendingStays?.length || 0 }} pending check-in{{ pendingStays?.length !== 1 ? 's' : '' }} waiting for verification
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <NuxtLink
                  to="/checkin"
                  class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  @click="clearNotification"
                >
                  <i class="pi pi-eye"></i>
                  View Check-ins
                </NuxtLink>
                <button
                  @click="clearNotification"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <i class="pi pi-times text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <div class="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg h-full overflow-y-auto">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { usePendingStaysNotifications } from '~/composables/usePendingStaysNotifications';
import { useFetchHotel, useFetchRooms } from '~/composables/useHotel';
import { useFetchStaff } from '~/composables/useStaff';

const router = useRouter();
const route = useRoute();
const { logout } = useAPI();
const authStore = useAuthStore();
const { user, isAuthenticated, userRole, userInitials, hotelId } = storeToRefs(authStore);

const userMenu = ref(null);

// Computed property to check if we're on the checkin page
const isCheckinPage = computed(() => route.path === '/checkin');

// Initialize pending stays notifications
const { hasNewStays, pendingStays, clearNotification } = usePendingStaysNotifications();

const hotel = ref({ name: 'Loading...' });
const totalUnreadMessages = ref(0); // Mocked for now
const sidebarVisible = ref(false);

// Fetch hotel data will be triggered automatically by useQuery
// when user.value.hotel_id becomes available.
const { data: HotelData } = useFetchHotel(hotelId);
const { data: RoomsData } = useFetchRooms({ page_size: 1 });
const { staff: StaffData } = useFetchStaff();

watch(HotelData, (newHotel) => {
  if (newHotel) {
    hotel.value = newHotel;
  }
});

// Onboarding Check Function
const checkOnboardingStatus = async () => {
  console.log('🚀 [ONBOARDING] Starting onboarding status check');
  console.log('📍 [ONBOARDING] Current route:', route.path);
  console.log('👤 [ONBOARDING] User role:', userRole.value);
  console.log('🏨 [ONBOARDING] Hotel ID:', hotelId.value);

  // Skip onboarding check if already on onboarding pages
  if (route.path.startsWith('/onboard/')) {
    console.log('⏭️ [ONBOARDING] Skipping - already on onboarding pages');
    return;
  }

  // Only run onboarding for hotel_admin role
  if (userRole.value !== 'hotel_admin') {
    console.log('⏭️ [ONBOARDING] Skipping - user role not eligible for onboarding:', userRole.value);
    return;
  }

  console.log('✅ [ONBOARDING] User eligible for onboarding check');

  try {
    // Check hotel profile completeness
    console.log('🏨 [ONBOARDING] Checking hotel profile completeness...');
    console.log('📋 [ONBOARDING] Hotel profile data:', HotelData.value);

    if (HotelData.value) {
      const hotel = HotelData.value;

      const requiredFields = ['address', 'city', 'state', 'country', 'pincode', 'phone', 'email'];
      const missingFields = requiredFields.filter(field => !hotel[field] || hotel[field]?.trim() === '');

      console.log('🔍 [ONBOARDING] Required fields check:');
      console.log('  - Missing fields:', missingFields);
      console.log('  - Field values:', {
        address: hotel.address,
        city: hotel.city,
        state: hotel.state,
        country: hotel.country,
        pincode: hotel.pincode,
        phone: hotel.phone,
        email: hotel.email
      });

      if (missingFields.length > 0) {
        console.log('❌ [ONBOARDING] Hotel profile incomplete - redirecting to /onboard/hotel');
        console.log('📝 [ONBOARDING] Missing fields count:', missingFields.length);
        await navigateTo('/onboard/hotel');
        return;
      }

      console.log('✅ [ONBOARDING] Hotel profile complete');
    } else {
      console.log('⚠️ [ONBOARDING] No hotel profile data found - redirecting to /onboard/hotel');
      await navigateTo('/onboard/hotel');
      return;
    }

    // Check if hotel has at least 1 room
    console.log('🏠 [ONBOARDING] Checking hotel rooms...');
    console.log('📊 [ONBOARDING] Rooms data:', RoomsData.value);

    if (RoomsData.value && RoomsData.value.results && RoomsData.value.results.length === 0) {
      console.log('❌ [ONBOARDING] No rooms found - redirecting to /onboard/rooms');
      console.log('📊 [ONBOARDING] Rooms count:', RoomsData.value.results.length);
      await navigateTo('/onboard/rooms');
      return;
    }

    console.log('✅ [ONBOARDING] Hotel has rooms');

    // Check if hotel has staff members (excluding the current user)
    console.log('👥 [ONBOARDING] Checking hotel staff...');
    console.log('👥 [ONBOARDING] Staff data:', StaffData.value);
    console.log('🔢 [ONBOARDING] Staff count:', StaffData.value?.length || 0);

    if (StaffData.value && StaffData.value.length <= 1) {
      console.log('❌ [ONBOARDING] Insufficient staff - redirecting to /onboard/staffs');
      console.log('👤 [ONBOARDING] Current staff count:', StaffData.value.length);
      await navigateTo('/onboard/staffs');
      return;
    }

    console.log('✅ [ONBOARDING] Hotel has sufficient staff');
    console.log('🎉 [ONBOARDING] Onboarding check passed - user can continue');

  } catch (error) {
    console.error('💥 [ONBOARDING] Error checking onboarding status:', error);
    console.error('💥 [ONBOARDING] Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};

// Redirect to login if not authenticated
watch(isAuthenticated, (isAuth) => {
  console.log('🔐 [AUTH WATCHER] Authentication state changed:', {
    isAuth,
    isClient: process.client,
    currentRoute: route.path
  });

  if (process.client && !isAuth) {
    console.log('🚪 [AUTH WATCHER] Not authenticated - redirecting to login');
    navigateTo('/login');
  } else {
    console.log('✅ [AUTH WATCHER] User authenticated - can continue');
  }
}, { immediate: true });

// Run onboarding check when user, hotel, rooms, and staff data are available
watch([isAuthenticated, user, hotelId, HotelData, RoomsData, StaffData], async ([isAuth, currentUser, currentHotelId, hotelData, roomsData, staffData]) => {
  console.log('👀 [ONBOARDING WATCHER] Triggered with:', {
    isAuth,
    currentUser: currentUser ? { id: currentUser.id, role: currentUser.role, hotel_id: currentUser.hotel_id } : null,
    currentHotelId,
    hotelDataAvailable: !!hotelData,
    roomsDataAvailable: !!roomsData,
    staffDataAvailable: !!staffData,
    isClient: process.client
  });

  if (process.client && isAuth && currentUser && currentHotelId && hotelData && roomsData && staffData) {
    console.log('⏰ [ONBOARDING WATCHER] All data available - scheduling onboarding check in 1 second...');
    // Small delay to ensure all data is loaded
    await nextTick();
    setTimeout(() => {
      console.log('🚀 [ONBOARDING WATCHER] Executing scheduled onboarding check');
      checkOnboardingStatus();
    }, 1000);
  } else {
    console.log('⏭️ [ONBOARDING WATCHER] Conditions not met - skipping onboarding check');
    console.log('🔍 [ONBOARDING WATCHER] Missing:', {
      isAuth,
      currentUser: !!currentUser,
      currentHotelId: !!currentHotelId,
      hotelData: !!hotelData,
      roomsData: !!roomsData,
      staffData: !!staffData
    });
  }
}, { immediate: true });

const userMenuItems = ref([
  {
    label: 'Settings',
    icon: 'prime:cog',
    route: '/settings'
  },
  {
    separator: true
  },
  {
    label: 'Sign out',
    icon: 'prime:sign-out',
    command: () => handleLogout()
  }
]);

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
};

const handleLogout = async () => {
  try {
    await logout();
    // Use window.location.replace to bypass middleware completely
    window.location.replace('/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // Use window.location.replace even if logout API fails
    window.location.replace('/login');
  }
};

const pageTitle = computed(() => {
  const titleMap = {
    '/': 'Dashboard',
    '/checkin': 'Check-in Management',
    '/receptionist/rooms': 'Room Management',
    '/checkout': 'Check-out Management',
    '/receptionist/whatsapp': 'WhatsApp Messages',
    '/receptionist/service-requests': 'Service Requests',
    '/manager/hotel-profile': 'Hotel Profile',
    '/manager/staff': 'Staff Management',
    '/manager/rooms': 'Room Management',
    '/manager/templates': 'Message Templates',
    '/manager/analytics': 'Analytics & Reports',
    '/manager/menu-builder': 'Menu Builder',
    '/hotel-profile': 'Hotel Profile',
    '/paymentQR': 'Payment QR Codes',
    '/reports': 'Reports',
  };
  return titleMap[route.path] || 'Dashboard';
});

// Add component mount log
onMounted(() => {
  console.log('🏗️ [COMPONENT] Default layout mounted');
  console.log('👤 [COMPONENT] Current user:', user.value);
  console.log('🎭 [COMPONENT] User role:', userRole.value);
  console.log('🏨 [COMPONENT] Hotel ID:', hotelId.value);
  console.log('📍 [COMPONENT] Current route:', route.path);
});

const getRoleLabel = (role) => {
  const roleLabels = {
    'hotel_admin': 'Hotel Admin',
    'manager': 'Manager',
    'receptionist': 'Receptionist',
    'department_staff': 'Department Staff',
    'other_staff': 'Other Staff'
  };
  return roleLabels[role] || role;
};

const navigation = computed(() => {
  const role = userRole.value;
  console.log('🧭 [NAVIGATION] Computing navigation for role:', role);
  if (role === 'hotel_admin') {
    return [
      { name: 'Dashboard', href: '/', icon: 'prime:chart-line' },
      { name: 'Check-in', href: '/checkin', icon: 'prime:sign-in' },
      { name: 'Check-out', href: '/checkout', icon: 'prime:sign-out' },
      { name: 'Hotel Profile', href: '/hotel-profile', icon: 'prime:building' },
      { name: 'Staff Management', href: '/staff', icon: 'prime:users' },
      { name: 'Room Management', href: '/rooms', icon: 'prime:home' },
      // { name: 'Departments', href: '/departments', icon: 'prime:briefcase' },
      { name: 'Message Templates', href: '/message_templates', icon: 'prime:comment' },
      { name: 'Payment QR Codes', href: '/paymentQR', icon: 'prime:qrcode' },
      { name: 'Billing', href: '/payments', icon: 'prime:credit-card' },
      { name: 'Reports', href: '/reports', icon: 'prime:file-pdf' },
      // { name: 'Chat', href: '/chat', icon: 'prime:comments' }
    ];
  } else if (role === 'manager') {
    return [
      { name: 'Dashboard', href: '/', icon: 'prime:chart-line' },
      { name: 'Check-in', href: '/checkin', icon: 'prime:sign-in' },
      { name: 'Check-out', href: '/checkout', icon: 'prime:sign-out' },
      { name: 'Staff Management', href: '/staff', icon: 'prime:users' },
      { name: 'Room Management', href: '/rooms', icon: 'prime:home' },
      // { name: 'Departments', href: '/departments', icon: 'prime:briefcase' },
      { name: 'Payment QR Codes', href: '/paymentQR', icon: 'prime:qrcode' },
      { name: 'Reports', href: '/reports', icon: 'prime:file-pdf' },
      { name: 'Chat', href: '/chat', icon: 'prime:comments' }
    ];
  } else if (role === 'receptionist') {
    return [
      { name: 'Dashboard', href: '/', icon: 'prime:chart-line' },
      { name: 'Check-in', href: '/checkin', icon: 'prime:sign-in' },
      { name: 'Room Management', href: '/rooms', icon: 'prime:home' },
      { name: 'Payment QR Codes', href: '/paymentQR', icon: 'prime:qrcode' },
      { name: 'Check-out', href: '/checkout', icon: 'prime:sign-out' },
      { name: 'Reports', href: '/reports', icon: 'prime:file-pdf' },
      { name: 'Chat', href: '/chat', icon: 'prime:comments' },
    ];
  }else if (role ==='department_staff'){
    return [
      { name: 'Chat', href: '/chat', icon: 'prime:comments' },
      { name: 'Reports', href: '/reports', icon: 'prime:file-pdf' }
    ];
  }
  return [];
});
</script>
