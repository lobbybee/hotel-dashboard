import { computed } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';

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
  media_file?: string;
  description?: string;
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
export interface CustomMessageTemplate extends MessageTemplate { }

// Template Creation Data
export interface CustomTemplateCreateData {
  name: string;
  template_type: string;
  category?: string;
  text_content: string;
  variables?: string[];
  is_active?: boolean;
  base_template?: number;
  description?: string;
  media_file?: File;
}

// Template Update Data
export interface CustomTemplateUpdateData {
  name?: string;
  template_type?: string;
  category?: string;
  text_content?: string;
  variables?: string[];
  is_active?: boolean;
  base_template?: number;
  description?: string;
  media_file?: File;
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
  const { getData } = useAPIHelper();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['custom-templates', (params ?? null) as any],
    query: async () => {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString() : '';

      const url = queryString ? `/chat/custom-templates/?${queryString}` : '/chat/custom-templates/';
      const response = await API(url);
      return getData<TemplateListResponse>(response);
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
  const { getData } = useAPIHelper();
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
      return getData<CustomMessageTemplate>(response);
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
  const { getData } = useAPIHelper();

  const {
    mutateAsync: createCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: CustomTemplateCreateData) => {
      const formData = new FormData();

      // Add all text fields to FormData
      formData.append('name', data.name);
      formData.append('template_type', data.template_type);

      if (data.category) {
        formData.append('category', data.category);
      }

      formData.append('text_content', data.text_content);

      if (data.variables && data.variables.length > 0) {
        formData.append('variables', JSON.stringify(data.variables));
      }

      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
      }

      if (data.base_template) {
        formData.append('base_template', data.base_template.toString());
      }

      if (data.description) {
        formData.append('description', data.description);
      }

      if (data.media_file) {
        formData.append('media_file', data.media_file);
      }

      const response = await API('/chat/custom-templates/', {
        method: 'POST',
        body: formData
      });
      return getData<CustomMessageTemplate>(response);
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
  const { getData } = useAPIHelper();

  const {
    mutateAsync: updateCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: CustomTemplateUpdateData }) => {
      const formData = new FormData();

      // Add all provided fields to FormData
      if (data.name) {
        formData.append('name', data.name);
      }

      if (data.template_type) {
        formData.append('template_type', data.template_type);
      }

      if (data.category) {
        formData.append('category', data.category);
      }

      if (data.text_content) {
        formData.append('text_content', data.text_content);
      }

      if (data.variables) {
        formData.append('variables', JSON.stringify(data.variables));
      }

      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
      }

      if (data.base_template) {
        formData.append('base_template', data.base_template.toString());
      }

      if (data.description) {
        formData.append('description', data.description);
      }

      if (data.media_file) {
        formData.append('media_file', data.media_file);
      }

      const response = await API(`/chat/custom-templates/${id}/`, {
        method: 'PUT',
        body: formData
      });
      return getData<CustomMessageTemplate>(response);
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
  const { getData } = useAPIHelper();

  const {
    mutateAsync: partialUpdateCustomTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async ({ id, data }: { id: string | number; data: Partial<CustomTemplateUpdateData> }) => {
      const formData = new FormData();

      // Add all provided fields to FormData
      if (data.name) {
        formData.append('name', data.name);
      }

      if (data.template_type) {
        formData.append('template_type', data.template_type);
      }

      if (data.category) {
        formData.append('category', data.category);
      }

      if (data.text_content) {
        formData.append('text_content', data.text_content);
      }

      if (data.variables) {
        formData.append('variables', JSON.stringify(data.variables));
      }

      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
      }

      if (data.base_template) {
        formData.append('base_template', data.base_template.toString());
      }

      if (data.description) {
        formData.append('description', data.description);
      }

      if (data.media_file) {
        formData.append('media_file', data.media_file);
      }

      const response = await API(`/chat/custom-templates/${id}/`, {
        method: 'PATCH',
        body: formData
      });
      return getData<CustomMessageTemplate>(response);
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
  const { getData } = useAPIHelper();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['global-templates', (params ?? null) as any],
    query: async () => {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString() : '';

      const url = queryString ? `/chat/templates/?${queryString}` : '/chat/templates/';
      const response = await API(url);
      return getData<{
        count: number;
        next: string | null;
        previous: string | null;
        results: GlobalMessageTemplate[];
      }>(response);
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
  const { getData } = useAPIHelper();
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
      return getData<GlobalMessageTemplate>(response);
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
  const { getData } = useAPIHelper();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['template-variables'],
    query: async () => {
      const response = await API('/chat/templates/variables/');
      return getData<TemplateVariablesResponse>(response);
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
  const { getData } = useAPIHelper();
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    key: ['template-types'],
    query: async () => {
      const response = await API('/chat/templates/types/');
      return getData<TemplateTypesResponse>(response);
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
  const { getData } = useAPIHelper();

  const {
    mutateAsync: previewTemplate,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (id: string | number) => {
      const response = await API(`/chat/templates/${id}/preview/`);
      return getData<TemplatePreviewResponse>(response);
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
  const { getData } = useAPIHelper();

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
      return getData<TemplateMediaUploadResponse>(response);
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
