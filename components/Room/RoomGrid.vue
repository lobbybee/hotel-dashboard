<template>
    <div>
        <div
            v-for="group in floorGroups"
            :key="group.floor"
            :id="`floor-${group.floor}`"
            class="scroll-mt-28 mb-6"
        >
            <!-- Floor header -->
            <div
                class="flex items-baseline gap-2 mb-3 pb-2 border-b border-gray-200"
            >
                <h3 class="text-lg font-bold text-gray-900">
                    Floor {{ group.floor }}
                </h3>
                <span class="text-sm text-gray-500"
                    >{{ group.rooms.length }}
                    {{ group.rooms.length === 1 ? "room" : "rooms" }}</span
                >
            </div>

            <div
                class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 sm:gap-3"
            >
                <div
                    v-for="room in group.rooms"
                    :key="room.id"
                    @click="$emit('toggle-room-selection', room)"
                    @keydown.enter.prevent="
                        $emit('toggle-room-selection', room)
                    "
                    @keydown.space.prevent="
                        $emit('toggle-room-selection', room)
                    "
                    role="checkbox"
                    :aria-checked="selectedRooms.includes(room.id)"
                    tabindex="0"
                    :aria-label="`Room ${room.room_number}, ${room.status}, Floor ${room.floor}, ${getCategoryName(room.category.id, categories)}`"
                    class="relative p-2 sm:p-3 rounded border-2 cursor-pointer transition-all duration-200 flex flex-col items-center hover:shadow-lg aspect-square"
                    :class="{
                        'border-green-200 bg-green-50 text-green-900 hover:border-green-300':
                            room.status === 'available',
                        'border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300':
                            room.status === 'occupied',
                        'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300':
                            room.status === 'cleaning',
                        'border-red-200 bg-red-50 text-red-900 hover:border-red-300':
                            room.status === 'maintenance',
                        'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300':
                            room.status === 'out_of_order',
                        'ring-4 ring-primary-500 ring-offset-1':
                            selectedRooms.includes(room.id),
                    }"
                >
                    <!-- pr-6 keeps the number clear of the edit pencil -->
                    <span
                        class="font-bold pr-6 max-w-full break-all leading-tight"
                        :class="
                            String(room.room_number).length > 10
                                ? 'text-[10px] sm:text-xs'
                                : String(room.room_number).length > 6
                                  ? 'text-xs sm:text-sm'
                                  : 'text-base sm:text-lg'
                        "
                        >{{ room.room_number }}</span
                    >
                    <span
                        class="text-xs text-gray-600 truncate max-w-full"
                        >{{
                            getCategoryName(room.category.id, categories)[0]
                        }}</span
                    >
                    <span
                        class="hidden sm:block text-xs text-gray-600 truncate max-w-full"
                    >
                        ₹
                        {{ getCategoryName(room.category.id, categories)[1] }}
                    </span>
                    <Tag
                        :value="statusLabel(room.status)"
                        :severity="getStatusSeverity(room.status)"
                        :aria-label="`Status: ${room.status}`"
                        class="mt-auto text-xs"
                    />
                    <Button
                        icon="pi pi-pencil"
                        text
                        rounded
                        :aria-label="`Edit room ${room.room_number}`"
                        class="absolute top-0 right-0 p-1 w-7 h-7"
                        @click.stop="$emit('edit-room', room)"
                    />
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div
            v-if="!floorGroups.length && !isLoading"
            class="text-center py-12"
        >
            <i class="pi pi-home text-6xl text-gray-300 opacity-50 mb-4"></i>
            <p class="text-gray-500 text-lg font-medium">No rooms found</p>
            <p class="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>

        <!-- Infinite scroll sentinel: entering the viewport pulls the next page.
             Observed against the viewport, not window scroll events, because the
             app layout scrolls inside <main>, not the window. -->
        <div ref="sentinel" class="h-px"></div>

        <div v-if="isLoading" class="flex justify-center py-6">
            <ProgressSpinner style="width: 2.5rem; height: 2.5rem" />
        </div>
        <p
            v-else-if="!hasMore && floorGroups.length"
            class="text-center text-sm text-gray-400 py-6"
        >
            All rooms loaded
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import Button from "primevue/button";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import type { Room, RoomCategory } from "~/types/room";

interface Props {
    rooms: Room[];
    selectedRooms: number[];
    categories: RoomCategory[];
    isLoading: boolean;
    hasMore: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "toggle-room-selection": [room: Room];
    "edit-room": [room: Room];
    "load-more": [];
}>();

// Rooms arrive sorted by (floor, room_number) from the API, so one pass preserves
// order and floors with no matching rooms simply never appear.
const floorGroups = computed(() => {
    const groups: { floor: number; rooms: Room[] }[] = [];
    for (const room of props.rooms) {
        const last = groups[groups.length - 1];
        if (last && last.floor === room.floor) last.rooms.push(room);
        else groups.push({ floor: room.floor, rooms: [room] });
    }
    return groups;
});

const sentinel = ref<HTMLElement | null>(null);
const isSentinelVisible = ref(false);
useIntersectionObserver(sentinel, ([entry]) => {
    isSentinelVisible.value = !!entry?.isIntersecting;
});

// Watching state rather than acting in the observer callback matters: if a page
// does not fill the viewport the sentinel stays intersecting and never fires a
// second time, so loading would stall after one page.
watch(
    [isSentinelVisible, () => props.isLoading, () => props.hasMore],
    ([visible, loading, more]) => {
        if (visible && more && !loading) emit("load-more");
    },
    { immediate: true },
);

const getCategoryName = (categoryId: number, categories: RoomCategory[]) => {
    const category = categories.find((c) => c.id === categoryId);
    return [category?.name ?? "Unknown", category?.base_price ?? "—"];
};

const statusLabel = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

const getStatusSeverity = (status?: string) => {
    const severityMap: Record<string, string> = {
        available: "success",
        occupied: "info",
        cleaning: "warning",
        maintenance: "danger",
        out_of_order: "secondary",
    };
    return severityMap[status ?? ""] || "secondary";
};
</script>
