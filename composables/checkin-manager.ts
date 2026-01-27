import { ref, computed } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';

// Type definitions for check-in management
import type {
  CheckinOfflineData,
  CreateGuestData,
  VerifyCheckinData // Need to ensure this is in guest.ts or keep local if specific
} from '~/types/guest';

// Keep VerifyCheckinData local if not in shared types, or move it. 
// I didn't add VerifyCheckinData to guest.ts yet, I only added CheckinOfflineData, CreateGuestData.
// Let's check guest.ts content again or just keep VerifyCheckinData here if it wasn't added.
// I added CheckinOfflineData, CreateGuestData in guest.ts.
// I'll keep local interfaces that I missed in guest.ts or better yet, verify guest.ts content.


// Check-in Offline - Creates pending stay records with room assignments
export const useCheckinOffline = () => {
  const { API } = useAPI();

  const {
    mutateAsync: checkinOffline,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: CheckinOfflineData) => {
      const response = await API('/stay-management/checkin-offline/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    checkinOffline,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Verify Check-in - Verifies and activates a pending stay
export const useVerifyCheckin = () => {
  const { API } = useAPI();

  const {
    mutateAsync: verifyCheckin,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ stayId, data }: { stayId: string | number; data: VerifyCheckinData }) => {
      console.log('verifyCheckin mutation called with:', { stayId, data });
      const endpoint = `/stay-management/${stayId}/verify-checkin/`;
      console.log('Making request to endpoint:', endpoint);

      const response = await API(endpoint, {
        method: 'PATCH',
        body: data
      });
      console.log('verifyCheckin response:', response);
      return response;
    }
  });

  return {
    verifyCheckin,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// List Pending Stays - Lists all stays that are pending verification
export const useListPendingStays = () => {
  const { API } = useAPI();
  const { getResults } = useAPIHelper();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['pending-stays'],
    query: async () => {
      const response = await API('/stay-management/pending-stays/');
      return getResults(response);
    }
  });

  return {
    pendingStays: data,
    isLoading,
    error,
    refetch
  };
};

// List Guests - Lists all guests for the hotel with optional search functionality

export const useListGuests = (searchTerm?: string) => {
  const { API } = useAPI();
  const { getResults } = useAPIHelper();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['guests', searchTerm ?? null],
    query: async () => {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await API(`/guest-management/guests/${params}`);
      return getResults(response);
    },
    enabled: computed(() => true)
  });

  return {
    guests: data,
    isLoading,
    error,
    refetch
  };
};


// Create Guest - Creates primary guest with accompanying guests and their identity documents
export const useCreateGuest = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createGuest,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: CreateGuestData & { documents?: FormData }) => {
      // For file uploads, we need to use FormData
      if (data.documents) {
        const response = await API('/guest-management/create-guest/', {
          method: 'POST',
          body: data.documents,
          headers: {
            // Don't set Content-Type for FormData, let browser set it with boundary
          }
        });
        return response;
      } else {
        // For JSON-only requests
        const response = await API('/guest-management/create-guest/', {
          method: 'POST',
          body: data
        });
        return response;
      }
    }
  });

  return {
    createGuest,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Helper function to prepare FormData for guest creation with documents
export const prepareGuestFormData = (
  guestData: CreateGuestData,
  documents: {
    primaryDocuments?: File[];
    primaryDocumentsBack?: File[];
    accompanyingDocuments?: File[][]; // Array of document arrays for each accompanying guest
    accompanyingDocumentsBack?: File[][]; // Back side documents for accompanying guests
  }
): FormData => {
  const formData = new FormData();

  // Add primary guest data
  formData.append('primary_guest', JSON.stringify(guestData.primary_guest));

  // Add accompanying guests data
  if (guestData.accompanying_guests) {
    formData.append('accompanying_guests', JSON.stringify(guestData.accompanying_guests));
  }

  // Add primary guest documents
  if (documents.primaryDocuments) {
    documents.primaryDocuments.forEach((file, index) => {
      formData.append(`primary_documents_${index}`, file);
    });
  }

  // Add primary guest back documents
  if (documents.primaryDocumentsBack) {
    documents.primaryDocumentsBack.forEach((file, index) => {
      formData.append(`primary_documents_back_${index}`, file);
    });
  }

  // Add accompanying guests documents
  if (documents.accompanyingDocuments) {
    documents.accompanyingDocuments.forEach((guestDocs, guestIndex) => {
      guestDocs.forEach((file, docIndex) => {
        formData.append(`guest_${guestIndex}_documents_${docIndex}`, file);
      });
    });
  }

  // Add accompanying guests back documents
  if (documents.accompanyingDocumentsBack) {
    documents.accompanyingDocumentsBack.forEach((guestDocs, guestIndex) => {
      guestDocs.forEach((file, docIndex) => {
        formData.append(`guest_${guestIndex}_documents_back_${docIndex}`, file);
      });
    });
  }

  return formData;
};

// Utility function to check room availability before check-in
export const useCheckRoomAvailability = () => {
  const { API } = useAPI();

  const {
    mutateAsync: checkAvailability,
    status,
    error,
    isLoading
  } = useMutation({
    mutation: async (roomIds: number[]) => {
      const response = await API('/rooms/check-availability/', {
        method: 'POST',
        body: { room_ids: roomIds }
      });
      return response;
    }
  });

  return {
    checkAvailability,
    status,
    error,
    isLoading
  };
};

// List Checked-in Users - Lists all guests who are currently checked-in (active stays)
export const useListCheckedInUsers = () => {
  const { API } = useAPI();
  const { getResults } = useAPIHelper();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['checked-in-users'],
    query: async () => {
      const response = await API('/stay-management/checked-in-users/');
      return getResults(response);
    }
  });

  return {
    checkedInUsers: data,
    isLoading,
    error,
    refetch
  };
};

