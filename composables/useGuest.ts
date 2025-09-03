import { computed, type Ref } from 'vue';
import { useAPI } from './useAPI';

// Guests

/**
 * Fetches a list of guests for the hotel.
 * @param options - Optional query parameters.
 * @param options.status - Filter by guest status.
 * @param options.nationality - Filter by guest nationality.
 */
export const useFetchGuests = (options?: Ref<{ status?: string; nationality?: string }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['guests', options?.value]),
    query: async () => await API('/guests/', { params: options?.value }),
  });
};

/**
 * Creates a new guest.
 */
export const useCreateGuest = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (newGuest: any) => {
      return await API('/guests/', {
        method: 'POST',
        body: newGuest,
      });
    },
  });
};

/**
 * Searches for guests by name, email, or phone number.
 * @param query - The search query.
 */
export const useSearchGuests = (query: Ref<string>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['guests', 'search', query.value]),
    query: async () => {
      if (!query.value) return [];
      return await API('/guests/search/', { params: { q: query.value } });
    },
    enabled: computed(() => !!query.value),
  });
};

/**
 * Gets a guest's stay history by their phone number.
 * @param phoneNumber - The guest's phone number.
 */
export const useFetchGuestStaysByPhone = (phoneNumber: Ref<string>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['guests', 'stays-by-phone', phoneNumber.value]),
    query: async () => {
      if (!phoneNumber.value) return [];
      return await API('/guests/stays-by-phone/', { params: { phone_number: phoneNumber.value } });
    },
    enabled: computed(() => !!phoneNumber.value),
  });
};

/**
 * Fetches a specific guest's details.
 * @param id - The ID of the guest.
 */
export const useFetchGuest = (id: Ref<string | null>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['guest', id.value]),
    query: async () => {
      if (!id.value) return null;
      return await API(`/guests/${id.value}/`);
    },
    enabled: computed(() => !!id.value),
  });
};

/**
 * Updates a guest's details.
 */
export const useUpdateGuest = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (updatedGuest: any) => {
      if (!updatedGuest.id) throw new Error('Guest ID is required for update');
      return await API(`/guests/${updatedGuest.id}/`, {
        method: 'PUT',
        body: updatedGuest,
      });
    },
  });
};

/**
 * Partially updates a guest's details.
 */
export const usePatchGuest = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (patchedGuest: any) => {
      if (!patchedGuest.id) throw new Error('Guest ID is required for patch');
      return await API(`/guests/${patchedGuest.id}/`, {
        method: 'PATCH',
        body: patchedGuest,
      });
    },
  });
};

/**
 * Deletes a guest.
 */
export const useDeleteGuest = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (guestId: string) => {
      return await API(`/guests/${guestId}/`, {
        method: 'DELETE',
      });
    },
  });
};

// Guest Identity Documents

/**
 * Fetches a list of identity documents.
 * @param options - Optional query parameters.
 * @param options.document_type - Filter by document type.
 * @param options.is_verified - Filter by verification status.
 */
export const useFetchIdentityDocuments = (options?: Ref<{ document_type?: string; is_verified?: boolean }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['identity-documents', options?.value]),
    query: async () => await API('/identity-documents/', { params: options?.value }),
  });
};

/**
 * Uploads an identity document for a guest.
 */
export const useUploadIdentityDocument = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (documentData: any) => {
      const formData = new FormData();
      Object.keys(documentData).forEach(key => {
        formData.append(key, documentData[key]);
      });
      return await API('/identity-documents/', {
        method: 'POST',
        body: formData,
      });
    },
  });
};

/**
 * Fetches a specific identity document.
 * @param id - The ID of the identity document.
 */
export const useFetchIdentityDocument = (id: Ref<string | null>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['identity-document', id.value]),
    query: async () => {
      if (!id.value) return null;
      return await API(`/identity-documents/${id.value}/`);
    },
    enabled: computed(() => !!id.value),
  });
};

/**
 * Updates an identity document.
 */
export const useUpdateIdentityDocument = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (updatedDocument: any) => {
      if (!updatedDocument.id) throw new Error('Document ID is required for update');
      const formData = new FormData();
      Object.keys(updatedDocument).forEach(key => {
        if(key !== 'id') formData.append(key, updatedDocument[key]);
      });
      return await API(`/identity-documents/${updatedDocument.id}/`, {
        method: 'PUT',
        body: formData,
      });
    },
  });
};

/**
 * Partially updates an identity document.
 */
