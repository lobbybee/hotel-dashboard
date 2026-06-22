<template>
  <div class="max-w-7xl mx-auto p-4">
    <!-- Header -->
    <div class="mb-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
      <p class="text-gray-600">View, filter and lock hotel invoices</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex flex-wrap items-end gap-4">
        <div class="w-full sm:w-64">
          <label class="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText v-model="searchQuery" placeholder="Invoice number..." class="w-full" />
          </IconField>
        </div>
        <div class="w-full sm:w-40">
          <label class="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <Dropdown
            v-model="lockedFilter"
            :options="lockedOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            class="w-full"
            @change="onLockedChange"
          />
        </div>
        <div class="w-full sm:w-44">
          <label class="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input v-model="dateFrom" type="date" class="w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" @change="onDateChange" />
        </div>
        <div class="w-full sm:w-44">
          <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input v-model="dateTo" type="date" class="w-full h-[42px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" @change="onDateChange" />
        </div>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end shrink-0">
        <Button label="Generate report" icon="pi pi-file-pdf" severity="secondary" outlined :loading="isReporting" @click="handleGenerateReport" />
        <Button label="Lock all invoices" icon="pi pi-lock" severity="warning" @click="isLockDialogVisible = true" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
      <p class="text-gray-500 mt-4">Loading invoices...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load invoices</h3>
      <p class="text-gray-500 mb-4">{{ getErrorMessage(error) }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="refetch" />
    </div>

    <!-- Empty -->
    <div v-else-if="invoiceRows.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">No invoices found</p>
      <p class="text-gray-400 text-sm">Invoices are created when a guest is checked out.</p>
    </div>

    <!-- List -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left font-medium px-4 py-3">Invoice #</th>
            <th class="text-left font-medium px-4 py-3">Guest</th>
            <th class="text-right font-medium px-4 py-3">Total</th>
            <th class="text-left font-medium px-4 py-3">Created</th>
            <th class="text-center font-medium px-4 py-3">Status</th>
            <th class="text-right font-medium px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoiceRows" :key="inv.id" class="border-t border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{{ inv.invoice_number }}</td>
            <td class="px-4 py-3 text-gray-700">{{ guestName(inv) }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ money(inv.total_amount) }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDateTimeCompactInHotelTz(inv.created_at) }}</td>
            <td class="px-4 py-3 text-center">
              <Tag :value="inv.is_locked ? 'Locked' : 'Open'" :severity="inv.is_locked ? 'secondary' : 'success'" />
            </td>
            <td class="px-4 py-3 text-right">
              <Button label="View" icon="pi pi-eye" text size="small" @click="openInvoice(inv.id)" />
            </td>
          </tr>
        </tbody>
      </table>

      <Paginator
        :rows="pageSize"
        :totalRecords="totalRecords"
        :first="(currentPage - 1) * pageSize"
        :rowsPerPageOptions="[10, 20, 50]"
        @page="onPageChange"
      />
    </div>

    <!-- Lock all dialog -->
    <Dialog v-model:visible="isLockDialogVisible" modal header="Lock all invoices" :style="{ width: '28rem' }">
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          Every unlocked invoice created on or before this date will be frozen and can no longer be edited.
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lock up to date</label>
          <input v-model="lockDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="isLockDialogVisible = false" />
        <Button label="Lock invoices" severity="warning" icon="pi pi-lock" :loading="isLocking" :disabled="!lockDate" @click="handleLockAll" />
      </template>
    </Dialog>

    <!-- Detail dialog -->
    <Dialog v-model:visible="isDetailVisible" modal header="Invoice" :style="{ width: '700px' }">
      <div v-if="isDetailLoading" class="text-center py-10">
        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" />
      </div>
      <div v-else-if="displayInvoice" class="space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-semibold text-lg text-gray-900">{{ selectedInvoice?.invoice_number }}</p>
            <p class="text-sm text-gray-500">{{ formatDateTimeCompactInHotelTz(selectedInvoice?.created_at) }}</p>
          </div>
          <Tag :value="isLocked ? 'Locked' : 'Open'" :severity="isLocked ? 'secondary' : 'success'" />
        </div>

        <div v-if="displayInvoice.booking_details?.guest" class="p-3 bg-gray-50 rounded-lg text-sm">
          <p class="font-medium text-gray-900">{{ displayInvoice.booking_details.guest.full_name }}</p>
          <p class="text-gray-600">{{ displayInvoice.booking_details.guest.whatsapp_number || 'N/A' }}</p>
          <p class="text-gray-600">{{ displayInvoice.booking_details.guest.email || '' }}</p>
        </div>

        <p v-if="isLocked" class="text-xs text-gray-500 flex items-center gap-1">
          <i class="pi pi-lock"></i> Locked — showing stored invoice; editing is disabled.
        </p>
        <p v-else-if="previewError" class="text-xs text-red-600 flex items-center gap-1">
          <i class="pi pi-exclamation-triangle"></i> {{ previewError }}
        </p>

        <table class="w-full text-sm">
          <thead class="text-gray-500">
            <tr>
              <th class="text-left font-medium py-2">Room</th>
              <th class="text-right font-medium py-2 w-20">Nights</th>
              <th class="text-right font-medium py-2 w-36">Rate</th>
              <th class="text-right font-medium py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="li in displayInvoice.line_items" :key="li.stay_id" class="border-t border-gray-100">
              <td class="py-2 text-gray-800">{{ li.room_type }} - {{ li.room_number }}</td>
              <td class="py-2 text-right text-gray-700">{{ li.nights }}</td>
              <td class="py-2 text-right">
                <span v-if="isLocked">{{ money(li.rate) }}</span>
                <InputNumber
                  v-else
                  :modelValue="lineRate(li)"
                  :min="0"
                  mode="decimal"
                  :minFractionDigits="2"
                  class="w-32"
                  inputClass="w-32 text-right"
                  @update:modelValue="(v) => setLineRate(li.category_id, v)"
                />
              </td>
              <td class="py-2 text-right">{{ money(li.amount) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="!isLocked" class="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Discount (Rs)</label>
            <InputNumber v-model="editDiscount" :min="0" class="w-full" inputClass="w-full" @update:modelValue="scheduleInvoicePreview" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">GST % override</label>
            <InputNumber v-model="editGst" :min="0" :max="100" placeholder="Per-slab" class="w-full" inputClass="w-full" @update:modelValue="scheduleInvoicePreview" />
          </div>
        </div>

        <div class="border-t border-gray-200 pt-3 space-y-1 text-sm relative">
          <div v-if="isPreviewLoading" class="absolute inset-0 bg-white/60 flex items-center justify-center">
            <ProgressSpinner style="width: 28px; height: 28px" strokeWidth="6" />
          </div>
          <div class="flex justify-between"><span class="text-gray-600">Subtotal</span><span>{{ money(displayInvoice.subtotal) }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Discount</span><span>- {{ money(displayInvoice.discount_amount) }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">GST</span><span>{{ money(displayInvoice.gst_amount) }}</span></div>
          <div class="flex justify-between font-semibold text-gray-900 text-base"><span>Total</span><span>{{ money(displayInvoice.total_amount) }}</span></div>
        </div>
      </div>
      <template #footer>
        <Button label="Close" text @click="isDetailVisible = false" />
        <Button label="Print" icon="pi pi-print" severity="secondary" :disabled="!displayInvoice" @click="printInvoice" />
        <Button label="Save changes" icon="pi pi-check" :loading="isSaving" :disabled="isLocked || isPreviewLoading || !invoicePreview" @click="saveInvoice" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

import InputNumber from 'primevue/inputnumber';
import { useFetchInvoices, useInvoiceActions, uniformGstRate, type Invoice } from '~/composables/useInvoices';
import { useFetchHotel } from '~/composables/useHotel';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import { useAPIHelper } from '~/composables/useAPIHelper';
import { formatDateTimeCompactInHotelTz } from '~/utils/dateFormat';
import { generateInvoicePdf } from '~/utils/invoicePdf';
import { generateInvoiceReportPdf } from '~/utils/invoiceReportPdf';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { getErrorMessage } = useAPIHelper();
const { previewInvoice, retrieveInvoice, updateInvoice, lockAllInvoices, generateReport } = useInvoiceActions();

// Hotel record (cached query, shared with the layout) — for the invoice logo
const { hotelId } = storeToRefs(useAuthStore());
const { data: hotelData } = useFetchHotel(hotelId);

const money = (x: number | string | null | undefined) => `Rs ${(Number(x) || 0).toFixed(2)}`;

// --- Filters (synced to route query) ---
const asLocalDate = (d: Date) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD, local
const today = asLocalDate(new Date());
const weekAgo = asLocalDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
const searchQuery = ref((route.query.q as string) || '');
const lockedFilter = ref((route.query.is_locked as string) || '');
const dateFrom = ref((route.query.date_from as string) || weekAgo);
const dateTo = ref((route.query.date_to as string) || today);
const lockedOptions = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'false' },
  { label: 'Locked', value: 'true' }
];

const pageSize = computed(() => Number(route.query.page_size) || 10);
const currentPage = computed(() => Number(route.query.page) || 1);

// --- Data ---
const { invoices, isLoading, error, refetch } = useFetchInvoices();
const invoiceRows = computed<Invoice[]>(() => invoices.value?.results || []);
const totalRecords = computed(() => invoices.value?.count || 0);

const guestName = (inv: Invoice) => inv.line_items?.[0]?.guest_names?.[0] || '—';

// --- Route query sync ---
const updateRouteQuery = async (updates: Record<string, any>) => {
  const nextQuery: Record<string, any> = { ...route.query, ...updates };
  Object.keys(nextQuery).forEach((key) => {
    const value = nextQuery[key];
    if (value === undefined || value === null || value === '') delete nextQuery[key];
  });
  await router.replace({ query: nextQuery });
};

const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
watch(searchQuery, (value) => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    updateRouteQuery({ q: value.trim() || undefined, page: 1 });
  }, 350);
});

