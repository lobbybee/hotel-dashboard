<template>
  <div class="max-w-7xl mx-auto p-4">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Guest IDs</h1>
      <p class="text-gray-600">Search IDs collected at your hotel, plus IDs flagged anywhere on the platform</p>
    </div>

    <!-- Search -->
    <div class="mb-6 bg-white rounded-lg border border-gray-200 p-4">
      <div class="w-full sm:w-96">
        <label class="block text-xs font-medium text-gray-500 mb-1">Search</label>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="ID number, name, phone, email, register no. or type slug"
            class="w-full"
          />
        </IconField>
        <p class="text-xs text-gray-400 mt-1">Document type must be the slug, e.g. voter_id</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !documents" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
      <p class="text-gray-500 mt-4">Loading IDs...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load IDs</h3>
      <p class="text-gray-500 mb-4">{{ getErrorMessage(error) }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="refetch" />
    </div>

    <!-- Empty -->
    <div v-else-if="rows.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-id-card text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">No IDs found</p>
      <p class="text-gray-400 text-sm">
        {{ searchQuery ? 'Try a different search term.' : 'IDs appear here once guests check in.' }}
      </p>
    </div>

    <!-- List -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="text-left font-medium px-4 py-3 w-20">Scan</th>
              <th class="text-left font-medium px-4 py-3">Guest</th>
              <th class="text-left font-medium px-4 py-3">Document</th>
              <th class="text-left font-medium px-4 py-3">Number</th>
              <th class="text-left font-medium px-4 py-3">Contact</th>
              <th class="text-center font-medium px-4 py-3">Status</th>
              <th class="text-right font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="doc in rows"
              :key="rowKey(doc)"
              class="border-t border-gray-100 hover:bg-gray-50"
              :class="{ 'bg-red-50/40': doc.isFlagged }"
            >
              <td class="px-4 py-3">
                <!-- most scans are images; PDFs (and images that fail to load) fall back to a link -->
                <Image
                  v-if="doc.file_url && !brokenScans.has(doc.file_url) && !isPdf(doc.file_url)"
                  :src="doc.file_url"
                  :alt="`${formatDocumentType(doc.document_type)} scan`"
                  preview
                  imageClass="w-14 h-10 object-cover rounded border border-gray-200"
                  @error="brokenScans.add(doc.file_url)"
                />
                <Button
                  v-else-if="doc.file_url"
                  icon="pi pi-file"
                  text
                  size="small"
                  aria-label="Open scan"
                  @click="openScan(doc.file_url)"
                />
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900">{{ doc.guest_name || '—' }}</p>
                <p v-if="doc.register_number" class="text-xs text-gray-500">Reg. {{ doc.register_number }}</p>
                <p v-else-if="!doc.id" class="text-xs text-gray-400">Flagged at another hotel</p>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ formatDocumentType(doc.document_type) }}</td>
              <td class="px-4 py-3 font-mono text-gray-900">{{ doc.number }}</td>
              <td class="px-4 py-3 text-gray-600">
                <p>{{ doc.whatsapp_number || '—' }}</p>
                <p v-if="doc.email" class="text-xs text-gray-500">{{ doc.email }}</p>
              </td>
              <td class="px-4 py-3 text-center">
                <Tag :value="doc.isFlagged ? 'Flagged' : 'Clear'" :severity="doc.isFlagged ? 'danger' : 'success'" />
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <Button
                  v-if="doc.id"
                  label="Flag"
                  icon="pi pi-flag"
                  text
                  size="small"
                  severity="danger"
                  @click="openFlag(doc)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Paginator
        :rows="pageSize"
        :totalRecords="totalRecords"
        :first="(currentPage - 1) * pageSize"
        :rowsPerPageOptions="[10, 20, 50]"
        @page="onPageChange"
      />
    </div>

    <!-- Flag dialog -->
    <Dialog v-model:visible="isFlagDialogVisible" modal header="Flag this ID" :style="{ width: '30rem' }">
      <div v-if="flagTarget" class="space-y-4">
        <div class="p-3 bg-gray-50 rounded-lg text-sm">
          <p class="font-medium text-gray-900">{{ flagTarget.guest_name || 'Unnamed guest' }}</p>
          <p class="text-gray-600">
            {{ formatDocumentType(flagTarget.document_type) }} — {{ flagTarget.number }}
          </p>
        </div>
        <p class="text-sm text-gray-600">
          The flag follows this ID: the same type and number resolves as flagged at any hotel, on any phone number.
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reason <span class="text-red-500">*</span></label>
          <Textarea v-model="internalReason" rows="2" class="w-full" placeholder="e.g. Left without paying" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Note for other hotels</label>
          <Textarea v-model="globalNote" rows="2" class="w-full" placeholder="Shown to every hotel at check-in" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text :disabled="isFlagging" @click="isFlagDialogVisible = false" />
        <Button
          label="Flag ID"
          icon="pi pi-flag"
          severity="danger"
          :loading="isFlagging"
          :disabled="!internalReason.trim() || isFlagging"
          @click="submitFlag"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Image from 'primevue/image';