export const usePatchIdentityDocument = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (patchedDocument: any) => {
      if (!patchedDocument.id) throw new Error('Document ID is required for patch');
       const formData = new FormData();
      Object.keys(patchedDocument).forEach(key => {
        if(key !== 'id') formData.append(key, patchedDocument[key]);
      });
      return await API(`/identity-documents/${patchedDocument.id}/`, {
        method: 'PATCH',
        body: formData,
      });
    },
  });
};

/**
 * Deletes an identity document.
 */
export const useDeleteIdentityDocument = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (documentId: string) => {
      return await API(`/identity-documents/${documentId}/`, {
        method: 'DELETE',
      });
    },
  });
};


// Stays

/**
 * Fetches a list of stays for the hotel.
 * @param options - Optional query parameters.
 * @param options.status - Filter by stay status.
 * @param options.check_in_date - Filter by check-in date.
 */
export const useFetchStays = (options?: Ref<{ status?: string; check_in_date?: string }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['stays', options?.value]),
    query: async () => await API('/stays/', { params: options?.value }),
  });
};

/**
 * Creates a new stay record.
 */
export const useCreateStay = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (newStay: any) => {
      return await API('/stays/', {
        method: 'POST',
        body: newStay,
      });
    },
  });
};

/**
 * Fetches a specific stay record.
 * @param id - The ID of the stay.
 */
export const useFetchStay = (id: Ref<string | null>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['stay', id.value]),
    query: async () => {
      if (!id.value) return null;
      return await API(`/stays/${id.value}/`);
    },
    enabled: computed(() => !!id.value),
  });
};

/**
 * Updates a stay record.
 */
export const useUpdateStay = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (updatedStay: any) => {
      if (!updatedStay.id) throw new Error('Stay ID is required for update');
      return await API(`/stays/${updatedStay.id}/`, {
        method: 'PUT',
        body: updatedStay,
      });
    },
  });
};

/**
 * Partially updates a stay record.
 */
export const usePatchStay = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (patchedStay: any) => {
      if (!patchedStay.id) throw new Error('Stay ID is required for patch');
      return await API(`/stays/${patchedStay.id}/`, {
        method: 'PATCH',
        body: patchedStay,
      });
    },
  });
};

/**
 * Deletes a stay record.
 */
export const useDeleteStay = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (stayId: string) => {
      return await API(`/stays/${stayId}/`, {
        method: 'DELETE',
      });
    },
  });
};

/**
 * Checks in a guest for a specific stay.
 * Request Body:
 * {
 *   "stay_id": <integer>
 * }
 */
export const useCheckIn = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async ({ stay_id }: { stay_id: number }) => {
      return await API('/stays/check-in/', {
        method: 'POST',
        body: { stay_id },
      });
    },
  });
};

/**
 * Checks out a guest for a specific stay.
 * Request Body:
 * {
 *   "stay_id": <integer>
 * }
 */
export const useCheckOut = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async ({ stay_id }: { stay_id: number }) => {
      return await API('/stays/check-out/', {
        method: 'POST',
        body: { stay_id },
      });
    },
  });
};

/**
 * Initiates the check-in process for a specific stay.
 * @param stayId - The ID of the stay.
 */
export const useInitiateCheckIn = (stayId: Ref<string>) => {
  const { API } = useAPI();
  return useMutation({
    mutation: async () => {
      if (!stayId.value) throw new Error('Stay ID is required to initiate check-in');
      return await API(`/stays/${stayId.value}/initiate-checkin/`, {
        method: 'POST',
      });
    },
  });
};

// Bookings

/**
 * Fetches a list of bookings for the hotel.
 */
export const useFetchBookings = () => {
  const { API } = useAPI();
  return useQuery({
    key: ['bookings'],
    query: async () => await API('/bookings/'),
  });
};

/**
 * Creates a new booking.
 */
export const useCreateBooking = () => {
  const { API } = useAPI();
  return useMutation({
    mutation: async (newBooking: any) => {
      return await API('/bookings/', {
        method: 'POST',
        body: newBooking,
      });
    },
  });
};

/**
 * Fetches a specific booking by its ID.
 * @param id - The ID of the booking.
 */
export const useFetchBooking = (id: Ref<string | null>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['booking', id.value]),
    query: async () => {
      if (!id.value) return null;
      return await API(`/bookings/${id.value}/`);
    },
    enabled: computed(() => !!id.value),
  });
};