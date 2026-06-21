<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">GST Slabs</h2>
      <p class="text-sm text-gray-600">
        GST rate by nightly room rate. Each tier covers everything up to its ceiling.
        Leave unset to use India defaults (0 / 5 / 18%).
      </p>
    </div>

    <!-- Column labels -->
    <div class="grid grid-cols-[1.25rem_minmax(0,1fr)_9rem] items-center gap-x-3 text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
      <span></span>
      <span>Room rate (per night)</span>
      <span class="text-right pr-9">GST</span>
    </div>

    <!-- Rate ladder: a single continuous scale of contiguous brackets -->
    <div class="relative">
      <!-- the rail -->
      <span class="gst-rail absolute left-[7px] top-4 bottom-4 w-0.5 bg-indigo-200" aria-hidden="true"></span>

      <div
        v-for="(slab, i) in slabs"
        :key="i"
        class="relative grid grid-cols-[1.25rem_minmax(0,1fr)_9rem] items-center gap-x-3 py-3"
      >
        <!-- node on the rail -->
        <span
          class="relative z-10 w-3.5 h-3.5 rounded-full border-2 border-indigo-300 bg-white shrink-0"
          :class="{ 'border-indigo-500 bg-indigo-500': slab.max_rate === null }"
          aria-hidden="true"
        ></span>

        <!-- range -->
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-sm text-gray-500 whitespace-nowrap">₹{{ formatINR(fromValue(i)) }}</span>
          <template v-if="slab.max_rate !== null">
            <span class="text-gray-300">–</span>
            <InputNumber
              v-model="slab.max_rate"
              mode="currency"
              currency="INR"
              locale="en-IN"
              :min="0"
              :maxFractionDigits="0"
              class="w-32 max-w-full"
              inputClass="w-full"
              :inputProps="{ 'aria-label': `Tier ${i + 1} rate ceiling` }"
            />
          </template>
          <template v-else>
            <span class="text-sm font-medium text-indigo-600 whitespace-nowrap">and above</span>
            <span class="text-indigo-400 text-lg leading-none" aria-hidden="true">∞</span>
          </template>
        </div>

        <!-- percent + remove (open-ended top tier is permanent) -->
        <div class="flex items-center gap-1 justify-end min-w-0">
          <InputNumber
            v-model="slab.gst_value"
            suffix="%"
            :min="0"
            :max="100"
            :maxFractionDigits="2"
            class="flex-1 min-w-0"
            inputClass="w-full"
            :inputProps="{ 'aria-label': `Tier ${i + 1} GST percent` }"
          />
          <Button
            v-if="slab.max_rate !== null"
            icon="pi pi-trash"
            text
            severity="danger"
            size="small"
            class="shrink-0"
            :aria-label="`Remove tier ${i + 1}`"
            @click="remove(i)"
          />
          <span v-else class="w-8 shrink-0"></span>
        </div>
      </div>
    </div>

    <small v-if="error" class="text-red-500 text-sm mt-1 block">{{ error }}</small>

    <div class="flex items-center justify-between mt-4">
      <Button label="Add tier" icon="pi pi-plus" text size="small" @click="addTier" />
      <Button
        label="Save GST"
        icon="pi pi-check"
        :loading="isLoading"
        @click="save"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import type { GstSlab } from '~/types/hotel';
import { GST_DEFAULTS, validateGstSlabs } from '~/utils/gst';

const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  }
});

const toast = useToast();
const { mutateAsync: patchGstSlabs, isLoading } = usePatchGstSlabs();

const slabs = ref<GstSlab[]>([]);
const error = ref('');

// Seed from the hotel's slabs (clone so edits stay local), else India defaults.
watch(
  () => props.hotel,
  (h) => {
    const existing = h?.gst_slabs as GstSlab[] | undefined;
    slabs.value = (existing?.length ? existing : GST_DEFAULTS).map((s) => ({ ...s }));
  },
  { immediate: true, deep: true }
);

// The bracket "from" is the previous tier's ceiling — contiguous by construction.
const fromValue = (i: number) => (i === 0 ? 0 : slabs.value[i - 1]?.max_rate ?? 0);

const formatINR = (n: number) => n.toLocaleString('en-IN');

const addTier = () => {
  const last = slabs.value.length - 1; // open-ended tier
  const prevCeil = last > 0 ? slabs.value[last - 1]?.max_rate ?? 0 : 0;
  slabs.value.splice(Math.max(last, 0), 0, { max_rate: prevCeil + 1000, gst_value: 0 });
};

const remove = (i: number) => {
  slabs.value.splice(i, 1);
};

const save = async () => {
  error.value = validateGstSlabs(slabs.value) ?? '';
  if (error.value) return;
  try {
    await patchGstSlabs(slabs.value.map(({ id, max_rate, gst_value }) => ({ id, max_rate, gst_value })));
    toast.add({ severity: 'success', summary: 'Saved', detail: 'GST slabs updated', life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Save failed', detail: 'Could not update GST slabs. Please try again.', life: 5000 });
    console.error('Failed to update GST slabs:', e);
  }
};
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .gst-rail {
    transition: none;
  }
}
</style>
