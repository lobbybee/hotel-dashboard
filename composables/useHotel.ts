import { computed } from 'vue';
import { useAPI } from './useAPI';

// Hotels

export const useFetchHotels = (options?: Ref<{ status?: string; city?: string; country?: string }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['hotels', options?.value]),
    query: async () => {
      const response = await API('/hotels/', { params: options?.value });
      return response;
    },
  });
};


export const useFetchHotel = (id: Ref<string | null>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['hotel', id.value]),
    query: async () => {
      if (!id.value) return null;
      const response = await API(`/hotels/${id.value}/`);
      return response;
    },
    enabled: computed(() => !!id.value)
  });
};

export const useCreateHotel = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (newHotel: any) => {
      return await API('/hotels/', {
        method: 'POST',
        body: newHotel,
      });
    },
  });
};

export const useUpdateHotel = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (updatedHotel: any) => {
      if (!updatedHotel.id) throw new Error('Hotel ID is required for update');
      return await API(`/hotels/${updatedHotel.id}/`, {
        method: 'PUT',
        body: updatedHotel,
      });
    },
  });
};

export const usePatchHotel = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (patchedHotel: any) => {
      if (!patchedHotel.id) throw new Error('Hotel ID is required for patch');
      return await API(`/hotels/${patchedHotel.id}/`, {
        method: 'PATCH',
        body: patchedHotel,
      });
    },
  });
};


export const useDeleteHotel = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (hotelId: string) => {
      return await API(`/hotels/${hotelId}/`, {
        method: 'DELETE',
      });
    },
  });
};


// Hotel Profile

export const useUpdateHotelProfile = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (profileData: any) => {
        return await API('/profile/update/', {
          method: 'PUT',
          body: profileData,
        });
      },
    });
  };

// Hotel Documents

export const useUploadHotelDocument = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (documentData: { document_type: string; document_file: File }) => {
        const formData = new FormData();
        formData.append('document_type', documentData.document_type);
        formData.append('document_file', documentData.document_file);

        return await API('/documents/upload/', {
          method: 'POST',
          body: formData,
        });
      },
    });
  };

export const useUpdateHotelDocument = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (documentData: { id: string; document_type?: string; document_file?: File }) => {
        const formData = new FormData();
        if (documentData.document_type) {
          formData.append('document_type', documentData.document_type);
        }
        if (documentData.document_file) {
          formData.append('document_file', documentData.document_file);
        }

        return await API(`/hotel/documents/${documentData.id}/update/`, {
          method: 'PATCH',
          body: formData,
        });
      },
    });
  };


// Room Categories

export const useFetchRoomCategories = (options?: Ref<{ page?: number, search?: string, ordering?: string }>) => {
    const { API } = useAPI();
    return useQuery({
      key: computed(() => ['room-categories', options?.value]),
      query: async () => await API('/room-categories/', { params: options?.value }),
    });
  };

export const useFetchRoomCategory = (id: Ref<string | null>) => {
    const { API } = useAPI();
    return useQuery({
      key: computed(() => ['room-category', id.value]),
      query: async () => {
        if (!id.value) return null;
        return await API(`/room-categories/${id.value}/`);
      },
      enabled: computed(() => !!id.value),
    });
  };

export const useCreateRoomCategory = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (newCategory: any) => {
        return await API('/room-categories/', {
          method: 'POST',
          body: newCategory,
        });
      },
    });
  };

export const useUpdateRoomCategory = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (updatedCategory: any) => {
        if (!updatedCategory.id) throw new Error('Category ID is required');
        return await API(`/room-categories/${updatedCategory.id}/`, {
          method: 'PUT',
          body: updatedCategory,
        });
      },
    });
  };

export const usePatchRoomCategory = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (patchedCategory: any) => {
        if (!patchedCategory.id) throw new Error('Category ID is required');
        return await API(`/room-categories/${patchedCategory.id}/`, {
          method: 'PATCH',
          body: patchedCategory,
        });
      },
    });
  };

