import { computed } from 'vue';
import { useAPI } from './useAPI';

export interface WifiCredential {
  id: number;
  network_name: string;
  password: string;
  floor?: number;
  room_category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WifiCredentialCreateData {
  network_name: string;
  password: string;
  floor?: number;
  room_category?: string;
  is_active?: boolean;
}

export interface WifiCredentialUpdateData {
  network_name?: string;
  password?: string;
  floor?: number;
  room_category?: string;
  is_active?: boolean;
}

export interface WifiCredentialFilters {
  floor?: number;
  room_category?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Fetch all WiFi credentials with filtering and search
export const useFetchWifiCredentials = (filters: WifiCredentialFilters = {}) => {
  const { API } = useAPI();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['wifi-credentials', filters],
    query: async () => {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.floor !== undefined) queryParams.append('floor', filters.floor.toString());
      if (filters.room_category) queryParams.append('room_category', filters.room_category);
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.ordering) queryParams.append('ordering', filters.ordering);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.page_size) queryParams.append('page_size', filters.page_size.toString());
      
      const queryString = queryParams.toString();
      const url = `/wifi-credentials/${queryString ? `?${queryString}` : ''}`;
      
      const response = await API(url);
      return response;
    }
  });

  return {
    wifiCredentials: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single WiFi credential by ID
export const useFetchWifiCredentialById = (id: string | number) => {
  const { API } = useAPI();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['wifi-credential', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/wifi-credentials/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    wifiCredential: data,
    isLoading,
    error,
    refetch
  };
};

// Create WiFi credential (CRUD)
export const useCreateWifiCredential = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: WifiCredentialCreateData) => {
      const response = await API('/wifi-credentials/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Update WiFi credential (full update)
export const useUpdateWifiCredential = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: WifiCredentialUpdateData }) => {
      const response = await API(`/wifi-credentials/${id}/`, {
        method: 'PUT',
        body: data
      });
      return response;
    }
  });

  return {
    updateWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Partially update WiFi credential
export const usePartialUpdateWifiCredential = () => {
  const { API } = useAPI();

  const {
    mutateAsync: partialUpdateWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: Partial<WifiCredentialUpdateData> }) => {
      const response = await API(`/wifi-credentials/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response;
    }
  });

  return {
    partialUpdateWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Delete WiFi credential
export const useDeleteWifiCredential = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/wifi-credentials/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteWifiCredential,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Toggle active status of WiFi credential
export const useToggleWifiCredentialActive = () => {
  const { API } = useAPI();

  const {
    mutateAsync: toggleActive,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/wifi-credentials/${id}/toggle-active/`, {
        method: 'POST'
      });
      return response;
    }
  });

  return {
    toggleActive,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Get WiFi credentials for specific room (smart credential resolution)
export const useFetchWifiCredentialsByRoom = (roomId: string | number) => {
  const { API } = useAPI();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['wifi-credentials-by-room', roomId],
    query: async () => {
      if (!roomId) return null;
      const response = await API(`/wifi-credentials/by-room/${roomId}/`);
      return response;
    },
    enabled: computed(() => !!roomId)
  });

  return {
    wifiCredentials: data,
    isLoading,
    error,
    refetch
  };
};

// Get all WiFi credentials for a floor
export const useFetchWifiCredentialsByFloor = (floor: number) => {
  const { API } = useAPI();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['wifi-credentials-by-floor', floor],
    query: async () => {
      if (floor === undefined || floor === null) return null;
      const response = await API(`/wifi-credentials/by-floor/${floor}/`);
      return response;
    },
    enabled: computed(() => floor !== undefined && floor !== null)
  });

  return {
    wifiCredentials: data,
    isLoading,
    error,
    refetch
  };
};

// Get floors with configured WiFi
export const useFetchAvailableFloors = () => {
  const { API } = useAPI();
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['available-floors'],
    query: async () => {
      const response = await API('/wifi-credentials/available-floors/');
      return response;
    }
  });

  return {
    availableFloors: data,
    isLoading,
    error,
    refetch
  };
};