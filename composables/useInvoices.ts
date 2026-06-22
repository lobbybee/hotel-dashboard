import { computed } from 'vue';
import { useAPI } from './useAPI';
import { useAPIHelper } from './useAPIHelper';

// --- Types (per Invoice API spec) ---
// preview returns money as numbers; saved invoices return money as strings.

export interface InvoiceLineItem {
  stay_id: number;
  room_id: number;
  room_number: string;
  category_id: number;
  room_type: string;
  base_price: number | string;
  nights: number;
  rate: number | string;
  amount: number | string;
  gst_rate: number;
  gst_amount: number | string;
  guest_names: string[];
  number_of_guests: number;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
}

export interface InvoiceBookingDetails {
  hotel: Record<string, any>;
  guest: {
    id: number;
    full_name: string;
    whatsapp_number?: string;
    email?: string;
    nationality?: string;
    [key: string]: any;
  };
  accompanying_guests: Array<Record<string, any>>;
  status: string;
  booking_date: string;
  check_in_date: string;
  check_out_date: string;
}

// Shared shape for preview (numbers) and saved invoice (strings).
export interface Invoice {
  id?: number;
  invoice_number?: string;
  booking: number;
  has_existing_invoice?: boolean;
  previous_data?: Invoice;
  booking_details?: InvoiceBookingDetails;
  line_items: InvoiceLineItem[];
  gst_slabs?: any[];
  subtotal: number | string;
  discount_amount: number | string;
  gst_amount: number | string;
  total_amount: number | string;
  is_locked?: boolean;
  locked_at?: string | null;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

// Single override rate if every line shares one; else null (per-slab auto).
export const uniformGstRate = (lineItems: InvoiceLineItem[] = []) => {
  const rates = new Set(lineItems.map((li) => Number(li.gst_rate)));
  return rates.size === 1 ? [...rates][0] : null;
};

export interface InvoicePreviewBody {
  booking_id: number;
  room_rates?: Record<string, string | number>;
  discount_amount?: string | number;
  gst_rate?: number | null;
}

// --- List + filter (route-driven, mirrors useListCheckedInUsers) ---
export const useFetchInvoices = () => {
  const route = useRoute();
  const { API } = useAPI();
  const { getPaginatedResults } = useAPIHelper();

  const queryKeyParams = computed(() => {
    const p: Record<string, any> = {};
    ['q', 'is_locked', 'date_from', 'date_to', 'page', 'page_size'].forEach((k) => {
      if (route.query[k]) p[k] = route.query[k];
    });
    return p;
  });

  const { data, isLoading, error, refetch } = useQuery({
    key: computed(() => ['invoices', queryKeyParams.value]),
    query: async () => {
      const params = { ...queryKeyParams.value };
      const response = await API('/invoices/', { params });
      return getPaginatedResults<Invoice>(response);
    },
    placeholderData: (previousData) => previousData
  });

  return { invoices: data, isLoading, error, refetch };
};

// --- Actions ---
export const useInvoiceActions = () => {
  const { API } = useAPI();
  const { getData, getPaginatedResults } = useAPIHelper();

  const previewInvoice = async (body: InvoicePreviewBody) => {
    const response = await API('/invoices/preview/', { method: 'POST', body });
    return getData<Invoice>(response);
  };

  const generateInvoice = async (body: InvoicePreviewBody) => {
    const response = await API('/invoices/generate/', { method: 'POST', body });
    return getData<Invoice>(response);
  };

  const retrieveInvoice = async (id: number | string) => {
    const response = await API(`/invoices/${id}/`);
    return getData<Invoice>(response);
  };

  const updateInvoice = async (id: number | string, body: any) => {
    const response = await API(`/invoices/${id}/`, { method: 'PATCH', body });
    return getData<Invoice>(response);
  };

  const lockAllInvoices = async (date: string) => {
    const response = await API('/invoices/lock-all/', { method: 'POST', body: { date } });
    return getData<{ locked_count: number }>(response);
  };

  // One-shot: pull every invoice for the active filters (report=true returns the full,
  // unpaginated set). Kept out of useFetchInvoices so it can't disturb the list query.
  const generateReport = async (filters: Record<string, any>) => {
    const response = await API('/invoices/', { params: { ...filters, report: true } });
    // report=true returns { success, data: [...] }; tolerate data / results / bare array
    const r = response as any;
    return (r?.data ?? r?.results ?? r ?? []) as Invoice[];
  };

  // Find the (single) invoice for a booking — used to fetch an already-generated invoice.
  const findInvoiceByBooking = async (bookingId: number | string) => {
    const response = await API('/invoices/', { params: { booking: bookingId } });
    const { results } = getPaginatedResults<Invoice>(response);
    return results[0] || null;
  };

  return { previewInvoice, generateInvoice, retrieveInvoice, updateInvoice, lockAllInvoices, generateReport, findInvoiceByBooking };
};
