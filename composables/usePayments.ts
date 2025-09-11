import { computed } from 'vue';
import { useAPI } from './useAPI';

// Interfaces based on the API specification
export interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: 'trial' | 'standard';
  price: string; // Changed from number to string to match API response
  duration_days: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  hotel: string; // hotel_id
  plan: string; // plan_id
  amount: string; // Changed from number to string to match API response
  transaction_type: 'subscription' | 'manual';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface HotelSubscription {
  id: string;
  hotel: {
    id: string;
    name: string;
    // ... other hotel fields
  };
  plan: {
    id: string;
    name: string;
    plan_type: 'trial' | 'standard';
    price: string; // Changed from number to string to match API response
    duration_days: number;
    // ... other plan fields
  };
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_expired?: boolean;
  days_until_expiry?: number;
  created_at: string;
  updated_at: string;
}

// Paginated response interfaces
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Subscription Plans ---

// Fetch all subscription plans
export const useFetchPlans = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['plans'],
    query: async () => {
      const response: PaginatedResponse<SubscriptionPlan> = await API('/plans/');
      return response.results; // API returns paginated response with results array
    }
  });

  return {
    plans: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single subscription plan by ID
export const useFetchPlanById = (id: string) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['plans', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/plans/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    plan: data,
    isLoading,
    error,
    refetch
  };
};

// --- Transactions ---

// Fetch all own transactions
export const useFetchTransactions = (filters?: {
  plan?: string;
  transaction_type?: 'subscription' | 'manual';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
}) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['transactions', filters],
    query: async () => {
      const params = new URLSearchParams();
      if (filters?.plan) params.append('plan', filters.plan);
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.status) params.append('status', filters.status);
      
      const queryString = params.toString();
      const url = `/transactions/${queryString ? `?${queryString}` : ''}`;
      
      const response: PaginatedResponse<Transaction> = await API(url);
      return response.results; // API returns paginated response with results array
    }
  });

  return {
    transactions: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single own transaction by ID
export const useFetchTransactionById = (id: string) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['transactions', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/transactions/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    transaction: data,
    isLoading,
    error,
    refetch
  };
};

// --- Hotel Subscriptions ---

// Fetch all own subscriptions
export const useFetchSubscriptions = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['subscriptions'],
    query: async () => {
      const response = await API('/subscriptions/');
      return response;
    }
  });

  return {
    subscriptions: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch a single own subscription by ID
export const useFetchSubscriptionById = (id: string) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['subscriptions', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/subscriptions/${id}/`);
      return response;
    },
    enabled: computed(() => !!id)
  });

  return {
    subscription: data,
    isLoading,
    error,
    refetch
  };
};

// Fetch my subscription
export const useFetchMySubscription = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['subscriptions', 'my'],
    query: async () => {
      try {
        const response = await API('/subscriptions/my_subscription/');
        return response;
      } catch (err) {
        // Handle 404 response when no active subscription is found
        if (err instanceof APIError && err.status === 404) {
          return null; // Return null when no subscription is found
        }
        throw err; // Re-throw other errors
      }
    }
  });

  return {
    subscription: data,
    isLoading,
    error,
    refetch
  };
};

// Subscribe to a plan
export const useSubscribeToPlan = () => {
  const { API } = useAPI();
  
  const subscribeToPlan = async (planId: string) => {
    try {
      const response = await API('/payments/subscriptions/subscribe_to_plan/', {
        method: 'POST',
        body: { plan: planId }
      });
      return response;
    } catch (err) {
      console.error('Error subscribing to plan:', err);
      throw err;
    }
  };

  return {
    subscribeToPlan
  };
};