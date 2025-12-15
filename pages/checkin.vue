<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <CheckinHeader />

      <TabView v-model:activeIndex="activeTabIndex" class="w-full">
        <TabPanel header="Pending Stays">
          <CheckinPendingStaysTab />
        </TabPanel>
        <TabPanel header="Manual Walk-in">
          <CheckinManualWalkinTab @checkin-success="handleCheckinSuccess" />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import CheckinManualWalkinTab from '~/components/Checkin/ManualWalkinTab.vue';

// Tab state management
const activeTabIndex = ref(0); // 0 = Pending Stays, 1 = Manual Walk-in

// Handle successful check-in by switching to Pending Stays tab
const handleCheckinSuccess = () => {
  activeTabIndex.value = 0; // Switch to Pending Stays tab
};
</script>
