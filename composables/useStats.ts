import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';

/**
 * Fetches general statistics.
 * For a Superadmin, this returns aggregate statistics across all hotels.
 * For a Hotel User, this returns general statistics for their specific hotel.
 *
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchGeneralStats = (options?: Ref<{ date?: string }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['stats', 'general', options?.value]),
    query: async () => {
      const response = await API('/stat/', { params: options?.value });
      return response;
    },
  });
};

/**
 * Fetches detailed statistics for a hotel user.
 * Not available for Superadmins.
 *
 * @param statType - The type of detailed statistics to retrieve ('rooms' or 'guests').
 * @param options - Optional query parameters.
 * @param options.date - Filter statistics to a specific day (YYYY-MM-DD).
 */
export const useFetchDetailedStats = (
  statType: Ref<'rooms' | 'guests'>,
  options?: Ref<{ date?: string }>
) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['stats', 'detailed', statType.value, options?.value]),
    query: async () => {
      if (!statType.value) return null;
      const response = await API(`/stat/${statType.value}/`, { params: options?.value });
      return response;
    },
    enabled: computed(() => !!statType.value),
  });
};
