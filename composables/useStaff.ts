import { computed } from 'vue';
import { useAPI } from './useAPI';
import type { User } from '~/types';

export interface StaffCreateData {
  username: string;
  email: string;
  password: string;
  user_type: 'manager' | 'receptionist' | 'department_staff' | 'other_staff';
  phone_number?: string;
  department?: string[];
}

export interface StaffUpdateData {
  username?: string;
  email?: string;
  password?: string;
  user_type?: 'hotel_admin' | 'manager' | 'receptionist' | 'department_staff' | 'other_staff';
  phone_number?: string;
  is_active_hotel_user?: boolean;
  department?: string[];
}

// Fetch all staff members
export const useFetchStaff = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['staff'],
    query: async () => {
      const response = await API('/users/');
      return response.results; // API returns array directly
    }
  });

  return {
    staff: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single staff member by ID
export const useFetchStaffById = (id: string | number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['staff', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/users/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    staff: data,
    isLoading,
    error,
    refetch
  };
};

// Create staff member (CRUD)
export const useCreateStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: StaffCreateData) => {
      const response = await API('/users/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    createStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Update staff member (full update)
export const useUpdateStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: StaffUpdateData }) => {
      const response = await API(`/users/${id}/`, {
        method: 'PUT',
        body: data
      });
      return response;
    }
  });

  return {
    updateStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Partially update staff member
export const usePartialUpdateStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: partialUpdateStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: Partial<StaffUpdateData> }) => {
      const response = await API(`/users/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response;
    }
  });

  return {
    partialUpdateStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Delete staff member
export const useDeleteStaff = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteStaff,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/users/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteStaff,
    status,
    error,
    isLoading,
    asyncStatus
  };
};
