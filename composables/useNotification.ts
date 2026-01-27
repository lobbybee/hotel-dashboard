import { computed } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';

// Fetch all notifications
export const useFetchNotifications = () => {
  const { API } = useAPI();
  const { getResults } = useAPIHelper();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['notifications'],
    query: async () => {
      const response = await API('/notifications/');
      return getResults(response);
    }
  });

  return {
    notifications: data,
    isLoading,
    error,
    refetch
  };
};

// Mark notification as read
export const useMarkNotificationRead = () => {
  const { API } = useAPI();

  const {
    mutateAsync: markNotificationRead,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id }: { id: string | number }) => {
      const response = await API(`/notifications/${id}/mark-read/`, {
        method: 'POST'
      });
      return response;
    }
  });

  return {
    markNotificationRead,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Mark all notifications as read
export const useMarkAllNotificationsRead = () => {
  const { API } = useAPI();

  const {
    mutateAsync: markAllNotificationsRead,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async () => {
      const response = await API('/notifications/mark-all-read/', {
        method: 'POST'
      });
      return response;
    }
  });

  return {
    markAllNotificationsRead,
    status,
    error,
    isLoading,
    asyncStatus
  };
};
