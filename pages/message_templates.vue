<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <MsgTemplateHeader />

      <MsgTemplateLoading v-if="isLoading && !templatesData" />

      <MsgTemplateError 
        v-else-if="error" 
        :message="error.message"
        @retry="retryFetch"
      />

      <template v-else-if="templatesData">
        <div v-if="totalRecords > 0" class="space-y-6">
          <MsgTemplateList 
            :templates="templates"
            :customSteps="customSteps || []"
            :is-creating-id="isCreatingId"
            @customize="handleCustomize"
            @edit="handleEdit"
            @revert="handleRevert"
          />
          <Paginator
            v-if="totalRecords > rows"
            :rows="rows"
            :total-records="totalRecords"
            @page="onPage"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            class="justify-center"
          />
          
        </div>
        <MsgTemplateEmpty v-else />
      </template>

    </div>
  </div>

  <MsgTemplateFormDialog 
    @save="handleSave"
  />

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Paginator from 'primevue/paginator';
import { 
  useFetchCustomizableStepTemplates, 
  useFetchFlowSteps, 
  useCreateFlowStep, 
  useUpdateFlowStep
} from '~/composables/useFlow';
import type { FlowStep, FlowStepTemplate } from '~/composables/useFlow';
import { useMessageFlowStore } from '~/stores/flow';

// --- Store ---
const store = useMessageFlowStore();

// --- Data Fetching ---
const page = ref(1);
const rows = ref(10);
const templateOptions = computed(() => ({ page: page.value, page_size: rows.value }));
const customStepsOptions = computed(() => ({ page_size: 999 }));

const { 
  data: templatesData, 
  isLoading: templatesLoading, 
  error: templatesError, 
  refetch: refetchTemplates 
} = useFetchCustomizableStepTemplates(templateOptions);

const { 
  data: customStepsData, 
  isLoading: stepsLoading, 
  error: stepsError, 
  refetch: refetchCustomSteps 
} = useFetchFlowSteps(customStepsOptions);

const templates = computed(() => templatesData.value?.results || []);
const customSteps = computed(() => customStepsData.value?.results || []);
const totalRecords = computed(() => templatesData.value?.count || 0);

const isLoading = computed(() => templatesLoading.value || stepsLoading.value);
const error = computed(() => templatesError.value || stepsError.value);

const retryFetch = () => {
  refetchTemplates();
  refetchCustomSteps();
};

const onPage = (event: { page: number, rows: number }) => {
  page.value = event.page + 1;
  rows.value = event.rows;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- State Management ---
const isCreatingId = ref<number | null>(null);

// --- Composables for Mutations ---
const { createFlowStep } = useCreateFlowStep();
const { updateFlowStep } = useUpdateFlowStep();

// --- Event Handlers ---
const handleCustomize = async (templateId: number) => {
  isCreatingId.value = templateId;
  try {
    await createFlowStep({ template: templateId });
    await refetchCustomSteps();
  } catch (err: any) {
    console.error(err);
  } finally {
    isCreatingId.value = null;
  }
};

const handleEdit = (template: FlowStep | FlowStepTemplate) => {
  store.showFormDialog(template, customSteps.value);
};

const handleRevert = (template: FlowStep | FlowStepTemplate) => {
  // Placeholder for future revert logic
};

const handleSave = async (formData: any) => {
  if (!formData || !formData.id) return;

  store.setUpdating(true);
  try {
    await updateFlowStep({
      id: formData.id,
      data: formData.data
    });
    await refetchCustomSteps();
    store.hideFormDialog();
  } catch (err: any) {
    console.error(err);
  } finally {
    store.setUpdating(false);
  }
};
</script>

<style scoped>
/* Add any page-specific styles here */
</style>