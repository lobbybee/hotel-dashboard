<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
    <div class="flex h-screen overflow-hidden">
      <!-- Mobile Drawer -->
      <Drawer v-model:visible="sidebarVisible" position="left" :pt="{ content: { class: 'p-0' } }" class="w-72 md:hidden">
        <MainSideBar
          :user-role="userRole"
          :navigation="navigation"
          :unread-count="totalUnreadCount"
          @navigate="sidebarVisible = false"
        />
      </Drawer>

      <!-- Desktop Sidebar -->
      <aside class="hidden w-72 flex-shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <MainSideBar :user-role="userRole" :navigation="navigation" :unread-count="totalUnreadCount" />
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
              <p class="text-sm text-gray-500">{{ pageSubtitle }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">


      <div class="relative">
          <Button
                  text
                  rounded
                  aria-label="Notifications"
                  @click="toggleNotifications"
                  class="relative"
                >
                  <template #icon>
                    <Icon name="prime:bell" class="h-5" />
                  </template>

                </Button>
                <Badge
                          v-if="totalNotificationCount > 0"
                          :value="totalNotificationCount"
                          severity="danger"
                          class="absolute -top-2 -right-2 z-10"
                        />
      </div>

            <div class="relative">
              <Button @click="toggleUserMenu" text class="flex items-center gap-2 rounded-full p-1 text-left">
                <!-- Smaller avatar for mobile to fit name -->
                <Avatar :label="userInitials" shape="circle" size="small" class="bg-gradient-to-br from-orange-400 to-blue-400 text-white flex-shrink-0" />

                <!-- Show name on mobile (md and up), full info on xl -->
                <div class="hidden md:block xl:hidden">
                  <p class="truncate text-sm font-medium text-gray-800">
                    {{ userDisplayName }}
                  </p>
                </div>

                <!-- Full info on desktop -->
                <div class="hidden xl:block">
                  <p class="truncate text-sm font-semibold text-gray-800">
                    {{ user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ user?.hotel_name || getRoleLabel(userRole) }}
                  </p>
                </div>

                <!-- Chevron icon on md and up -->
                <Icon name="prime:chevron-down" class="hidden h-3 w-3 text-gray-500 md:block" />
              </Button>
              <Menu ref="userMenu" :model="userMenuItems" :popup="true" class="mt-2 w-60">
                <template #start>
                  <div class="px-4 py-3 border-b border-gray-200">
                    <p class="text-sm font-semibold text-gray-900">
                      {{ user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'User' }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ getRoleLabel(userRole) }}
                    </p>
                  </div>
                </template>
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

              <!-- Notifications Panel -->
              <Menu
                ref="notificationMenu"
                :popup="true"
                :model="[]"
                :appendTo="body"
                :autoZIndex="true"
                class="mt-2 w-96 notification-panel"
              >
                <template #start>
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-semibold text-gray-900">Notifications</h3>
                      <button
                        @click="handleMarkAllAsRead"
                        v-if="unreadCount > 0"
                        class="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <!-- Tabs -->
                    <div class="flex border-b border-gray-200 mb-3">
                      <button
                        @click="activeNotificationTab = 'realtime'"
                        :class="[
                          'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                          activeNotificationTab === 'realtime'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        ]"
                      >
                        Live ({{ notifications.length }})
                      </button>
                      <button
                        @click="activeNotificationTab = 'api'"
                        :class="[
                          'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                          activeNotificationTab === 'api'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        ]"
                      >
                        System ({{ unreadApiNotificationsCount }})
                      </button>
                    </div>

                    <!-- Real-time Notifications Tab -->
                    <div v-show="activeNotificationTab === 'realtime'">
                      <div v-if="notifications.length === 0" class="text-center py-8 text-gray-500">
                        <Icon name="prime:bell" class="text-3xl mb-3 text-gray-400" />
                        <p class="text-sm font-medium">No live notifications</p>
                        <p class="text-xs mt-1">Real-time notifications will appear here</p>
                      </div>

                      <div v-else class="max-h-80 overflow-y-auto">
                        <div
                          v-for="notification in notifications.slice(0, 10)"
                          :key="notification.id"
                          class="mb-2 p-3 rounded-lg border cursor-pointer transition-colors"
                          :class="[
                            notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200',
                            'hover:bg-gray-100'
                          ]"
                          @click="handleNotificationClick(notification)"
                        >
                          <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 mt-1">
                              <Icon
                                :name="getNotificationIcon(notification.type)"
                                :class="getNotificationIconClass(notification.type)"
                                class="h-4 w-4"
                              />
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                              <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                              <p class="text-xs text-gray-500 mt-1">{{ formatNotificationTime(notification.timestamp) }}</p>
                            </div>
                            <button
                              @click="handleRemoveNotification(notification.id, $event)"
                              class="flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                              <Icon name="prime:times" class="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div v-if="notifications.length > 10" class="mt-3 pt-2 border-t border-gray-200 text-center">
                        <button class="text-xs text-blue-600 hover:text-blue-800">View all live notifications</button>
                      </div>
                    </div>

                    <!-- API Notifications Tab -->
                    <div v-show="activeNotificationTab === 'api'">
                      <div v-if="apiNotificationsLoading" class="text-center py-8 text-gray-500">
                        <Icon name="prime:spinner" class="text-3xl mb-3 text-gray-400 animate-spin" />
                        <p class="text-sm font-medium">Loading system notifications...</p>
                      </div>

                      <div v-else-if="!apiNotifications || apiNotifications.length === 0" class="text-center py-8 text-gray-500">
                        <Icon name="prime:inbox" class="text-3xl mb-3 text-gray-400" />
                        <p class="text-sm font-medium">No system notifications</p>
                        <p class="text-xs mt-1">System notifications from database will appear here</p>
                      </div>

                      <div v-else>
                        <!-- Mark all as read button for system notifications -->
                        <div v-if="unreadApiNotificationsCount > 0" class="mb-3 flex justify-end">
                          <button
                            @click="handleMarkAllApiNotificationsRead"
                            class="text-xs text-purple-600 hover:text-purple-800"
                          >
                            Mark all system as read
                          </button>
                        </div>

                        <div class="max-h-80 overflow-y-auto">
                        <div
                          v-for="notification in apiNotifications.slice(0, 10)"
                          :key="notification.id"
                          class="mb-2 p-3 rounded-lg border cursor-pointer transition-colors"
                          :class="[
                            notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-200',
                            'hover:bg-gray-100'
                          ]"
                          @click="handleApiNotificationClick(notification)"
                        >
                          <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 mt-1">
                              <Icon
                                name="prime:inbox"
                                :class="notification.is_read ? 'text-gray-500' : 'text-purple-500'"
                                class="h-4 w-4"
                              />
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900">{{ notification.title || 'System Notification' }}</p>
                              <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                              <div class="flex items-center justify-between mt-2">
                                <p class="text-xs text-gray-500">
                                  {{ notification.created_at ? formatNotificationTime(new Date(notification.created_at)) : 'System notification' }}
                                </p>
                                <a
                                  v-if="notification.link"
                                  :href="notification.link"
                                  @click.stop
                                  class="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  {{ notification.link_label || 'View' }}
                                </a>
                              </div>
                            </div>
                            <div v-if="!notification.is_read" class="flex-shrink-0">
                              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-if="apiNotifications && apiNotifications.length > 10" class="mt-3 pt-2 border-t border-gray-200 text-center">
                        <button class="text-xs text-blue-600 hover:text-blue-800">View all system notifications</button>
                      </div>
                      </div>
                    </div>
                  </div>
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
                    <span v-if="newCheckinNotification">
                      New check-in request from {{ newCheckinNotification.guest_name }}
                    </span>
                    <span v-else>
                      {{ pendingStays?.length || 0 }} pending check-in{{ pendingStays?.length !== 1 ? 's' : '' }} waiting for verification
                    </span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="newCheckinNotification?.link || '/checkin'"
                  class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  @click="clearNotification"
                >
                  <i class="pi pi-eye"></i>
                  {{ newCheckinNotification?.link_label || 'View Check-ins' }}
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

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useChatStore } from '~/stores/chat';
import { useNotificationStore } from '~/stores/notifications';
import { useFetchHotel, useFetchRooms } from '~/composables/useHotel';
import { useFetchStaff } from '~/composables/useStaff';
import { useFetchNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '~/composables/useNotification';
import { useWebSocket, type NewCheckinMessage } from '~/composables/useWebSocket';

const router = useRouter();
const route = useRoute();
const { logout } = useAPI();
const authStore = useAuthStore();
const { user, isAuthenticated, userRole, userInitials, hotelId } = storeToRefs(authStore);
const chatStore = useChatStore();
const { totalUnreadCount } = storeToRefs(chatStore);
const notificationStore = useNotificationStore();
const { notifications, unreadCount } = storeToRefs(notificationStore);

// API notifications
const { notifications: apiNotifications, isLoading: apiNotificationsLoading, refetch: refetchApiNotifications } = useFetchNotifications();
const { markNotificationRead: markApiNotificationRead } = useMarkNotificationRead();
const { markAllNotificationsRead } = useMarkAllNotificationsRead();

// Active notification tab
const activeNotificationTab = ref('realtime');

// Unread API notifications count
const unreadApiNotificationsCount = computed(() => {
  return apiNotifications.value?.filter(n => !n.is_read).length || 0;
});

// Total notification count combining both sources
const totalNotificationCount = computed(() => {
  const realtimeUnread = unreadCount.value || 0;
  const apiUnread = unreadApiNotificationsCount.value;
  return realtimeUnread + apiUnread;
});

// Track if component is mounted to prevent DOM operations when unmounted
const isMounted = ref(false);

onUnmounted(() => {
  isMounted.value = false;
});

const userMenu = ref(null);
const notificationMenu = ref(null);

// Computed property to check if we're on the checkin page
const isCheckinPage = computed(() => route.path === '/checkin');

// WebSocket connection for new check-in notifications
const webSocketManager = useWebSocket();
const hasNewStays = ref(false);
const pendingStays = ref<any[]>([]);
const newCheckinNotification = ref<any>(null);

// Clear notification flag when user acknowledges it
const clearNotification = () => {
  hasNewStays.value = false;
  newCheckinNotification.value = null;
};

// Handle WebSocket messages for new check-ins
const handleWebSocketMessage = (message: any) => {
  if (message.type === 'new_checkin') {
    const checkinMessage = message as NewCheckinMessage;
    hasNewStays.value = true;
    newCheckinNotification.value = checkinMessage.data;

    // Add to notification store with type 'checkin' (not 'new_checkin')
    notificationStore.addNotification({
      id: checkinMessage.data.conversation_id,
      type: 'checkin', // Store expects 'checkin', not 'new_checkin'
      title: 'New Check-in Request',
      message: checkinMessage.data.message || `New check-in request from ${checkinMessage.data.guest_name}`,
      timestamp: new Date(checkinMessage.data.created_at),
      read: false,
      data: checkinMessage.data
    });

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('new-checkin-received', {
      detail: checkinMessage.data
    }));
  }
};

