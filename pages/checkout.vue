<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="mb-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Guest Check-out</h1>
      <p class="text-gray-600">Manage guest departures and room turnover</p>
    </div>

    <div class="mb-6">
      <span class="p-input-icon-left w-full">
     
        <InputText
          v-model="searchQuery"
          placeholder="Search by guest name or room number..."
          class="w-full"
        />
      </span>
    </div>

        <div v-if="isLoading" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
      <p class="text-gray-500 mt-4">Loading active stays...</p>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading active stays</h3>
      <p class="text-gray-500 mb-4">{{ error?.message }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="refetch" />
    </div>

    <div v-else-if="filteredStays && filteredStays.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">No active stays</p>
      <p class="text-gray-400 text-sm">All rooms are currently available</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="stay in filteredStays"
        :key="stay.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <i class="pi pi-user text-primary-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ stay.guest.full_name }}</h3>
              <p class="text-sm text-gray-500">{{ stay.guest.email }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-home"></i>
              Room
            </span>
            <span class="font-semibold text-gray-900">{{ stay.room_details.room_number }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-tag"></i>
              Category
            </span>
            <Tag :value="stay.room_details.category" severity="info" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-phone"></i>
              WhatsApp
            </span>
            <span class="font-medium text-gray-900">{{ stay.guest.whatsapp_number || 'N/A' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-clock"></i>
              Billing Cycle
            </span>
            <Badge :value="stay.billing?.hours_24 ? '24 Hour' : '12 Hour'" :severity="stay.billing?.hours_24 ? 'info' : 'secondary'" />
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-plus text-green-600"></i>
            <span>Check-in: {{ formatDate(stay.check_in_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-minus text-red-600"></i>
            <span>Check-out: {{ formatDate(stay.check_out_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="pi pi-clock text-blue-600"></i>
            <span class="font-medium text-blue-600">{{ getDaysStayed(stay) }} night(s)</span>
          </div>
        </div>

        <Button
          label="Check Out"
          icon="pi pi-sign-out"
          class="w-full"
          severity="danger"
          @click="handleCheckout(stay)"
        />
        <Button
          label="View Guest"
          icon="pi pi-user"
          class="w-full mt-3"
          severity="info"
          outlined
          @click="handleViewGuest(stay)"
        />
      </div>
    </div>

    <!-- Guest Info Dialog -->
    <Dialog v-model:visible="isGuestInfoDialogVisible" modal header="Guest Information" :style="{ width: '600px' }">
      <div v-if="selectedStayForGuestInfo" class="space-y-4">
        <!-- Guest Details -->
        <div class="border-b pb-4">
          <h4 class="font-semibold text-lg mb-3">Guest Details</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.guest.full_name }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.guest.email || 'Not provided' }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">WhatsApp Number</label>
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.guest.whatsapp_number }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Nationality</label>
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.guest.nationality || 'Not provided' }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.guest.date_of_birth ? new Date(selectedStayForGuestInfo.guest.date_of_birth).toLocaleDateString() : 'Not provided' }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Preferred Language</label>
              <p class="font-medium text-gray-900">{{ getLanguageName(selectedStayForGuestInfo.guest.preferred_language) || 'Not specified' }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <Badge :value="selectedStayForGuestInfo.guest.status" :severity="getStatusSeverity(selectedStayForGuestInfo.guest.status)" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">WhatsApp Active</label>
              <Badge :value="selectedStayForGuestInfo.guest.is_whatsapp_active ? 'Active' : 'Inactive'" :severity="selectedStayForGuestInfo.guest.is_whatsapp_active ? 'success' : 'warning'" />
            </div>
          </div>
          <div v-if="selectedStayForGuestInfo.guest.notes" class="mt-3">
            <label class="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <p class="text-sm text-gray-700">{{ selectedStayForGuestInfo.guest.notes }}</p>
          </div>
        </div>

        <!-- Identity Documents -->
        <div class="border-b pb-4">
          <h4 class="font-semibold text-lg mb-3">Identity Documents</h4>
          <div v-if="selectedStayForGuestInfo.guest?.documents && selectedStayForGuestInfo.guest.documents.length > 0">
            <div v-for="doc in selectedStayForGuestInfo.guest.documents" :key="doc.id" class="mb-3">
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <p class="font-semibold text-gray-900">{{ formatDocumentType(doc.document_type) }}</p>
                    <span v-if="doc.document_number" class="text-sm text-gray-500">({{ doc.document_number }})</span>
                  </div>
                  <div class="flex gap-3">
                    <a v-if="doc.document_file_url" :href="doc.document_file_url" target="_blank" class="text-sm text-blue-500 hover:underline flex items-center gap-1">
                      <i class="pi pi-eye"></i>
                      View Front
                    </a>
                    <a v-if="doc.document_file_back_url" :href="doc.document_file_back_url" target="_blank" class="text-sm text-blue-500 hover:underline flex items-center gap-1">
                      <i class="pi pi-eye"></i>
                      View Back
                    </a>
                  </div>
                </div>
                <Badge :value="doc.is_verified ? 'Verified' : 'Not Verified'" :severity="doc.is_verified ? 'success' : 'warning'" />
              </div>
            </div>
          </div>
          <div v-else>
            <p class="text-sm text-gray-500">No identity documents uploaded.</p>
          </div>
        </div>

        <!-- Stay Details -->
        <div>
          <h4 class="font-semibold text-lg mb-3">Stay Details</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Room Number</label>
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.room_details.room_number }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Room Category</label>
              <Tag :value="selectedStayForGuestInfo.room_details.category" severity="info" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Check-in Date</label>
              <p class="font-medium text-gray-900">{{ formatDate(selectedStayForGuestInfo.check_in_date) }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Check-out Date</label>
              <div class="flex items-center gap-2">
                <p v-if="!isEditingCheckoutDate" class="font-medium text-gray-900">{{ formatDate(selectedStayForGuestInfo.check_out_date) }}</p>
                <Calendar
                  v-else
                  v-model="editedCheckoutDate"
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  class="flex-1"
                />
                <Button
                  v-if="!isEditingCheckoutDate"
                  icon="pi pi-sign-out"
                  size="small"

                  rounded
                  severity="primary"
                  @click="startEditingCheckoutDate"
                  v-tooltip="'Extend checkout date'"
                />
                <div v-else class="flex items-center gap-1">
                  <Button
                    icon="pi pi-check"
                    size="small"
                    text
                    rounded
                    severity="success"
                    @click="saveCheckoutDate"
                    :loading="isExtendingStay"
                    v-tooltip="'Save new checkout date'"
                  />
                  <Button
                    icon="pi pi-times"
                    size="small"
                    text
                    rounded
                    severity="danger"
                    @click="cancelEditingCheckoutDate"
                    v-tooltip="'Cancel edit'"
                  />
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Duration</label>
              <p class="font-medium text-gray-900">{{ getDaysStayed(selectedStayForGuestInfo) }} night(s)</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Stay ID</label>
              <p class="font-medium text-gray-900">#{{ selectedStayForGuestInfo.id }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Close" icon="pi pi-times" @click="isGuestInfoDialogVisible = false" class="p-button-text" />
      </template>
    </Dialog>

    <!-- Check-out Confirmation Dialog -->
    <Dialog v-model:visible="isCheckoutDialogVisible" modal header="Confirm Check-out" :style="{ width: '35rem' }">
      <div v-if="selectedStayForCheckout" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-900 mb-2">
            <i class="pi pi-info-circle mr-2"></i>
            Guest Check-out Confirmation
          </p>
          <div class="space-y-1 text-sm">
            <p><strong>Guest:</strong> {{ selectedStayForCheckout.guest.full_name }}</p>
            <p><strong>Room:</strong> {{ selectedStayForCheckout.room_details.room_number }}</p>
            <p><strong>Check-in:</strong> {{ formatDate(selectedStayForCheckout.check_in_date) }}</p>
            <p><strong>Check-out:</strong> {{ formatDate(selectedStayForCheckout.check_out_date) }}</p>
            <p><strong>Duration:</strong> {{ getDaysStayed(selectedStayForCheckout) }} night(s)</p>
          </div>
        </div>

        <!-- Billing Information -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i class="pi pi-file-text"></i>
            Billing Summary
          </h4>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Billing Cycle:</span>
              <Badge :value="selectedStayForCheckout.billing?.hours_24 ? '24 Hour' : '12 Hour'" :severity="selectedStayForCheckout.billing?.hours_24 ? 'info' : 'secondary'" />
            </div>
            <div>
              <label for="final_charge" class="block text-sm font-medium text-gray-700 mb-2">
                Final Charge
              </label>
              <InputNumber
                id="final_charge"
                v-model="checkoutData.final_charge"
                mode="currency"
                currency="INR"
                locale="en-IN"
                class="w-full"
                placeholder="Enter final charge"
              />
            </div>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p class="text-sm text-amber-900">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Room {{ selectedStayForCheckout.room_details.room_number }} will be marked as "Cleaning" after checkout.
          </p>
        </div>

        <!-- Internal Rating -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Internal Rating (Optional)</label>
          <div class="flex items-center gap-4">
            <Rating
              v-model="checkoutData.internal_rating"
              :stars="5"
              :cancel="false"
              class="flex"
            />
            <span v-if="checkoutData.internal_rating" class="text-sm text-gray-600">
              {{ checkoutData.internal_rating }}/5
            </span>
          </div>
          <p class="text-xs text-gray-500">Rate the guest's stay quality</p>
        </div>

        <!-- Internal Note -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Internal Note
            <span v-if="checkoutData.flag_user" class="text-red-600 font-medium">*</span>
            <span v-else class="text-gray-400">(Optional)</span>
          </label>
          <Textarea
            v-model="checkoutData.internal_note"
            rows="3"
            cols="30"
            class="w-full"
            :class="{ 'p-invalid': checkoutData.flag_user && !checkoutData.internal_note.trim() }"
            placeholder="Add any internal notes about the guest's stay..."
          />
          <p class="text-xs text-gray-500">These notes are for internal use only</p>
        </div>

        <!-- Flag User -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Checkbox
              inputId="flag_user"
              v-model="checkoutData.flag_user"
              binary
            />
            <label for="flag_user" class="text-sm font-medium text-gray-700 cursor-pointer">
              Flag this user
            </label>
          </div>
          <p v-if="checkoutData.flag_user" class="text-xs text-amber-600 flex items-start gap-1">
            <i class="pi pi-info-circle mt-0.5"></i>
            <span>Flagging this user will alert hotels on future check-in. Internal note is required when flagging.</span>
          </p>
          <p v-else class="text-xs text-gray-500">Flag guests who may need special attention in future stays</p>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="isCheckoutDialogVisible = false" />
        <Button
          label="Print Summary"
          icon="pi pi-print"
          severity="secondary"
          @click="printCheckoutSummary"
          class="p-button-outlined"
        />
        <Button label="Confirm Check-out" severity="danger" @click="handleConfirmCheckout" :loading="isCheckingOut" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import { useToast } from 'primevue/usetoast';
import { z } from 'zod';

import { useListCheckedInUsers, useCheckoutUser, useExtendGuestStay } from '~/composables/checkin-manager';
import { useAPIHelper } from '~/composables/useAPIHelper';

// Import shared types
import type { Stay, Guest } from '~/types/guest';

// Checkout data validation schema
const CheckoutDataSchema = z.object({
  internal_rating: z.number().min(1).max(5).nullable(),
  internal_note: z.string(),
  flag_user: z.boolean(),
  final_charge: z.number().min(0)
}).refine(
  (data) => !data.flag_user || (data.flag_user && data.internal_note.trim().length > 0),
  { message: 'Internal note is required when flagging a user' }
);

type CheckoutData = z.infer<typeof CheckoutDataSchema>;

const { getErrorMessage } = useAPIHelper();


const toast = useToast();

// --- DATA FETCHING ---
const { checkedInUsers, isLoading, error, refetch } = useListCheckedInUsers();

// --- SEARCH ---
const searchQuery = ref('');
const filteredStays = computed(() => {
  if (!searchQuery.value) {
    return checkedInUsers.value || [];
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return (checkedInUsers.value || []).filter(stay =>
    stay.guest.full_name.toLowerCase().includes(lowerCaseQuery) ||
    stay.room_details.room_number.toLowerCase().includes(lowerCaseQuery)
  );
});

// --- CHECKOUT LOGIC ---
const { checkoutUser, isLoading: isCheckingOut } = useCheckoutUser();
const isCheckoutDialogVisible = ref(false);
const selectedStayForCheckout = ref<any>(null);
const checkoutData = ref({
  internal_rating: null as number | null,
  internal_note: '',
  flag_user: false,
  final_charge: 0 as number
});

// --- GUEST INFO LOGIC ---
const isGuestInfoDialogVisible = ref(false);
const selectedStayForGuestInfo = ref<any>(null);
const isEditingCheckoutDate = ref(false);
const editedCheckoutDate = ref('');
const { extendGuestStay, isLoading: isExtendingStay } = useExtendGuestStay();

const handleCheckout = (stay: any) => {
  selectedStayForCheckout.value = stay;
  checkoutData.value = {
    internal_rating: null,
    internal_note: '',
    flag_user: false,
    final_charge: stay.billing?.current_bill || 0
  };
  isCheckoutDialogVisible.value = true;
};

const handleViewGuest = (stay: any) => {
  selectedStayForGuestInfo.value = stay;
  isGuestInfoDialogVisible.value = true;
};

const startEditingCheckoutDate = () => {
  isEditingCheckoutDate.value = true;
  editedCheckoutDate.value = new Date(selectedStayForGuestInfo.value.check_out_date);
};

const cancelEditingCheckoutDate = () => {
  isEditingCheckoutDate.value = false;
  editedCheckoutDate.value = '';
};

const saveCheckoutDate = async () => {
  if (!selectedStayForGuestInfo.value || !editedCheckoutDate.value) return;

  try {
    // Format the date to ISO string
    const newCheckoutDate = new Date(editedCheckoutDate.value).toISOString();

    await extendGuestStay({
      stayId: selectedStayForGuestInfo.value.id,
      checkOutDate: newCheckoutDate
    });

    // Update the local data with the new checkout date
    selectedStayForGuestInfo.value.check_out_date = newCheckoutDate;

    // Find and update the stay in the main checkedInUsers array
    const stayIndex = (checkedInUsers.value || []).findIndex(
      stay => stay.id === selectedStayForGuestInfo.value.id
    );
    if (stayIndex !== -1) {
      checkedInUsers.value[stayIndex].check_out_date = newCheckoutDate;
    }

    toast.add({
      severity: 'success',
      summary: 'Stay Extended',
      detail: `Checkout date extended to ${formatDate(newCheckoutDate)}`,
      life: 4000
    });

    isEditingCheckoutDate.value = false;
    editedCheckoutDate.value = '';

  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    toast.add({
      severity: 'error',
      summary: 'Extension Failed',
      detail: errorMessage,
      life: 5000
    });
  }
};

const handleExtendStay = () => {
  // This function can still be used for the original extend button if needed
  // or can be removed since we now have inline editing
};

const printCheckoutSummary = () => {
  if (!selectedStayForCheckout.value) return;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CHECK-OUT SUMMARY', pageWidth / 2, yPosition, { align: 'center' });

    // Date
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, pageWidth / 2, yPosition, { align: 'center' });

    // Guest Information
    yPosition += 20;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Guest Information', 20, yPosition);

    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${selectedStayForCheckout.value.guest.full_name}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`WhatsApp: ${selectedStayForCheckout.value.guest.whatsapp_number || 'N/A'}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Email: ${selectedStayForCheckout.value.guest.email || 'Not provided'}`, 20, yPosition);

    // Stay Information
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Stay Details', 20, yPosition);

    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Room Number: ${selectedStayForCheckout.value.room_details.room_number}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Room Category: ${selectedStayForCheckout.value.room_details.category}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Check-in Date: ${formatDate(selectedStayForCheckout.value.check_in_date)}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Check-out Date: ${formatDate(selectedStayForCheckout.value.check_out_date)}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Duration: ${getDaysStayed(selectedStayForCheckout.value)} night(s)`, 20, yPosition);

    // Billing Information
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill Details', 20, yPosition);

    yPosition += 12;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    // Bill items
    pdf.text(`${selectedStayForCheckout.value.room_details.category} Room - ${selectedStayForCheckout.value.room_details.room_number}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`${selectedStayForCheckout.value.billing?.hours_24 ? '24 Hour' : '12 Hour'} Billing Cycle`, 20, yPosition);

    // Add some space
    yPosition += 10;

    // Draw line before total
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    // Total on the right
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total:', pageWidth - 60, yPosition);
    pdf.text(`Rs ${checkoutData.value.final_charge.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

    // Payment Status
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Payment Status: PENDING (Rs ${checkoutData.value.final_charge.toFixed(2)})`, 20, yPosition);

    // Footer
    yPosition = pageHeight - 30;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Thank you for your stay!', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 7;
    pdf.text('Please settle the payment at the front desk', pageWidth / 2, yPosition, { align: 'center' });

    // Save the PDF
    const fileName = `checkout-summary-${selectedStayForCheckout.value.room_details.room_number}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    toast.add({
      severity: 'success',
      summary: 'Print Success',
      detail: 'Checkout summary has been generated and downloaded.',
      life: 3000
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.add({
      severity: 'error',
      summary: 'Print Failed',
      detail: 'Failed to generate checkout summary. Please try again.',
      life: 3000
    });
  }
};

const handleConfirmCheckout = async () => {
  if (!selectedStayForCheckout.value) return;

  // Validation: internal note is required when flag_user is true
  if (checkoutData.value.flag_user && !checkoutData.value.internal_note.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Internal note is required when flagging a user. Please add a note explaining the reason for flagging.',
      life: 5000
    });
    return;
  }

  try {
    const checkoutPayload: any = {
      amount_paid: checkoutData.value.final_charge,
      ...(checkoutData.value.internal_rating && { internal_rating: checkoutData.value.internal_rating }),
      ...(checkoutData.value.internal_note && { internal_note: checkoutData.value.internal_note })
    };

    // Include flag_user if it's true
    if (checkoutData.value.flag_user) {
      checkoutPayload.flag_user = true;
    }

    await checkoutUser({
      stayId: selectedStayForCheckout.value.id,
      data: checkoutPayload
    });

    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: `${selectedStayForCheckout.value.guest.full_name} has been checked out successfully${checkoutData.value.flag_user ? ' and flagged for future attention.' : '.'}`,
      life: 4000
    });

    isCheckoutDialogVisible.value = false;
    await refetch();

  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    toast.add({ severity: 'error', summary: 'Check-out Failed', detail: errorMessage, life: 5000 });
  }
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleString('en-US', { hour: 'numeric', hour12: true });
  return `${day} ${month} ${year} ${time}`;
}

const getDaysStayed = (stay: any) => {
  const checkIn = new Date(stay.check_in_date)
  const checkOut = new Date(stay.check_out_date)
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatDocumentType = (type: string) => {
  if (!type) return '';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getLanguageName = (code: string) => {
  const languageOptions = [
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Italian', code: 'it' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Russian', code: 'ru' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Hindi', code: 'hi' }
  ];
  const language = languageOptions.find(lang => lang.code === code);
  return language ? language.name : '';
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'pending_verification': return 'warning';
    case 'verified': return 'success';
    case 'rejected': return 'danger';
    default: return 'info';
  }
};
</script>

<style scoped>
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.5s ease forwards;
}
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