export const useDeleteRoomCategory = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (categoryId: string) => {
        return await API(`/room-categories/${categoryId}/`, {
          method: 'DELETE',
        });
      },
    });
  };


// Rooms

export const useFetchRooms = (options?: Ref<{ status?: string; floor?: number; category?: number; occupied?: boolean; page?: number; ordering?: string; search?: string }>) => {
    const { API } = useAPI();
    return useQuery({
      key: computed(() => ['rooms', options?.value]),
      query: async () => await API('/rooms/', { params: options?.value }),
    });
  };

export const useFetchRoom = (id: Ref<string | null>) => {
    const { API } = useAPI();
    return useQuery({
      key: computed(() => ['room', id.value]),
      query: async () => {
        if (!id.value) return null;
        return await API(`/rooms/${id.value}/`);
      },
      enabled: computed(() => !!id.value),
    });
  };

export const useCreateRoom = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (newRoom: any) => {
        return await API('/rooms/', {
          method: 'POST',
          body: newRoom,
        });
      },
    });
  };

export const useBulkCreateRooms = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (bulkData: any) => {
        return await API('/rooms/bulk-create/', {
          method: 'POST',
          body: bulkData,
        });
      },
    });
  };

export const useUpdateRoom = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (updatedRoom: any) => {
        if (!updatedRoom.id) throw new Error('Room ID is required');
        return await API(`/rooms/${updatedRoom.id}/`, {
          method: 'PUT',
          body: updatedRoom,
        });
      },
    });
  };

export const usePatchRoom = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (patchedRoom: any) => {
        if (!patchedRoom.id) throw new Error('Room ID is required');
        return await API(`/rooms/${patchedRoom.id}/`, {
          method: 'PATCH',
          body: patchedRoom,
        });
      },
    });
  };

export const useDeleteRoom = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (roomId: string) => {
        return await API(`/rooms/${roomId}/`, {
          method: 'DELETE',
        });
      },
    });
  };


export const useFetchHotelRoomFloors = () => {
  const { API } = useAPI();
  return useQuery({
    key: ['hotel-room-floors'],
    query: async () => {
      const response = await API('/rooms/floors/');
      return response;
    },
  });
};


// Departments

export const useFetchDepartments = (options?: Ref<{ department_type?: string; is_active?: boolean }>) => {
    const { API } = useAPI();
    return useQuery({
      key: computed(() => ['departments', options?.value]),
      query: async () => await API('/departments/', { params: options?.value }),
    });
  };

export const useFetchDepartment = (id: Ref<string | null>) => {
    const { API } = useAPI();
    return useQuery({
      key: computed(() => ['department', id.value]),
      query: async () => {
        if (!id.value) return null;
        return await API(`/departments/${id.value}/`);
      },
      enabled: computed(() => !!id.value),
    });
  };

export const useCreateDepartment = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (newDepartment: any) => {
        return await API('/departments/', {
          method: 'POST',
          body: newDepartment,
        });
      },
    });
  };

export const useUpdateDepartment = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (updatedDepartment: any) => {
        if (!updatedDepartment.id) throw new Error('Department ID is required');
        return await API(`/departments/${updatedDepartment.id}/`, {
          method: 'PUT',
          body: updatedDepartment,
        });
      },
    });
  };

export const usePatchDepartment = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (patchedDepartment: any) => {
        if (!patchedDepartment.id) throw new Error('Department ID is required');
        return await API(`/departments/${patchedDepartment.id}/`, {
          method: 'PATCH',
          body: patchedDepartment,
        });
      },
    });
  };

export const useDeleteDepartment = () => {
    const { API } = useAPI();
    return useMutation({
      mutation: async (departmentId: string) => {
        return await API(`/departments/${departmentId}/`, {
          method: 'DELETE',
        });
      },
    });
  };
