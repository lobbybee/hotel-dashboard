<template>
    <div class="flex items-stretch gap-2">
        <Button
            icon="pi pi-minus"
            outlined
            severity="secondary"
            aria-label="One day earlier"
            class="shrink-0 w-10"
            :disabled="!canStepBack"
            @click="step(-1)"
        />
        <Calendar
            :id="id"
            :modelValue="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            class="flex-1 min-w-0"
            showIcon
            showTime
            hourFormat="12"
            dateFormat="dd-mm-yy"
            :stepMinute="CHECKOUT_MINUTE_STEP"
            :minDate="minDate"
        />
        <Button
            icon="pi pi-plus"
            outlined
            severity="secondary"
            aria-label="One day later"
            class="shrink-0 w-10"
            @click="step(1)"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import {
    CHECKOUT_MINUTE_STEP,
    addDays,
    defaultCheckoutDate,
} from "~/utils/dateFormat";

const props = withDefaults(
    defineProps<{
        modelValue: Date | null;
        id?: string;
        /** Hotel checkout time as HH:MM, used when the field is still empty. */
        checkoutTime?: string;
        minDate?: Date;
    }>(),
    { minDate: () => new Date() },
);

const emit = defineEmits<{ "update:modelValue": [value: Date] }>();

// Stepping an empty field starts from the hotel's default rather than doing nothing.
const step = (days: number) => {
    if (!props.modelValue) {
        emit("update:modelValue", defaultCheckoutDate(props.checkoutTime));
        return;
    }
    emit("update:modelValue", addDays(props.modelValue, days));
};

const canStepBack = computed(() => {
    if (!props.modelValue) return true;
    return addDays(props.modelValue, -1) >= props.minDate;
});
</script>
