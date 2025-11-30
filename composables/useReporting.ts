import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';

/**
 * Fetches guest history for the hotel user.
 * Retrieves all guests who have stayed at the hotel with their complete stay records.
 *
 * @param options - Optional query parameters.
 * @param options.start_date - Filter stays from this date (YYYY-MM-DD).
 * @param options.end_date - Filter stays until this date (YYYY-MM-DD).
 * @param options.guest_whatsapp - Filter by specific guest WhatsApp number.
 */
export const useFetchGuestHistory = (options?: Ref<{
  start_date?: string;
  end_date?: string;
  guest_whatsapp?: string;
}>) => {
  const { API } = useAPI();
  const {
    data: guestHistory,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['reporting', 'guest-history', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/guest-history/', { params: options?.value });
      return response;
    },
  });

  return { guestHistory, isLoading, error, refetch };
};

/**
 * Fetches room history for the hotel user.
 * Retrieves all rooms with their stay records and usage statistics.
 *
 * @param options - Optional query parameters.
 * @param options.start_date - Filter stays from this date (YYYY-MM-DD).
 * @param options.end_date - Filter stays until this date (YYYY-MM-DD).
 * @param options.room_id - Filter by specific room ID.
 * @param options.guest_whatsapp - Filter by specific guest WhatsApp number.
 */
export const useFetchRoomHistory = (options?: Ref<{
  start_date?: string;
  end_date?: string;
  room_id?: number;
  guest_whatsapp?: string;
}>) => {
  const { API } = useAPI();
  const {
    data: roomHistory,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['reporting', 'room-history', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/room-history/', { params: options?.value });
      return response;
    },
  });

  return { roomHistory, isLoading, error, refetch };
};

/**
 * Fetches conversation history for the hotel user.
 * Retrieves all WhatsApp conversations with message counts and fulfillment status.
 *
 * @param options - Optional query parameters.
 * @param options.start_date - Filter conversations from this date (YYYY-MM-DD).
 * @param options.end_date - Filter conversations until this date (YYYY-MM-DD).
 */
export const useFetchConversationHistory = (options?: Ref<{
  start_date?: string;
  end_date?: string;
}>) => {
  const { API } = useAPI();
  const {
    data: conversationHistory,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['reporting', 'conversation-history', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/conversation-history/', { params: options?.value });
      return response;
    },
  });

  return { conversationHistory, isLoading, error, refetch };
};

/**
 * Fetches feedback analytics for the hotel user.
 * Comprehensive guest feedback analytics with ratings, trends, and performance insights.
 *
 * @param options - Optional query parameters.
 * @param options.start_date - Filter feedback from this date (YYYY-MM-DD).
 * @param options.end_date - Filter feedback until this date (YYYY-MM-DD).
 * @param options.room_id - Filter by specific room ID.
 * @param options.guest_whatsapp - Filter by specific guest WhatsApp number.
 */
export const useFetchFeedbackAnalytics = (options?: Ref<{
  start_date?: string;
  end_date?: string;
  room_id?: number;
  guest_whatsapp?: string;
}>) => {
  const { API } = useAPI();
  const {
    data: feedbackAnalytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['reporting', 'feedback-analytics', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/feedback-analytics/', { params: options?.value });
      return response;
    },
  });

  return { feedbackAnalytics, isLoading, error, refetch };
};

/**
 * Fetches hotel overview metrics for the hotel user.
 * Provides comprehensive overview including total guests, rooms, occupancy rate, and revenue.
 *
 * @param options - Optional query parameters.
 * @param options.date - Target date for metrics (YYYY-MM-DD). Defaults to today.
 * @param options.start_date - Revenue calculation start date (YYYY-MM-DD).
 * @param options.end_date - Revenue calculation end date (YYYY-MM-DD).
 */
export const useFetchHotelOverview = (options?: Ref<{
  date?: string;
  start_date?: string;
  end_date?: string;
}>) => {
  const { API } = useAPI();
  const {
    data: hotelOverview,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['reporting', 'hotel-overview', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/overview/', { params: options?.value });
      return response;
    },
  });

  
  return { hotelOverview, isLoading, error, refetch };
};