// Set up WebSocket message handler
onMounted(() => {
  isMounted.value = true;

  // Initialize chat store globally to establish WebSocket connection
  chatStore.initChat();

  // Set up WebSocket message listener for new check-ins
  webSocketManager.onMessage(handleWebSocketMessage);
});

const hotel = ref({ name: 'Loading...' });
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

const userMenuItems = computed(() => {
  const items = [];

  // Only show settings for hotel_admin role
  if (userRole.value === 'hotel_admin') {
    items.push({
      label: 'Settings',
      icon: 'prime:cog',
      route: '/settings'
    });
  }

  items.push({
    label: 'Sign out',
    icon: 'prime:sign-out',
    command: () => handleLogout()
  });

  return items;
});

const toggleUserMenu = (event) => {
  try {
    if (!isMounted.value || !userMenu.value?.toggle) return;
    userMenu.value.toggle(event);
  } catch (error) {
    console.warn('Error toggling user menu:', error);
    // Graceful fallback - do nothing if menu component is not available
  }
};

const toggleNotifications = (event) => {
  try {
    if (!isMounted.value || !notificationMenu.value?.toggle) return;
    notificationMenu.value.toggle(event);
  } catch (error) {
    console.warn('Error toggling notification menu:', error);
    // Graceful fallback - do nothing if menu component is not available
  }
};

