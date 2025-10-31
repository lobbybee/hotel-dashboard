import { computed } from 'vue';
import { useAPI } from './useAPI';

export interface PaymentQRCode {
  id: string;
  hotel: string;
  name: string;
  image_url: string;
  upi_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentQRCodeCreateData {
  name: string;
  image: File;
  upi_id: string;
  active?: boolean;
}

export interface PaymentQRCodeUpdateData {
  name?: string;
  image?: File;
  upi_id?: string;
  active?: boolean;
}

export interface PaymentQRCodeListParams {
  active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PaymentQRCodeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentQRCode[];
}

// Fetch all payment QR codes
export const useFetchPaymentQRCodes = (params?: PaymentQRCodeListParams) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['payment-qr-codes', params],
    query: async () => {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString() : '';

      const url = queryString ? `/payment-qr-codes/?${queryString}` : '/payment-qr-codes/';
      const response = await API(url);
      return response as PaymentQRCodeListResponse;
    }
  });

  return {
    paymentQRCodes: computed(() => data.value?.results || []),
    totalCount: computed(() => data.value?.count || 0),
    isLoading,
    error,
    refetch
  };
};

// Fetch a single payment QR code by ID
export const useFetchPaymentQRCodeById = (id: string | number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['payment-qr-code', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/payment-qr-codes/${id}/`);
      return response as PaymentQRCode;
    },
    enabled: computed(() => !!id)
  });

  return {
    paymentQRCode: data,
    isLoading,
    error,
    refetch
  };
};

// Create payment QR code
export const useCreatePaymentQRCode = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createPaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: PaymentQRCodeCreateData) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('image', data.image);
      formData.append('upi_id', data.upi_id);
      if (data.active !== undefined) {
        formData.append('active', data.active.toString());
      }

      const response = await API('/payment-qr-codes/', {
        method: 'POST',
        body: formData
      });
      return response as PaymentQRCode;
    }
  });

  return {
    createPaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Update payment QR code (full update)
export const useUpdatePaymentQRCode = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updatePaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: PaymentQRCodeUpdateData }) => {
      const formData = new FormData();

      if (data.name !== undefined) formData.append('name', data.name);
      if (data.image !== undefined) formData.append('image', data.image);
      if (data.upi_id !== undefined) formData.append('upi_id', data.upi_id);
      if (data.active !== undefined) formData.append('active', data.active.toString());

      const response = await API(`/payment-qr-codes/${id}/`, {
        method: 'PUT',
        body: formData
      });
      return response as PaymentQRCode;
    }
  });

  return {
    updatePaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Partially update payment QR code
export const usePartialUpdatePaymentQRCode = () => {
  const { API } = useAPI();

  const {
    mutateAsync: partialUpdatePaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: Partial<PaymentQRCodeUpdateData> }) => {
      const formData = new FormData();

      if (data.name !== undefined) formData.append('name', data.name);
      if (data.image !== undefined) formData.append('image', data.image);
      if (data.upi_id !== undefined) formData.append('upi_id', data.upi_id);
      if (data.active !== undefined) formData.append('active', data.active.toString());

      const response = await API(`/payment-qr-codes/${id}/`, {
        method: 'PATCH',
        body: formData
      });
      return response as PaymentQRCode;
    }
  });

  return {
    partialUpdatePaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Delete payment QR code
export const useDeletePaymentQRCode = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deletePaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/payment-qr-codes/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deletePaymentQRCode,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Toggle payment QR code active status
export const useTogglePaymentQRCodeActive = () => {
  const { API } = useAPI();

  const {
    mutateAsync: togglePaymentQRCodeActive,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/payment-qr-codes/${id}/toggle-active/`, {
        method: 'POST'
      });
      return response;
    }
  });

  return {
    togglePaymentQRCodeActive,
    status,
    error,
    isLoading,
    asyncStatus
  };
};