const onLockedChange = () => updateRouteQuery({ is_locked: lockedFilter.value || undefined, page: 1 });
const onDateChange = () => updateRouteQuery({ date_from: dateFrom.value || undefined, date_to: dateTo.value || undefined, page: 1 });
const onPageChange = (event: any) => updateRouteQuery({ page: event.page + 1, page_size: event.rows || pageSize.value });

onBeforeUnmount(() => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
});

// default the date range to today on first load (so the list filters to today)
onMounted(() => {
  if (!route.query.date_from && !route.query.date_to) {
    updateRouteQuery({ date_from: dateFrom.value, date_to: dateTo.value });
  }
});

// --- Generate report (all invoices for the active filters, unpaginated) ---
const isReporting = ref(false);
const handleGenerateReport = async () => {
  isReporting.value = true;
  try {
    const filters: Record<string, any> = {};
    ['q', 'is_locked', 'date_from', 'date_to'].forEach((k) => {
      if (route.query[k]) filters[k] = route.query[k];
    });
    const rows = await generateReport(filters);
    if (!rows.length) {
      toast.add({ severity: 'info', summary: 'No invoices', detail: 'No invoices in this period.', life: 4000 });
      return;
    }
    const pdf = await generateInvoiceReportPdf(rows, {
      hotelName: hotelData.value?.name,
      logoUrl: hotelData.value?.logo_url,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    });
    pdf.save(`invoices-${dateFrom.value}-to-${dateTo.value}.pdf`);
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Report failed', detail: getErrorMessage(err), life: 4000 });
  } finally {
    isReporting.value = false;
  }
};

