<template>
    <div class="flex flex-wrap gap-2 mb-4">
        <Tag icon="pi pi-check-circle" severity="success" value="Available" rounded />
        <Tag icon="pi pi-user" severity="info" value="Occupied" rounded />
        <Tag icon="pi pi-spin pi-spinner" severity="warning" value="Cleaning" rounded />
        <Tag icon="pi pi-wrench" severity="warning" value="Maintenance" rounded />
        <Tag icon="pi pi-ban" severity="danger" value="Out of Order" rounded />
    </div>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
</script>