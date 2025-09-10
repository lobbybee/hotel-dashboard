import { computed } from 'vue';
import { useAPI } from './useAPI';

// Based on the API specification provided

export interface FlowStepTemplate {
  id: number;
  flow_template: number;
  step_name: string;
  order: number;
  message_template: { [key: string]: any };
  message_type: string;
  should_store_media: boolean;
  options: { [key: string]: any };
  next_step_template: number;
  is_customizable: boolean;
  actions: any[];
  conditional_next_steps: null | any;
  allowed_flow_categories: any[];
  quick_reply_navigation: { [key: string]: any };
}

export interface FlowStepTemplateDropdown {
  id: number;
  step_name: string;
}

export interface FlowStep {
    id: number;
    template: number;
    hotel: number;
    step_id: string;
    message_template: { [key: string]: any };
    message_type: string;
    options: { [key: string]: any };
}

export interface FlowStepCreateData {
  template: number;
}

export interface FlowStepUpdateData {
    message_template?: { [key: string]: any };
    options?: { [key: string]: any };
    conditional_next_steps?: { [key: string]: any };
    // Add other updatable fields from FlowStep if necessary
}


// 1. Discover Customizable Step Templates
export const useFetchCustomizableStepTemplates = (options?: Ref<{ page?: number, page_size?: number, search?: string, ordering?: string }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['customizable-step-templates', options?.value]),
    query: async () => {
      const response = await API('/context/hotel/customizable-step-templates/', { params: options?.value });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
};

// 2. Create a Hotel-Specific Flow Step (Initiate Customization)
export const useCreateFlowStep = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createFlowStep,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: FlowStepCreateData) => {
      const response = await API('/context/hotel/flow-steps/', {
        method: 'POST',
        body: data
      });
      return response as FlowStep;
    }
  });

  return {
    createFlowStep,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// 3. List and Manage Existing Custom Flow Steps

// List all flow steps for the hotel
export const useFetchFlowSteps = (options?: Ref<{ page?: number, page_size?: number, search?: string, ordering?: string }>) => {
  const { API } = useAPI();
  return useQuery({
    key: computed(() => ['flow-steps', options?.value]),
    query: async () => {
      const response = await API('/context/hotel/flow-steps/', { params: options?.value });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
};

// Retrieve a single flow step by ID
export const useFetchFlowStepById = (id: string | number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['flow-steps', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/context/hotel/flow-steps/${id}/`);
      return response as FlowStep;
    },
    enabled: computed(() => !!id)
  });

  return {
    flowStep: data,
    isLoading,
    error,
    refetch
  };
};

// Update a flow step
export const useUpdateFlowStep = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateFlowStep,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: Partial<FlowStepUpdateData> }) => {
      const response = await API(`/context/hotel/flow-steps/${id}/`, {
        method: 'PATCH',
        body: data
      });
      return response as FlowStep;
    }
  });

  return {
    updateFlowStep,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Delete a flow step
export const useDeleteFlowStep = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteFlowStep,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      // DELETE returns 204 No Content, so we don't expect a body
      await API(`/context/hotel/flow-steps/${id}/`, {
        method: 'DELETE'
      });
      return true; // Indicate success
    }
  });

  return {
    deleteFlowStep,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Fetch flow step templates for dropdown
export const useFetchFlowStepTemplatesDropdown = () => {
  const { API } = useAPI();
  return useQuery({
    key: ['flow-step-templates-dropdown'],
    query: async () => {
      const response = await API('/context/hotel/flow-step-templates/dropdown/');
      return response as FlowStepTemplateDropdown[];
    },
  });
};