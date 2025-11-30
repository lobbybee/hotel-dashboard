import { ref, watch, onUnmounted, computed } from 'vue';
import { useListPendingStays } from './checkin-manager';

export const usePendingStaysNotifications = () => {
  const { pendingStays, refetch } = useListPendingStays();

  // State to track if there are any pending stays
  const hasNewStays = ref(false);
  const notificationTimer = ref<NodeJS.Timeout | null>(null);

  // Clear notification flag when user acknowledges it
  const clearNotification = () => {
    hasNewStays.value = false;
  };

  // Start polling for pending stays
  const startPolling = () => {
    // Initial check
    checkForPendingStays();

    // Set up polling every 10 seconds
    notificationTimer.value = setInterval(() => {
      checkForPendingStays();
    }, 10000);
  };

  // Stop polling
  const stopPolling = () => {
    if (notificationTimer.value) {
      clearInterval(notificationTimer.value);
      notificationTimer.value = null;
    }
  };

  // Check for any pending stays
  const checkForPendingStays = async () => {
    try {
      await refetch();

      // Show notification if there are any pending stays
      if (pendingStays.value && pendingStays.value.length > 0) {
        hasNewStays.value = true;
      } else {
        hasNewStays.value = false;
      }
    } catch (error) {
      console.error('Error checking for pending stays:', error);
    }
  };

  // Watch for route changes to start/stop polling
  const route = useRoute();
  const isCheckinPage = computed(() => route.path === '/checkin');

  // Start polling when not on checkin page
  watch(isCheckinPage, (newValue) => {
    if (newValue) {
      // Stop polling when on checkin page
      stopPolling();
    } else {
      // Start polling when not on checkin page
      startPolling();
    }
  }, { immediate: true });

  // Clean up on component unmount
  onUnmounted(() => {
    stopPolling();
  });

  return {
    hasNewStays,
    pendingStays,
    clearNotification,
    startPolling,
    stopPolling
  };
};