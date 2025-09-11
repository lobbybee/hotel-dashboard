<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 class="text-2xl font-bold text-gray-800">Transaction History</h2>
      
      <div class="flex flex-wrap gap-3">
        <Button 
          label="Refresh" 
          icon="pi pi-refresh" 
          @click="emit('refresh')"
          class="p-button-outlined p-button-sm"
        />
      </div>
    </div>
    
    <div v-if="!transactions || transactions.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <i class="pi pi-history text-2xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Transactions Found</h3>
      <p class="text-gray-500">There are no transactions associated with your account.</p>
    </div>
    
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <DataTable 
        :value="transactions" 
        :paginator="true" 
        :rows="10"
        responsiveLayout="scroll"
        stripedRows
        class="rounded-lg"
      >
        <Column field="id" header="Transaction ID" :sortable="true">
          <template #body="slotProps">
            <span class="font-mono text-sm">{{ slotProps.data.id.substring(0, 8) }}...</span>
          </template>
        </Column>
        
        <Column field="plan.name" header="Plan" :sortable="true">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-list"></i>
              <span>{{ slotProps.data.plan?.name }}</span>
            </div>
          </template>
        </Column>
        
        <Column field="amount" header="Amount" :sortable="true">
          <template #body="slotProps">
            <span class="font-semibold">${{ parseFloat(slotProps.data.amount).toFixed(2) }}</span>
          </template>
        </Column>
        
        <Column field="transaction_type" header="Type" :sortable="true">
          <template #body="slotProps">
            <Badge 
              :value="slotProps.data.transaction_type" 
              :severity="getTransactionTypeSeverity(slotProps.data.transaction_type)" 
            />
          </template>
        </Column>
        
        <Column field="status" header="Status" :sortable="true">
          <template #body="slotProps">
            <Badge 
              :value="slotProps.data.status" 
              :severity="getTransactionStatusSeverity(slotProps.data.status)" 
            />
          </template>
        </Column>
        
        <Column field="created_at" header="Date" :sortable="true">
          <template #body="slotProps">
            <span>{{ formatDate(slotProps.data.created_at) }}</span>
          </template>
        </Column>
        
        <Column header="Actions">
          <template #body="slotProps">
            <Button 
              icon="pi pi-eye" 
              class="p-button-sm p-button-outlined" 
              @click="viewTransactionDetails(slotProps.data)"
              label="View"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    
    <!-- Transaction Details Dialog -->
    <Dialog 
      v-model:visible="transactionDialogVisible" 
      header="Transaction Details"
      :modal="true"
      :style="{ width: '500px' }"
      :draggable="false"
      :closeOnEscape="true"
      :dismissableMask="true"
    >
      <div v-if="selectedTransaction" class="space-y-4">
        <div class="grid grid-cols-1 gap-3">
          <div class="flex justify-between">
            <span class="font-semibold">Transaction ID:</span>
            <span class="font-mono">{{ selectedTransaction.id }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="font-semibold">Plan:</span>
            <span>{{ selectedTransaction.plan?.name }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="font-semibold">Amount:</span>
            <span class="font-semibold">${{ parseFloat(selectedTransaction.amount).toFixed(2) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="font-semibold">Type:</span>
            <Badge 
              :value="selectedTransaction.transaction_type" 
              :severity="getTransactionTypeSeverity(selectedTransaction.transaction_type)" 
            />
          </div>
          
          <div class="flex justify-between">
            <span class="font-semibold">Status:</span>
            <Badge 
              :value="selectedTransaction.status" 
              :severity="getTransactionStatusSeverity(selectedTransaction.status)" 
            />
          </div>
          
          <div class="flex justify-between">
            <span class="font-semibold">Date:</span>
            <span>{{ formatDate(selectedTransaction.created_at) }}</span>
          </div>
          
          <div v-if="selectedTransaction.transaction_id" class="flex justify-between">
            <span class="font-semibold">External ID:</span>
            <span class="font-mono">{{ selectedTransaction.transaction_id }}</span>
          </div>
          
          <div v-if="selectedTransaction.notes" class="flex flex-col">
            <span class="font-semibold">Notes:</span>
            <span class="mt-1">{{ selectedTransaction.notes }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="closeTransactionDialog" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import type { Transaction } from '~/composables/usePayments';

// Props
const props = defineProps<{
  transactions: Transaction[] | undefined;
}>();

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// Dialog state
const transactionDialogVisible = ref(false);
const selectedTransaction = ref<any>(null);

// Helper functions
const getTransactionTypeSeverity = (type: string) => {
  switch (type) {
    case 'subscription': return 'info';
    case 'manual': return 'warning';
    default: return 'secondary';
  }
};

const getTransactionStatusSeverity = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'danger';
    case 'cancelled': return 'secondary';
    default: return 'secondary';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Dialog actions
const viewTransactionDetails = (transaction: any) => {
  selectedTransaction.value = transaction;
  transactionDialogVisible.value = true;
};

const closeTransactionDialog = () => {
  transactionDialogVisible.value = false;
  selectedTransaction.value = null;
};
</script>

<style scoped>
/* Fade up transition */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>