// --- Lock all ---
const isLockDialogVisible = ref(false);
const lockDate = ref(today);
const isLocking = ref(false);
const handleLockAll = async () => {
  if (!lockDate.value) return;
  isLocking.value = true;
  try {
    const res = await lockAllInvoices(lockDate.value);
    toast.add({ severity: 'success', summary: 'Invoices locked', detail: `${res?.locked_count ?? 0} invoice(s) locked.`, life: 4000 });
    isLockDialogVisible.value = false;
    lockDate.value = '';
    await refetch();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Lock failed', detail: getErrorMessage(err), life: 4000 });
  } finally {
    isLocking.value = false;
  }
};

// --- Detail / edit / print ---
// Editing is preview-driven: rate/discount/GST overrides re-run `preview` (the authoritative
// calculator) for live totals; Save PATCHes the previewed lines. Locked invoices stay read-only
// on their STORED numbers (preview recomputes from current booking data, which can differ).
const isDetailVisible = ref(false);
const isDetailLoading = ref(false);
const isSaving = ref(false);
const isPreviewLoading = ref(false);
const previewError = ref<string | null>(null);
const selectedInvoice = ref<Invoice | null>(null); // stored invoice
const invoicePreview = ref<Invoice | null>(null);   // live computed (unlocked edits)
const editDiscount = ref<number | null>(null);
const editGst = ref<number | null>(null);
const editRoomRates = ref<Record<string, number>>({}); // category_id -> rate override
const previewDebounce = ref<ReturnType<typeof setTimeout> | null>(null);

const isLocked = computed(() => !!selectedInvoice.value?.is_locked);
// what the dialog renders: live preview while editing, otherwise the stored invoice
const displayInvoice = computed<Invoice | null>(() => invoicePreview.value || selectedInvoice.value);

