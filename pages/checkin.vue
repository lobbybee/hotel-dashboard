<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <CheckinHeader />

      <TabView class="w-full">
        <TabPanel header="Pending Stays">
          <CheckinPendingStaysTab />
        </TabPanel>
        <TabPanel header="Manual Walk-in">
          <CheckinManualWalkinTab />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

// The logic has been moved to the child components.
// This parent component now only serves as a layout container.
</script>