// Notification panel functions
const getNotificationIcon = (type: string): string => {
  const icons: { [key: string]: string } = {
    chat: 'prime:comment',
    checkin: 'prime:sign-in',
    checkout: 'prime:sign-out',
    service_request: 'prime:cog',
    info: 'prime:info-circle',
    warning: 'prime:exclamation-triangle',
    success: 'prime:check-circle'
  };
  return icons[type] || 'prime:info-circle';
};

const getNotificationIconClass = (type: string): string => {
  const classes: { [key: string]: string } = {
    chat: 'text-blue-500',
    checkin: 'text-green-500',
    checkout: 'text-orange-500',
    service_request: 'text-purple-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    success: 'text-green-500'
  };
  return classes[type] || 'text-gray-500';
};

const formatNotificationTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const handleNotificationClick = (notification: any): void => {
  try {
    if (!isMounted.value) return;

    // Mark notification as read
    notificationStore.markAsRead(notification.id);

    // Handle chat notifications by navigating to chat
    if (notification.type === 'chat' && notification.data?.conversationId) {
      navigateTo('/chat');
    }

    // Close notification panel safely
    if (notificationMenu.value?.hide && typeof notificationMenu.value.hide === 'function') {
      notificationMenu.value.hide();
    }
  } catch (error) {
    console.warn('Error handling notification click:', error);
    // Even if something fails, try to mark as read
    try {
      notificationStore.markAsRead(notification.id);
    } catch (markError) {
      console.warn('Error marking notification as read:', markError);
    }
  }
};