const lineRate = (li: any) => editRoomRates.value[li.category_id] ?? Number(li.rate);
const setLineRate = (categoryId: number, value: number | null) => {
  if (value === null) delete editRoomRates.value[categoryId];
  else editRoomRates.value[categoryId] = value;
  scheduleInvoicePreview();
};

const buildPreviewBody = () => {
  const body: any = { booking_id: selectedInvoice.value?.booking };
  const rates: Record<string, string> = {};
  Object.entries(editRoomRates.value).forEach(([cat, val]) => {
    if (val !== null && val !== undefined) rates[cat] = String(val);
  });
  if (Object.keys(rates).length) body.room_rates = rates;
  if (editDiscount.value) body.discount_amount = String(editDiscount.value);
  if (editGst.value !== null && editGst.value !== undefined) body.gst_rate = editGst.value;
  return body;
};

const loadInvoicePreview = async () => {
  if (!selectedInvoice.value?.booking) return;
  isPreviewLoading.value = true;
  previewError.value = null;
  try {
    invoicePreview.value = await previewInvoice(buildPreviewBody());
  } catch (err) {
    previewError.value = getErrorMessage(err);
  } finally {
    isPreviewLoading.value = false;
  }
};

const scheduleInvoicePreview = () => {
  if (previewDebounce.value) clearTimeout(previewDebounce.value);
  previewDebounce.value = setTimeout(loadInvoicePreview, 350);
};

const openInvoice = async (id?: number) => {
  if (!id) return;
  selectedInvoice.value = null;
  invoicePreview.value = null;
  previewError.value = null;
  editRoomRates.value = {};
  editDiscount.value = null;
  editGst.value = null;
  isDetailVisible.value = true;
  isDetailLoading.value = true;
  try {
    const inv = await retrieveInvoice(id);
    selectedInvoice.value = inv;
    if (!inv.is_locked) {
      // seed overrides from stored values so the first preview reproduces the saved invoice
      editDiscount.value = Number(inv.discount_amount) || 0;
      editGst.value = uniformGstRate(inv.line_items);
      (inv.line_items || []).forEach((li: any) => {
        editRoomRates.value[li.category_id] = Number(li.rate) || 0;
      });
      await loadInvoicePreview();
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed to load invoice', detail: getErrorMessage(err), life: 4000 });
    isDetailVisible.value = false;
  } finally {
    isDetailLoading.value = false;
  }
};

const saveInvoice = async () => {
  const inv = selectedInvoice.value;
  const preview = invoicePreview.value;
  if (!inv?.id || !preview) return;
  isSaving.value = true;
  try {
    const body: any = {
      // persist exactly what preview computed, so PATCH totals match the live view
      line_items: (preview.line_items || []).map((li: any) => ({
        stay_id: li.stay_id,
        room_number: li.room_number,
        room_type: li.room_type,
        nights: Number(li.nights),
        rate: String(Number(li.rate)),
        amount: String(Number(li.amount))
      })),
      discount_amount: String(editDiscount.value ?? 0)
    };
    if (editGst.value !== null && editGst.value !== undefined) body.gst_rate = editGst.value;

    const updated = await updateInvoice(inv.id, body);
    selectedInvoice.value = updated;
    invoicePreview.value = updated.is_locked ? null : updated;
    toast.add({ severity: 'success', summary: 'Invoice updated', detail: 'Changes saved.', life: 3000 });
    await refetch();
  } catch (err: any) {
    if (err?.status === 423) {
      toast.add({ severity: 'warn', summary: 'Invoice locked', detail: 'This invoice is locked and was refreshed.', life: 4000 });
      const fresh = await retrieveInvoice(inv.id);
      selectedInvoice.value = fresh;
      invoicePreview.value = null;
      await refetch();
    } else {
      toast.add({ severity: 'error', summary: 'Update failed', detail: getErrorMessage(err), life: 4000 });
    }
  } finally {
    isSaving.value = false;
  }
};

const printInvoice = async () => {
  const inv = displayInvoice.value;
  if (!inv) return;
  const pdf = await generateInvoicePdf(inv, hotelData.value?.logo_url);
  pdf.save(`${inv.invoice_number || selectedInvoice.value?.invoice_number || 'invoice'}.pdf`);
};

onBeforeUnmount(() => {
  if (previewDebounce.value) clearTimeout(previewDebounce.value);
});
</script>
