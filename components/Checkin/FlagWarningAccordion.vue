<template>
  <div v-if="flagSummary && flagSummary.is_flagged && flagSummary.flags && flagSummary.flags.length > 0" class="mb-4">
    <!-- Single Warning Card with Integrated Badge -->
    <div class="p-4 rounded-lg border-l-4 shadow-md transition-all duration-200"
         :class="flagSummary.police_flagged ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'">
      
      <!-- Header with Icon and Title -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <i class="pi pi-exclamation-triangle text-2xl" 
               :class="flagSummary.police_flagged ? 'text-red-600' : 'text-amber-600'"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-gray-900">Caution: This user is flagged</h3>
            <Badge :value="flagSummary.police_flagged ? 'Police Flagged' : 'Hotel Flagged'" 
                   :severity="flagSummary.police_flagged ? 'danger' : 'warning'"
                   class="mt-2" />
          </div>
        </div>
      </div>

      <!-- Quick Summary (always visible) -->
      <div class="text-sm text-gray-600 mb-3">
        This guest has {{ flagSummary.flags.length }} flag(s) in the system.
        <Button 
          label="View Details" 
          text 
          size="small"
          @click="showDetails = !showDetails"
          class="p-button-text p-0 h-auto font-semibold underline"
          :class="flagSummary.police_flagged ? 'text-red-700 hover:text-red-800' : 'text-amber-700 hover:text-amber-800'"
        />
      </div>

      <!-- Expandable Details Section -->
      <Transition name="slide-down">
        <div v-if="showDetails" class="mt-3 pt-3 border-t"
             :class="flagSummary.police_flagged ? 'border-red-200' : 'border-amber-200'">
          <div class="space-y-2">
            <div v-for="(flag, index) in displayedFlags" :key="flag.id" 
                 class="p-3 rounded-lg bg-white/70 backdrop-blur-sm border"
                 :class="flagSummary.police_flagged ? 'border-red-200' : 'border-amber-200'">
              <div class="flex items-start gap-2">
                <i class="pi pi-info-circle mt-1 text-sm" 
                   :class="flagSummary.police_flagged ? 'text-red-500' : 'text-amber-500'"></i>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 mb-2">{{ flag.global_note }}</p>
                  <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span v-if="flag.source" class="flex items-center gap-1">
                      <i class="pi pi-building text-xs"></i>
                      <strong>Source:</strong> {{ flag.source }}
                    </span>
                    <span v-if="flag.flagged_by" class="flex items-center gap-1">
                      <i class="pi pi-user text-xs"></i>
                      <strong>By:</strong> {{ flag.flagged_by || 'N/A' }}
                    </span>
                    <span v-if="flag.flagged_date" class="flex items-center gap-1">
                      <i class="pi pi-calendar text-xs"></i>
                      <strong>Date:</strong> {{ formatDate(flag.flagged_date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Show More/Less Button -->
          <div v-if="hasMoreFlags" class="text-center mt-3">
            <Button 
              :label="showAllFlags ? 'Show Less' : `Show More (${remainingFlags} more)`" 
              text 
              size="small"
              @click="showAllFlags = !showAllFlags"
              class="p-button-text text-sm font-medium"
              :class="flagSummary.police_flagged ? 'text-red-700' : 'text-amber-700'"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Badge from 'primevue/badge';
import Button from 'primevue/button';

interface Flag {
  id: number;
  global_note: string;
  flagged_by_police: boolean;
  source: string;
  flagged_by: string;
  flagged_date: string;
  hotel_name?: string | null;
  internal_rating?: number | null;
}

interface FlagSummary {
  is_flagged: boolean;
  police_flagged: boolean;
  flags: Flag[];
}

const props = defineProps<{
  flagSummary: FlagSummary | null | undefined;
}>();

const showDetails = ref(false);
const showAllFlags = ref(false);

const displayedFlags = computed(() => {
  if (!props.flagSummary?.flags) return [];
  
  if (showAllFlags.value) {
    return props.flagSummary.flags;
  }
  
  return props.flagSummary.flags.slice(0, 5);
});

const hasMoreFlags = computed(() => {
  return props.flagSummary?.flags && props.flagSummary.flags.length > 5;
});

const remainingFlags = computed(() => {
  if (!props.flagSummary?.flags) return 0;
  return Math.max(0, props.flagSummary.flags.length - 5);
});

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}
</style>