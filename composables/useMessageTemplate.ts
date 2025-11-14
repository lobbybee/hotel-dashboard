import { computed } from 'vue';
import { useAPI } from './useAPI';

// Base Template Interface
export interface MessageTemplate {
  id: string;
  name: string;
  template_type: string;
  category: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  media_url?: string;
}

// Global Template Interface (matches API response)
export interface GlobalMessageTemplate {
  id: number;
  name: string;
  template_type: string;
  category?: string;
  text_content: string;
  media_file?: string;
  media_filename?: string;
  media_url?: string;
  is_customizable: boolean;
  is_active: boolean;
  variables: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

// Custom Template Interface
export interface CustomMessageTemplate extends MessageTemplate {}



// Template Creation Data
export interface CustomTemplateCreateData {
  name: string;
  template_type: string;
  category: string;
  text_content: string;
  variables: string[];
  is_active?: boolean;
  media_url?: string;
}

// Template Update Data
export interface CustomTemplateUpdateData {
  name?: string;
  template_type?: string;
  category?: string;
  text_content?: string;
  variables?: string[];
  is_active?: boolean;
  media_url?: string;
}

// Template List Parameters
export interface TemplateListParams {
  template_type?: string;
  category?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Template List Response
export interface TemplateListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MessageTemplate[];
}

// Template Types and Categories Response
export interface TemplateTypesResponse {
  template_types: Array<[string, string]>; // [value, label] format
  categories: Array<[string, string]>;    // [value, label] format
}

// Template Preview Response
export interface TemplatePreviewResponse {
  template_id: number;
  template_name: string;
  rendered_content: string;
  sample_data: Record<string, any>;
}

// Template Media Upload Response
export interface TemplateMediaUploadResponse {
  success: boolean;
  file_url: string;
  filename: string;
  file_type: string;
  file_info: {
    original_name: string;
    size: number;
    content_type: string;
  };
}

// Template Variable Interface
export interface TemplateVariable {
  name: string;
  model: string;
  field: string;
  description: string;
  example: string;
}

// Template Variables Response
export interface TemplateVariablesResponse {
  variables: TemplateVariable[];
  grouped_by_model: Record<string, TemplateVariable[]>;
  total_count: number;
}

// ========================================
// CUSTOM TEMPLATE OPERATIONS
// ========================================

// Fetch all custom templates
export const useFetchCustomTemplates = (params?: TemplateListParams) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['custom-templates', params],
    query: async () => {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString() : '';

      const url = queryString ? `/chat/custom-templates/?${queryString}` : '/chat/custom-templates/';
      const response = await API(url);
      return response as TemplateListResponse;
    }
  });

  return {
    customTemplates: computed(() => data.value?.results || []),
    totalCount: computed(() => data.value?.count || 0),
    isLoading,
    error,
    refetch
  };
};

// Fetch a single custom template by ID
export const useFetchCustomTemplateById = (id: string | number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['custom-template', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/chat/custom-templates/${id}/`);
      return response as CustomMessageTemplate;
    },
    enabled: computed(() => !!id)
  });

  return {
    customTemplate: data,
    isLoading,
    error,
    refetch
  };
};

// Create custom template
export const useCreateCustomTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: createCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: CustomTemplateCreateData) => {
      const response = await API('/chat/custom-templates/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response as CustomMessageTemplate;
    }
  });

  return {
    createCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Update custom template (full update)
export const useUpdateCustomTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: updateCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: CustomTemplateUpdateData }) => {
      const response = await API(`/chat/custom-templates/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response as CustomMessageTemplate;
    }
  });

  return {
    updateCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Partially update custom template
export const usePartialUpdateCustomTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: partialUpdateCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: Partial<CustomTemplateUpdateData> }) => {
      const response = await API(`/chat/custom-templates/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return response as CustomMessageTemplate;
    }
  });

  return {
    partialUpdateCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// Delete custom template
export const useDeleteCustomTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: deleteCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/chat/custom-templates/${id}/`, {
        method: 'DELETE'
      });
      return response;
    }
  });

  return {
    deleteCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// ========================================
// GLOBAL TEMPLATE OPERATIONS (Read-Only)
// ========================================

// Fetch all global templates
export const useFetchGlobalTemplates = (params?: TemplateListParams) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['global-templates', params],
    query: async () => {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString() : '';

      const url = queryString ? `/chat/templates/?${queryString}` : '/chat/templates/';
      const response = await API(url);
      return response as {
        count: number;
        next: string | null;
        previous: string | null;
        results: GlobalMessageTemplate[];
      };
    }
  });

  return {
    globalTemplates: computed(() => data.value?.results || []),
    totalCount: computed(() => data.value?.count || 0),
    isLoading,
    error,
    refetch
  };
};

// Fetch a single global template by ID
export const useFetchGlobalTemplateById = (id: string | number) => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['global-template', id],
    query: async () => {
      if (!id) return null;
      const response = await API(`/chat/templates/${id}/`);
      return response as GlobalMessageTemplate;
    },
    enabled: computed(() => !!id)
  });

  return {
    globalTemplate: data,
    isLoading,
    error,
    refetch
  };
};

// ========================================
// UTILITY OPERATIONS
// ========================================

// Get template variables
export const useFetchTemplateVariables = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['template-variables'],
    query: async () => {
      const response = await API('/chat/templates/variables/');
      return response as TemplateVariablesResponse;
    }
  });

  return {
    templateVariables: computed(() => data.value),
    isLoading,
    error,
    refetch
  };
};

// Get template types and categories
export const useFetchTemplateTypes = () => {
  const { API } = useAPI();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['template-types'],
    query: async () => {
      const response = await API('/chat/templates/types/');
      return response as TemplateTypesResponse;
    }
  });

  return {
    templateTypes: computed(() => data.value),
    isLoading,
    error,
    refetch
  };
};

// Preview template (works for both custom and global templates)
export const usePreviewTemplate = () => {
  const { API } = useAPI();

  const {
    mutateAsync: previewTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/chat/templates/${id}/preview/`);
      return response as TemplatePreviewResponse;
    }
  });

  return {
    previewTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  };
};

// ========================================
// TEMPLATE MEDIA UPLOAD
// ========================================

// Upload template media
export const useUploadTemplateMedia = () => {
  const { API } = useAPI();

  const {
    mutateAsync: uploadTemplateMedia,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API('/chat/upload-template-media/', {
        method: 'POST',
        body: formData
      });
      return response as TemplateMediaUploadResponse;
    }
  });

  return {
    uploadTemplateMedia,
    status,
    error,
    isLoading,
    asyncStatus
  };
};
