<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Recent Activity</h1>
        <p class="text-gray-500 mt-1">Everything your team did, newest first.</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
        <span class="p-input-icon-left flex-1 min-w-[200px]">
          <i class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Search activity" class="w-full" />
        </span>
        <MultiSelect
          v-model="selectedActions"
          :options="actionOptions"
          option-label="label"
          option-value="value"
          placeholder="All actions"
          display="chip"
          class="min-w-[200px]"
          @change="applyActions"
        />
        <input
          type="date"
          v-model="dateFrom"
          aria-label="From date"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700"
          @change="applyDates"
        />
        <input
          type="date"
          v-model="dateTo"
          aria-label="To date"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700"
          @change="applyDates"
        />
      </div>

      <!-- Loading -->
      <div v-if="isLoading && !activities" class="flex justify-center py-16">
        <ProgressSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Couldn't load activity</h3>
        <p class="text-gray-600 mb-4">Something went wrong fetching the feed.</p>
        <Button label="Try again" icon="pi pi-refresh" @click="() => refetch()" />
      </div>

      <!-- Empty -->
      <div v-else-if="!groups.length" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-history text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ hasFilters ? 'No activity matches these filters' : 'No activity to show' }}
        </h3>
        <p class="text-gray-600">
          {{ hasFilters ? 'Try widening your search or clearing filters.' : 'Actions your team takes will appear here.' }}
        </p>
      </div>

      <!-- Timeline -->
      <div v-else class="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
        <div v-for="group in groups" :key="group.label" class="mb-2 last:mb-0">
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{{ group.label }}</p>
          <div class="relative">
            <span class="absolute left-[18px] top-0 bottom-0 w-px bg-gray-200" aria-hidden="true"></span>
            <div
              v-for="(item, i) in group.items"
              :key="item.id"
              class="ai-stagger"
              :style="{ animationDelay: `${Math.min(i, 8) * 40}ms` }"
            >
              <ActivityItem :activity="item" />
            </div>
          </div>
        </div>
      </div>

      <Paginator
        v-if="totalRecords > pageSize"
        class="mt-4"
        :rows="pageSize"
        :totalRecords="totalRecords"
        :first="(currentPage - 1) * pageSize"
        @page="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import { useFetchRecentActivity, type RecentActivity } from '~/composables/useStaff';
import { ACTION_OPTIONS } from '~/utils/activityMeta';
import { formatDateOnlyInHotelTz } from '~/utils/dateFormat';

const route = useRoute();
const router = useRouter();

const actionOptions = ACTION_OPTIONS;

// --- filter state (route-driven) ---
const searchQuery = ref((route.query.search as string) || '');
const selectedActions = ref<string[]>(((route.query.action as string) || '').split(',').filter(Boolean));
const dateFrom = ref((route.query.date_from as string) || '');
const dateTo = ref((route.query.date_to as string) || '');

const pageSize = computed(() => Number(route.query.page_size) || 10);
const currentPage = computed(() => Number(route.query.page) || 1);

const hasFilters = computed(
  () => !!(searchQuery.value || selectedActions.value.length || dateFrom.value || dateTo.value)
);

const keyParams = computed(() => {
  const p: Record<string, any> = {};
  ['action', 'actor', 'search', 'date_from', 'date_to', 'page', 'page_size'].forEach((k) => {
    if (route.query[k]) p[k] = route.query[k];
  });
  return p;
});

const { activities, isLoading, error, refetch } = useFetchRecentActivity(keyParams);

const totalRecords = computed(() => activities.value?.count || 0);

// --- group by day (hotel TZ), preserving newest-first order ---
const groups = computed(() => {
  const res = (activities.value?.results ?? []) as RecentActivity[];
  const todayKey = formatDateOnlyInHotelTz(new Date());
  const yesterdayKey = formatDateOnlyInHotelTz(new Date(Date.now() - 86_400_000));
  const out: { label: string; items: RecentActivity[] }[] = [];
  let last = '';
  for (const a of res) {
    const key = formatDateOnlyInHotelTz(a.created_at);
    if (key !== last) {
      out.push({ label: key === todayKey ? 'Today' : key === yesterdayKey ? 'Yesterday' : key, items: [] });
      last = key;
    }
    out[out.length - 1].items.push(a);
  }
  return out;
});

// --- route sync ---
const updateRouteQuery = async (updates: Record<string, any>) => {
  const nextQuery: Record<string, any> = { ...route.query, ...updates };
  Object.keys(nextQuery).forEach((k) => {
    const v = nextQuery[k];
    if (v === undefined || v === null || v === '') delete nextQuery[k];
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

const applyActions = () => updateRouteQuery({ action: selectedActions.value.join(',') || undefined, page: 1 });
const applyDates = () =>
  updateRouteQuery({ date_from: dateFrom.value || undefined, date_to: dateTo.value || undefined, page: 1 });

const onPageChange = (event: any) => {
  updateRouteQuery({ page: event.page + 1, page_size: event.rows || pageSize.value });
};

onBeforeUnmount(() => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value);
});
</script>

<style scoped>
.ai-stagger {
  animation: ai-fade-in 0.35s ease both;
}
@keyframes ai-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ai-stagger {
    animation: none;
  }
}
</style>