import Textarea from 'primevue/textarea';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { useAPIHelper } from '~/composables/useAPIHelper';
import {
  useFetchIdentityDocuments,
  useIdentityDocumentActions,
  formatDocumentType,
  type IdentityDocument
} from '~/composables/useIdentityDocuments';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { getErrorMessage } = useAPIHelper();
const { flagDocument } = useIdentityDocumentActions();

const searchQuery = ref((route.query.search as string) || '');
const pageSize = computed(() => Number(route.query.page_size) || 10);
const currentPage = computed(() => Number(route.query.page) || 1);

const { documents, isLoading, error, refetch } = useFetchIdentityDocuments();
const rows = computed<IdentityDocument[]>(() => documents.value?.results || []);
const totalRecords = computed(() => documents.value?.count || 0);

// flagged-elsewhere rows have no id; type + number identifies them
const rowKey = (doc: IdentityDocument) => doc.id ?? `${doc.document_type}:${doc.number}`;

const updateRouteQuery = async (updates: Record<string, any>) => {
  const nextQuery: Record<string, any> = { ...route.query, ...updates };
  Object.keys(nextQuery).forEach((key) => {
    const value = nextQuery[key];
    if (value === undefined || value === null || value === '') delete nextQuery[key];
  });
  await router.replace({ query: nextQuery });
};

const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null);
watch(searchQuery, (value) => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value);
  searchDebounce.value = setTimeout(() => {
    updateRouteQuery({ search: value.trim() || undefined, page: 1 });
  }, 350);
});

const onPageChange = (event: any) => {
  updateRouteQuery({ page: event.page + 1, page_size: event.rows || pageSize.value });
};

const openScan = (url: string) => window.open(url, '_blank', 'noopener');
const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);
// URLs whose thumbnail 404'd/expired — fall back to a link instead of a broken image
const brokenScans = reactive(new Set<string>());

// --- Flagging ---
const isFlagDialogVisible = ref(false);
const isFlagging = ref(false);
const flagTarget = ref<IdentityDocument | null>(null);
const internalReason = ref('');
const globalNote = ref('');

const openFlag = (doc: IdentityDocument) => {
  flagTarget.value = doc;
  internalReason.value = '';
  globalNote.value = '';
  isFlagDialogVisible.value = true;
};

const submitFlag = async () => {
  const doc = flagTarget.value;
  if (!doc?.id || isFlagging.value) return;
  isFlagging.value = true;
  try {
    // Posting twice creates two flags — the dialog closes on success so it can't be repeated.
    await flagDocument(doc.id, {
      internal_reason: internalReason.value.trim(),
      global_note: globalNote.value.trim()
    });
    isFlagDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'ID flagged', detail: 'Every hotel will see this at check-in.', life: 3000 });
    await refetch();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Flagging failed', detail: getErrorMessage(err), life: 5000 });
  } finally {
    isFlagging.value = false;
  }
};

onBeforeUnmount(() => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value);
});
</script>