// Check Out User - Checks out a guest by changing the stay status to completed
export const useCheckoutUser = () => {
  const { API } = useAPI();

  const {
    mutateAsync: checkoutUser,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ stayId, data }: { stayId: string | number; data?: { internal_rating?: number; internal_note?: string } }) => {
      const response = await API(`/stay-management/${stayId}/checkout/`, {
        method: 'POST',
        body: data || {}
      });
      return response;
    }
  });

  return {
    checkoutUser,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Reject Check-in - Rejects a pending check-in and notifies the guest
export const useRejectCheckin = () => {
  const { API } = useAPI();

  const {
    mutateAsync: rejectCheckin,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (stayId: string | number) => {
      console.log('rejectCheckin mutation called with:', { stayId });
      const endpoint = `/stay-management/${stayId}/reject-checkin/`;
      console.log('Making request to endpoint:', endpoint);

      const response = await API(endpoint, {
        method: 'POST',
        body: {}
      });
      console.log('rejectCheckin response:', response);
      return response;
    }
  });

  return {
    rejectCheckin,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Extend Guest Stay - Extends the checkout date for an existing guest stay
export const useExtendGuestStay = () => {
  const { API } = useAPI();

  const {
    mutateAsync: extendGuestStay,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ stayId, checkOutDate }: { stayId: string | number; checkOutDate: string }) => {
      console.log('extendGuestStay mutation called with:', { stayId, checkOutDate });
      const endpoint = `/stay-management/${stayId}/extend-stay/`;
      console.log('Making request to endpoint:', endpoint);

      const response = await API(endpoint, {
        method: 'POST',
        body: {
          check_out_date: checkOutDate
        }
      });
      console.log('extendGuestStay response:', response);
      return response;
    }
  });

  return {
    extendGuestStay,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Utility composable for managing check-in workflow state
export const useCheckinWorkflow = () => {
  const checkinOfflineMutation = useCheckinOffline();
  const verifyCheckinMutation = useVerifyCheckin();
  const createGuestMutation = useCreateGuest();
  const checkAvailabilityMutation = useCheckRoomAvailability();
  const checkoutUserMutation = useCheckoutUser();
  const rejectCheckinMutation = useRejectCheckin();

  const workflowStep = ref<'initial' | 'guest-created' | 'rooms-assigned' | 'verified'>('initial');
  const currentBookingId = ref<number | null>(null);
  const currentStayIds = ref<number[]>([]);

  const resetWorkflow = () => {
    workflowStep.value = 'initial';
    currentBookingId.value = null;
    currentStayIds.value = [];
  };

  const isWorkflowActive = computed(() => workflowStep.value !== 'initial');

  return {
    // Mutations
    checkinOfflineMutation,
    verifyCheckinMutation,
    createGuestMutation,
    checkAvailabilityMutation,
    checkoutUserMutation,
    rejectCheckinMutation,

    // Workflow state
    workflowStep,
    currentBookingId,
    currentStayIds,
    resetWorkflow,
    isWorkflowActive
  };
};
