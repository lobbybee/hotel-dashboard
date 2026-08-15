import { computed } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';

// Guest ID Flag API. Two row shapes share these keys — branch on `id === null`:
// id present = document your hotel collected (flaggable, has file/contact),
// id null = an ID flagged at another hotel (type + number only).
export interface IdentityDocument {
  id: number | null;
  guest_id: number | null;
  guest_name: string | null;
  whatsapp_number: string | null;
  email: string | null;
  register_number: string | null;
  document_type: 'aadhar_id' | 'driving_license' | 'national_id' | 'voter_id' | 'other' | string;
  number: string;
  file_url: string | null;
  isFlagged: boolean;
  stay_id: number | null;
}

export const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Aadhar ID', value: 'aadhar_id' },
  { label: 'Driving License', value: 'driving_license' },
  { label: 'National ID', value: 'national_id' },
  { label: 'Voter ID', value: 'voter_id' },
  { label: 'Other', value: 'other' }
];

export const formatDocumentType = (type: string) =>
  DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ||
  (type || '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

// Route-driven list (mirrors useFetchInvoices)
export const useFetchIdentityDocuments = () => {
  const route = useRoute();
  const { API } = useAPI();
  const { getPaginatedResults } = useAPIHelper();

  const queryKeyParams = computed(() => {
    const p: Record<string, any> = {};
    ['search', 'page', 'page_size'].forEach((k) => {
      if (route.query[k]) p[k] = route.query[k];
    });
    return p;
  });

  const { data, isLoading, error, refetch } = useQuery({
    key: computed(() => ['identity-documents', queryKeyParams.value]),
    query: async () => {
      const response = await API('/identity-documents/', { params: { ...queryKeyParams.value } });
      return getPaginatedResults<IdentityDocument>(response);
    },
    placeholderData: (previousData) => previousData
  });

  return { documents: data, isLoading, error, refetch };
};

export const useIdentityDocumentActions = () => {
  const { API } = useAPI();
  const { getData } = useAPIHelper();

  // Not idempotent — each call records a separate incident.
  const flagDocument = async (
    documentId: number,
    body: { internal_reason: string; global_note?: string }
  ) => {
    const response = await API(`/identity-documents/${documentId}/flag/`, { method: 'POST', body });
    return getData<Record<string, any>>(response);
  };

  return { flagDocument };
};
