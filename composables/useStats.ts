import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';

/**
 * Fetches overview statistics for the hotel user.
 * Auto-detects hotel from user profile - no hotel parameter needed.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchOverviewStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'overview', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/', { params: options?.value });
      return response;
    },
  });

  return { stats, isLoading, error, refetch };
};

/**
 * Fetches occupancy statistics for the hotel user.
 * Includes category occupancy, floor occupancy, and monthly trends.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchOccupancyStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'occupancy', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/occupancy/', { params: options?.value });
      return response;
    },
  });

  return { stats, isLoading, error, refetch };
};

/**
 * Fetches guest statistics for the hotel user.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchGuestStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'guests', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/guests/', { params: options?.value });
      return response;
    },
  });

  return { stats, isLoading, error, refetch };
};

/**
 * Fetches room statistics for the hotel user.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchRoomStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'rooms', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/rooms/', { params: options?.value });
      return response;
    },
  });

  return { stats, isLoading, error, refetch };
};

/**
 * Fetches staff statistics for the hotel user.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchStaffStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'staff', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/staff/', { params: options?.value });
      return response;
    },
  });

  return { stats, isLoading, error, refetch };
};

/**
 * Fetches performance metrics for the hotel user.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchPerformanceStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'performance', options?.value]),
    query: async () => {
      const response = await API('/hotel_stat/performance/', { params: options?.value });
      return response;
    },
  });

  return { stats, isLoading, error, refetch };
};

// Legacy exports for backward compatibility
export const useFetchGeneralStats = useFetchOverviewStats;
export const useFetchDetailedStats = (
  statType: Ref<'rooms' | 'guests'>,
  options?: Ref<{ date?: string }>
) => {
  const { API } = useAPI();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    key: computed(() => ['stats', 'detailed', statType.value, options?.value]),
    query: async () => {
      if (!statType.value) return null;
      const response = await API(`/hotel_stat/${statType.value}/`, { params: options?.value });
      return response;
    },
    enabled: computed(() => !!statType.value),
  });

  return { stats, isLoading, error, refetch };
};