const handleApiNotificationClick = async (notification: any): Promise<void> => {
  try {
    if (!isMounted.value) return;

    // Mark API notification as read if it's unread
    if (!notification.is_read) {
      await markApiNotificationRead({ id: notification.id });
      // Refetch notifications to get updated read status
      await refetchApiNotifications();
    }

    // Navigate to the link if provided
    if (notification.link) {
      navigateTo(notification.link);
    }

    // Close notification panel safely
    if (notificationMenu.value?.hide && typeof notificationMenu.value.hide === 'function') {
      notificationMenu.value.hide();
    }
  } catch (error) {
    console.warn('Error handling API notification click:', error);
  }
};

const handleMarkAllAsRead = (): void => {
  try {
    if (!isMounted.value) return;

    notificationStore.markAllAsRead();
    // Close notification panel safely
    if (notificationMenu.value?.hide && typeof notificationMenu.value.hide === 'function') {
      notificationMenu.value.hide();
    }
  } catch (error) {
    console.warn('Error marking all notifications as read:', error);
  }
};

const handleMarkAllApiNotificationsRead = async (): Promise<void> => {
  try {
    if (!isMounted.value) return;

    await markAllNotificationsRead();
    // Refetch notifications to get updated read status
    await refetchApiNotifications();
  } catch (error) {
    console.warn('Error marking all system notifications as read:', error);
  }
};

const handleRemoveNotification = (notificationId: string, event: Event): void => {
  try {
    if (!isMounted.value) return;

    event?.stopPropagation?.();
    notificationStore.removeNotification(notificationId);
  } catch (error) {
    console.warn('Error removing notification:', error);
  }
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
  // Get hotel name from auth store (which checks localStorage)
  const hotelName = authStore.getHotelName();
  return hotelName || 'Hotel Dashboard';
});

const pageSubtitle = computed(() => {
  const titleMap = {
    '/': 'Dashboard',
    '/checkin': 'Check-in Management',
    '/receptionist/rooms': 'Room Management',
    '/checkout': 'Guest Management',
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

// Create a compact display name for mobile view
const userDisplayName = computed(() => {
  const fullName = user.value?.first_name ? `${user.value.first_name} ${user.value.last_name || ''}` : user.value?.username;
  return fullName && fullName.length > 10 ? fullName.substring(0, 10) + '...' : fullName;
});

const navigation = computed(() => {
  const role = userRole.value;
  console.log('🧭 [NAVIGATION] Computing navigation for role:', role);
  if (role === 'hotel_admin') {
    return [
      { name: 'Dashboard', href: '/', icon: 'prime:chart-line' },
      { name: 'Check-in', href: '/checkin', icon: 'prime:sign-in' },
      { name: 'Guest Management', href: '/checkout', icon: 'prime:sign-out' },
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
      { name: 'Guest Management', href: '/checkout', icon: 'prime:sign-out' },
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
      { name: 'Guest Management', href: '/checkout', icon: 'prime:sign-out' },
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
