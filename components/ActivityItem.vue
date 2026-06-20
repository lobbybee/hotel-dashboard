<template>
  <div class="relative flex gap-4" :class="compact ? 'pb-4' : 'pb-6'">
    <!-- Node on the spine -->
    <div
      class="relative z-10 flex-shrink-0 rounded-full ring-4 ring-white flex items-center justify-center"
      :class="[meta.node, compact ? 'w-8 h-8' : 'w-9 h-9']"
    >
      <i :class="[meta.icon, compact ? 'text-xs' : 'text-sm']"></i>
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1" :class="compact ? '' : 'pt-1'">
      <p class="text-sm text-gray-900 leading-snug break-words">{{ activity.message }}</p>
      <p class="mt-0.5 text-xs text-gray-500">
        <span class="font-medium text-gray-700">{{ activity.actor_name || 'System' }}</span>
        <span class="mx-1.5 text-gray-300">·</span>
        <span :title="exactTime">{{ relativeTime }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RecentActivity } from '~/composables/useStaff';
import { actionMeta, timeAgo } from '~/utils/activityMeta';
import { formatDateTimeCompactInHotelTz } from '~/utils/dateFormat';

const props = defineProps<{ activity: RecentActivity; compact?: boolean }>();

const meta = computed(() => actionMeta(props.activity.action));
const relativeTime = computed(() => timeAgo(props.activity.created_at));
const exactTime = computed(() => formatDateTimeCompactInHotelTz(props.activity.created_at));
</script>
