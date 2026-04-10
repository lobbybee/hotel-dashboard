<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="mb-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Guest Check-out</h1>
      <p class="text-gray-600">Manage guest departures and room turnover</p>
    </div>

    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <span class="p-input-icon-left w-full md:max-w-lg">
        <InputText
          v-model="searchQuery"
          placeholder="Search by name, phone, or ID number..."
          class="w-full"
        />
      </span>
      <div class="flex items-center gap-3 self-start md:self-auto">
        <label for="show-history" class="text-sm font-medium text-gray-700">Show stay history</label>
        <InputSwitch id="show-history" v-model="showHistory" />
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
      <p class="text-gray-500 mt-4">{{ showHistory ? 'Loading stays...' : 'Loading active stays...' }}</p>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading stays</h3>
      <p class="text-gray-500 mb-4">{{ error?.message }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="refetch" />
    </div>

    <div v-else-if="checkoutGuestCards.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">{{ showHistory ? 'No stays found' : 'No active stays' }}</p>
      <p class="text-gray-400 text-sm">{{ showHistory ? 'Try changing search or page.' : 'All rooms are currently available' }}</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="guestCard in checkoutGuestCards"
        :key="guestCard.guest.id"
        class="rounded-lg border p-6 transition-all"
        :class="guestCard.isCheckedIn ? 'bg-white border-gray-200 hover:shadow-lg' : 'bg-gray-50 border-gray-300 opacity-95'"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="guestCard.isCheckedIn ? 'bg-primary-100' : 'bg-gray-200'"
            >
              <i class="pi pi-user text-xl" :class="guestCard.isCheckedIn ? 'text-primary-600' : 'text-gray-600'"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ guestCard.guest.full_name }}</h3>
              <p class="text-sm text-gray-500">{{ guestCard.guest.email }}</p>
            </div>
          </div>
          <Tag :value="guestCard.isCheckedIn ? 'Active' : 'Past Stay'" :severity="guestCard.isCheckedIn ? 'success' : 'secondary'" />
        </div>

        <div class="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-home"></i>
              Rooms
            </span>
            <span class="font-semibold text-gray-900">{{ guestCard.visibleStays.length }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-tag"></i>
              Category
            </span>
            <Tag
              :value="guestCard.visibleStays.length > 1 ? 'Multiple' : (guestCard.primaryStay?.room_details?.category || 'N/A')"
              severity="info"
            />
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-phone"></i>
              WhatsApp
            </span>
            <span class="font-medium text-gray-900">{{ guestCard.guest.whatsapp_number || 'N/A' }}</span>
          </div>
        </div>

        <div v-if="guestCard.primaryStay" class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-plus text-green-600"></i>
            <span>Check-in: {{ formatDate(guestCard.primaryStay.check_in_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-minus text-red-600"></i>
            <span>Check-out: {{ formatDate(guestCard.primaryStay.check_out_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="pi pi-clock text-blue-600"></i>
            <span class="font-medium text-blue-600">{{ getDaysStayed(guestCard.primaryStay) }} night(s)</span>
          </div>
          <p
            v-if="guestCard.isCheckedIn && isCheckoutTimePassed(guestCard.primaryStay.check_out_date)"
            class="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1"
          >
            Checkout time is in the past. You can extend the stay or proceed with checkout.
          </p>
        </div>

        <Button
          v-if="guestCard.checkoutStay"
          label="Check Out"
          icon="pi pi-sign-out"
          class="w-full"
          severity="danger"
          @click="handleCheckout(guestCard.checkoutStay)"
        />
        <Button
          label="View Guest"
          icon="pi pi-user"
          class="w-full"
          :class="guestCard.isCheckedIn ? 'mt-3' : ''"
          :severity="guestCard.isCheckedIn ? 'info' : 'secondary'"
          outlined
          :disabled="!guestCard.primaryStay"
          @click="guestCard.primaryStay && handleViewGuest(guestCard.primaryStay)"
        />
      </div>
    </div>
      <Paginator
        v-if="totalRecords > pageSize"
        :rows="pageSize"
        :totalRecords="totalRecords"
        :first="(currentPage - 1) * pageSize"
        @page="onPageChange"
      />
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
              <p class="font-medium text-gray-900">{{ selectedStayForGuestInfo.guest.date_of_birth ? formatDateOnlyInHotelTz(selectedStayForGuestInfo.guest.date_of_birth) : 'Not provided' }}</p>
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
                  hourFormat="12"
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
              <p
                v-if="isCheckoutTimePassed(selectedStayForGuestInfo.check_out_date)"
                class="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1"
              >
                Checkout time is in the past. You can extend the stay or proceed with checkout.
              </p>
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
            <p><strong>Primary Room:</strong> {{ selectedStayForCheckout.room_details.room_number }}</p>
            <p><strong>Check-in:</strong> {{ formatDate(selectedStayForCheckout.check_in_date) }}</p>
            <div class="flex items-center gap-2">
              <p v-if="!isEditingCheckoutDateInCheckoutModal" class="m-0">
                <strong>Check-out:</strong> {{ formatDate(selectedStayForCheckout.check_out_date) }}
              </p>
              <div v-else class="flex-1 min-w-0">
                <Calendar
                  v-model="editedCheckoutDateInCheckoutModal"
                  showTime
                  hourFormat="12"
                  dateFormat="dd/mm/yy"
                  class="w-full"
                />
              </div>
              <Button
                v-if="!isEditingCheckoutDateInCheckoutModal"
                icon="pi pi-sign-out"
                size="small"
                rounded
                severity="primary"
                @click="startEditingCheckoutDateInCheckoutModal"
                v-tooltip="'Extend checkout date'"
              />
              <div v-else class="flex items-center gap-1">
                <Button
                  icon="pi pi-check"
                  size="small"
                  text
                  rounded
                  severity="success"
                  @click="saveCheckoutDateFromCheckoutModal"
                  :loading="isExtendingStay"
                  v-tooltip="'Save new checkout date'"
                />
                <Button
                  icon="pi pi-times"
                  size="small"
                  text
                  rounded
                  severity="danger"
                  @click="cancelEditingCheckoutDateInCheckoutModal"
                  v-tooltip="'Cancel edit'"
                />
              </div>
            </div>

            <p><strong>Duration:</strong> {{ getDaysStayed(selectedStayForCheckout) }} night(s)</p>
          </div>
          <p
                       v-if="isCheckoutTimePassed(selectedStayForCheckout.check_out_date)"
                       class="mt-2 max-w-xs text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1"
                     >
                       Checkout time is in the past. You can extend the stay or proceed with checkout.
                     </p>
        </div>

        <!-- Stay Selection -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i class="pi pi-list-check"></i>
            Select Rooms To Check Out
          </h4>
          <div v-if="checkoutStayOptions.length > 0" class="space-y-3">
            <div
              v-for="stayOption in checkoutStayOptions"
              :key="stayOption.id"
              class="flex items-start gap-3 rounded-md border border-gray-200 p-3"
            >
              <Checkbox
                :inputId="`checkout-stay-${stayOption.id}`"
                v-model="selectedCheckoutStayIds"
                :value="stayOption.id"
              />
              <label :for="`checkout-stay-${stayOption.id}`" class="flex-1 cursor-pointer text-sm">
                <p class="font-medium text-gray-900">
                  Room {{ stayOption.room_details?.room_number || 'N/A' }}
                  <span class="text-gray-500 font-normal">({{ stayOption.room_details?.category || 'N/A' }})</span>
                </p>
                <p class="text-gray-600 mt-1">
                  {{ formatDate(stayOption.check_in_date) }} to {{ formatDate(stayOption.check_out_date) }}
                </p>
                <p class="text-gray-700 mt-1">
                  Current Bill: Rs {{ Number(stayOption.billing?.current_bill || 0).toFixed(2) }}
                </p>
              </label>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">No active stays available for this guest.</p>
        </div>

        <!-- Billing Information -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i class="pi pi-file-text"></i>
            Billing Summary
          </h4>
          <div class="space-y-3 text-sm">
            <p><strong>Selected Rooms:</strong> {{ selectedCheckoutStayIds.length }}</p>
            <p><strong>Calculated Total:</strong> Rs {{ selectedCheckoutTotal.toFixed(2) }}</p>
            <div class="space-y-2">
              <label for="checkout-final-amount" class="block text-sm font-medium text-gray-700">
                Final Amount
              </label>
              <InputNumber
                inputId="checkout-final-amount"
                :modelValue="customCheckoutFinalAmount"
                :min="0"
                class="w-full"
                inputClass="w-full"
                @update:modelValue="handleCheckoutFinalAmountInput"
              />
              <p class="text-xs text-gray-500">This value will be used in the printed summary.</p>
            </div>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p class="text-sm text-amber-900">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            {{ selectedCheckoutStayIds.length > 1 ? 'Selected rooms' : 'Selected room' }} will be marked as "Cleaning" after checkout.
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
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import jsPDF from 'jspdf';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import InputSwitch from 'primevue/inputswitch';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import { useToast } from 'primevue/usetoast';

import { useListCheckedInUsers, useCheckoutUser, useExtendGuestStay } from '~/composables/checkin-manager';
import { useAPIHelper } from '~/composables/useAPIHelper';
import { formatDateOnlyInHotelTz, formatDateTimeCompactInHotelTz } from '~/utils/dateFormat';

// Import shared types
import type { Guest } from '~/types/guest';

const { getErrorMessage } = useAPIHelper();


const toast = useToast();
const route = useRoute();
const router = useRouter();
const pageSize = computed(() => Number(route.query.page_size) || 10);
const searchQuery = ref((route.query.search as string) || '');
const showHistory = ref(false);
const searchDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);

type GuestWithDetails = Guest & {
  status?: string;
  nationality?: string;
  date_of_birth?: string;
  preferred_language?: string;
  is_whatsapp_active?: boolean;
  notes?: string;
  documents?: Array<{
    id: number;
    document_type?: string;
    document_number?: string;
    is_verified?: boolean;
    document_file_url?: string;
    document_file_back_url?: string;
  }>;
  [key: string]: any;
};

type GroupedStay = {
  id: number;
  check_in_date: string;
  check_out_date: string;
  isCheckedIn?: boolean;
  room_details: {
    room_number?: string;
    category?: string;
    [key: string]: any;
  };
  billing?: {
    current_bill?: number;
    expected_bill?: number;
    [key: string]: any;
  };
  [key: string]: any;
};

type CheckedInGuestGroup = {
  guest: GuestWithDetails;
  is_checked_in: boolean;
  stays: GroupedStay[];
  billing?: {
    current_bill_total?: number;
    expected_bill_total?: number;
    rooms?: Array<{
      stay_id: number;
      room_id: number;
      current_bill: number;
      expected_bill: number;
    }>;
  };
  active_stay_ids?: number[];
  pending_stay_ids?: number[];
  completed_stay_ids?: number[];
  flag_summary?: {
    is_flagged?: boolean;
    police_flagged?: boolean;
    flags?: Array<{
      id: number;
      global_note?: string;
      is_active?: boolean;
      created_at?: string;
    }>;
  };
};

type StayWithGuestContext = GroupedStay & {
  guest: GuestWithDetails;
  isCheckedIn: boolean;
  groupedIsCheckedIn: boolean;
  groupedBilling?: CheckedInGuestGroup['billing'];
  active_stay_ids?: number[];
  pending_stay_ids?: number[];
  completed_stay_ids?: number[];
  flag_summary?: CheckedInGuestGroup['flag_summary'];
};

// --- DATA FETCHING ---
const { checkedInUsers, isLoading, error, refetch } = useListCheckedInUsers(showHistory);
const groupedCheckedInUsers = computed<CheckedInGuestGroup[]>(() => {
  return (checkedInUsers.value?.results || []) as CheckedInGuestGroup[];
});
const checkoutGuestCards = computed(() => {
  const grouped = groupedCheckedInUsers.value.map((group) => {
    const mappedStays = (group.stays || [])
      .map((stay) => ({
        ...stay,
        guest: group.guest,
        isCheckedIn: typeof stay.isCheckedIn === 'boolean' ? stay.isCheckedIn : group.is_checked_in,
        groupedIsCheckedIn: group.is_checked_in,
        groupedBilling: group.billing,
        active_stay_ids: group.active_stay_ids,
        pending_stay_ids: group.pending_stay_ids,
        completed_stay_ids: group.completed_stay_ids,
        flag_summary: group.flag_summary
      }));
    const activeStays = mappedStays.filter((stay) => stay.isCheckedIn === true);
    const visibleStays = showHistory.value ? mappedStays : activeStays;

    return {
      guest: group.guest,
      isCheckedIn: group.is_checked_in,
      activeStays,
      visibleStays,
      primaryStay: visibleStays[0] || activeStays[0] || null,
      checkoutStay: activeStays[0] || null
    };
  });

  if (showHistory.value) return grouped;
  return grouped.filter((group) => group.isCheckedIn && group.activeStays.length > 0);
});
const totalRecords = computed(() => checkedInUsers.value?.count || 0);
const currentPage = computed(() => Number(route.query.page) || 1);

// --- SEARCH ---

const updateRouteQuery = async (updates: Record<string, any>) => {
  const nextQuery: Record<string, any> = { ...route.query, ...updates };
  Object.keys(nextQuery).forEach((key) => {
    const value = nextQuery[key];
    if (value === undefined || value === null || value === '') {
      delete nextQuery[key];
    }
  });
  await router.replace({ query: nextQuery });
};

watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = (value as string) || '';
  }
);

watch(
  searchQuery,
  (value) => {
    if (searchDebounceTimer.value) {
      clearTimeout(searchDebounceTimer.value);
    }
    searchDebounceTimer.value = setTimeout(() => {
      updateRouteQuery({
        search: value.trim() || undefined,
        page: 1
      });
    }, 350);
  }
);

const onPageChange = (event: any) => {
  updateRouteQuery({
    page: event.page + 1,
    page_size: event.rows || pageSize.value
  });
};
onBeforeUnmount(() => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
});

// --- CHECKOUT LOGIC ---
const { checkoutUser, isLoading: isCheckingOut } = useCheckoutUser();
const isCheckoutDialogVisible = ref(false);
const selectedStayForCheckout = ref<any>(null);
const checkoutStayOptions = ref<StayWithGuestContext[]>([]);
const selectedCheckoutStayIds = ref<number[]>([]);
const checkoutData = ref({
  internal_rating: null as number | null,
  internal_note: '',
  flag_user: false
});

// --- GUEST INFO LOGIC ---
const isGuestInfoDialogVisible = ref(false);
const selectedStayForGuestInfo = ref<any>(null);
const isEditingCheckoutDate = ref(false);
const editedCheckoutDate = ref<Date | null>(null);
const isEditingCheckoutDateInCheckoutModal = ref(false);
const editedCheckoutDateInCheckoutModal = ref<Date | null>(null);
const { extendGuestStay, isLoading: isExtendingStay } = useExtendGuestStay();

const updateLocalStayCheckoutDate = (stayId: number, newCheckoutDate: string) => {
  for (const group of groupedCheckedInUsers.value) {
    const stayToUpdate = (group.stays || []).find((stay) => stay.id === stayId);
    if (stayToUpdate) {
      stayToUpdate.check_out_date = newCheckoutDate;
      return;
    }
  }
};

const selectedCheckoutStays = computed(() => {
  const selectedIds = new Set(selectedCheckoutStayIds.value.map((id) => Number(id)));
  return checkoutStayOptions.value.filter((stay) => selectedIds.has(Number(stay.id)));
});

const selectedCheckoutTotal = computed(() => {
  return selectedCheckoutStays.value.reduce((sum, stay) => {
    return sum + Number(stay.billing?.current_bill || 0);
  }, 0);
});

const customCheckoutFinalAmount = ref<number | null>(null);
const hasManualCheckoutFinalAmount = ref(false);
const checkoutFinalAmount = computed(() => {
  if (hasManualCheckoutFinalAmount.value && customCheckoutFinalAmount.value !== null) {
    return Number(customCheckoutFinalAmount.value);
  }

  return selectedCheckoutTotal.value;
});

watch(selectedCheckoutTotal, (newTotal) => {
  if (!hasManualCheckoutFinalAmount.value) {
    customCheckoutFinalAmount.value = newTotal;
  }
}, { immediate: true });

const handleCheckout = (stay: any) => {
  selectedStayForCheckout.value = stay;
  const guestGroup = groupedCheckedInUsers.value.find(
    (group) => Number(group.guest?.id) === Number(stay?.guest?.id)
  );
  const activeStaysForGuest: StayWithGuestContext[] = guestGroup
    ? (guestGroup.stays || [])
      .map((guestStay) => ({
        ...guestStay,
        guest: guestGroup.guest,
        isCheckedIn: typeof guestStay.isCheckedIn === 'boolean' ? guestStay.isCheckedIn : guestGroup.is_checked_in,
        groupedIsCheckedIn: guestGroup.is_checked_in,
        groupedBilling: guestGroup.billing,
        active_stay_ids: guestGroup.active_stay_ids,
        pending_stay_ids: guestGroup.pending_stay_ids,
        completed_stay_ids: guestGroup.completed_stay_ids,
        flag_summary: guestGroup.flag_summary
      }))
      .filter((guestStay) => guestStay.isCheckedIn === true)
    : [];

  checkoutStayOptions.value = activeStaysForGuest;
  selectedCheckoutStayIds.value = activeStaysForGuest.some((guestStay) => guestStay.id === stay.id)
    ? [stay.id]
    : activeStaysForGuest.length > 0
      ? [activeStaysForGuest[0].id]
      : [];
  checkoutData.value = {
    internal_rating: null,
    internal_note: '',
    flag_user: false
  };
  hasManualCheckoutFinalAmount.value = false;
  customCheckoutFinalAmount.value = selectedCheckoutTotal.value;
  isEditingCheckoutDateInCheckoutModal.value = false;
  editedCheckoutDateInCheckoutModal.value = null;
  isCheckoutDialogVisible.value = true;
};

const handleCheckoutFinalAmountInput = (value: number | null) => {
  customCheckoutFinalAmount.value = value;
  hasManualCheckoutFinalAmount.value = value !== null;
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
  editedCheckoutDate.value = null;
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
    updateLocalStayCheckoutDate(selectedStayForGuestInfo.value.id, newCheckoutDate);

    toast.add({
      severity: 'success',
      summary: 'Stay Extended',
      detail: `Checkout date extended to ${formatDate(newCheckoutDate)}`,
      life: 4000
    });

    isEditingCheckoutDate.value = false;
    editedCheckoutDate.value = null;

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

const startEditingCheckoutDateInCheckoutModal = () => {
  if (!selectedStayForCheckout.value) return;
  isEditingCheckoutDateInCheckoutModal.value = true;
  editedCheckoutDateInCheckoutModal.value = new Date(selectedStayForCheckout.value.check_out_date);
};

const cancelEditingCheckoutDateInCheckoutModal = () => {
  isEditingCheckoutDateInCheckoutModal.value = false;
  editedCheckoutDateInCheckoutModal.value = null;
};

const saveCheckoutDateFromCheckoutModal = async () => {
  if (!selectedStayForCheckout.value || !editedCheckoutDateInCheckoutModal.value) return;

  try {
    const newCheckoutDate = new Date(editedCheckoutDateInCheckoutModal.value).toISOString();

    await extendGuestStay({
      stayId: selectedStayForCheckout.value.id,
      checkOutDate: newCheckoutDate
    });

    selectedStayForCheckout.value.check_out_date = newCheckoutDate;
    updateLocalStayCheckoutDate(selectedStayForCheckout.value.id, newCheckoutDate);

    toast.add({
      severity: 'success',
      summary: 'Stay Extended',
      detail: `Checkout date extended to ${formatDate(newCheckoutDate)}`,
      life: 4000
    });

    isEditingCheckoutDateInCheckoutModal.value = false;
    editedCheckoutDateInCheckoutModal.value = null;
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

const printCheckoutSummary = () => {
  if (!selectedStayForCheckout.value) return;
  if (selectedCheckoutStayIds.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'No Rooms Selected',
      detail: 'Select at least one room to print checkout summary.',
      life: 4000
    });
    return;
  }

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
    pdf.text(`Date: ${formatDateOnlyInHotelTz(new Date(), 'en-US', {
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
    const primaryPrintedStay = selectedCheckoutStays.value[0] || selectedStayForCheckout.value;
    pdf.text(`Primary Room: ${primaryPrintedStay.room_details.room_number}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Room Category: ${primaryPrintedStay.room_details.category}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Check-in Date: ${formatDate(primaryPrintedStay.check_in_date)}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Check-out Date: ${formatDate(primaryPrintedStay.check_out_date)}`, 20, yPosition);

    yPosition += 7;
    pdf.text(`Duration: ${getDaysStayed(primaryPrintedStay)} night(s)`, 20, yPosition);

    // Billing Information
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill Details', 20, yPosition);

    yPosition += 12;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    // Bill items
    selectedCheckoutStays.value.forEach((stayItem) => {
      if (yPosition > pageHeight - 50) return;
      pdf.text(
        `${stayItem.room_details?.category || 'Room'} - ${stayItem.room_details?.room_number || 'N/A'}`,
        20,
        yPosition
      );
      yPosition += 7;
    });

    yPosition += 3;

    // Draw line before total
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);

    yPosition += 10;

    // Total on the right
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total:', pageWidth - 60, yPosition);
    pdf.text(`Rs ${checkoutFinalAmount.value.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

    // Payment Status
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Payment Status: PENDING (Rs ${checkoutFinalAmount.value.toFixed(2)})`, 20, yPosition);

    // Footer
    yPosition = pageHeight - 30;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Thank you for your stay!', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 7;
    pdf.text('Please settle the payment at the front desk', pageWidth / 2, yPosition, { align: 'center' });

    // Save the PDF
    const fileName = `checkout-summary-guest-${selectedStayForCheckout.value.guest.id}-${new Date().toISOString().split('T')[0]}.pdf`;
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
  if (selectedCheckoutStayIds.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'No Rooms Selected',
      detail: 'Select at least one room to check out.',
      life: 5000
    });
    return;
  }

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
      guest_id: selectedStayForCheckout.value.guest.id,
      stay_ids: selectedCheckoutStayIds.value,
      ...(checkoutData.value.internal_rating && { internal_rating: checkoutData.value.internal_rating }),
      ...(checkoutData.value.internal_note && { internal_note: checkoutData.value.internal_note })
    };

    // Include flag_user if it's true
    if (checkoutData.value.flag_user) {
      checkoutPayload.flag_user = true;
    }

    const response: any = await checkoutUser(checkoutPayload);
    const checkoutResult = response?.data || {};
    const wasFullyCheckedOut = checkoutResult.guest_has_active_stays === false;

    toast.add({
      severity: 'success',
      summary: 'Checked Out',
      detail: checkoutResult.message
        || `${selectedStayForCheckout.value.guest.full_name} checked out for ${selectedCheckoutStayIds.value.length} room(s). ${wasFullyCheckedOut ? 'No active stays remain.' : 'Active stays still remain.'}`,
      life: 4500
    });

    isCheckoutDialogVisible.value = false;
    await refetch();

  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    toast.add({ severity: 'error', summary: 'Check-out Failed', detail: errorMessage, life: 5000 });
  }
};

const formatDate = (dateString: string) => {
  return formatDateTimeCompactInHotelTz(dateString, { minute: '2-digit' });
}

const getDaysStayed = (stay: any) => {
  const checkIn = new Date(stay.check_in_date);
  const checkOut = new Date(stay.check_out_date);

  const checkInDateOnly = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const checkOutDateOnly = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

  const diffInDays = Math.round((checkOutDateOnly.getTime() - checkInDateOnly.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffInDays);
}

const isCheckoutTimePassed = (checkoutDate: string) => {
  return new Date(checkoutDate).getTime() < Date.now();
};

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
