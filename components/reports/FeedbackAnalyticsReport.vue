<template>
  <div class="space-y-6">
    <!-- Feedback Analytics Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-amber-50 rounded-lg">
            <Icon name="fa:star" class="text-amber-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Feedback</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(feedbackAnalyticsData?.summary?.total_feedback || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-emerald-50 rounded-lg">
            <Icon name="fa:pie-chart" class="text-emerald-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Average Rating</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatDecimal(feedbackAnalyticsData?.summary?.average_rating || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-50 rounded-lg">
            <Icon name="fa:trophy" class="text-blue-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">5-Star %</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatPercentage(feedbackAnalyticsData?.summary?.percentage_5_star || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-50 rounded-lg">
            <Icon name="fa-solid:award" class="text-purple-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">4+ Star %</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatPercentage(feedbackAnalyticsData?.summary?.percentage_4_plus_star || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-cyan-50 rounded-lg">
            <Icon name="fa:pie-chart" class="text-cyan-600 text-xl"/>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Response Rate</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ calculateResponseRate() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <Icon name="fa:spinner" class="fa-spin text-4xl text-blue-600 mb-4"/>
        <Icon name="fa:spinner" class="fa-spin text-4xl text-blue-600 mb-4"/>
        <p class="text-gray-600">Loading feedback analytics...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <Icon name="fa:exclamation-triangle" class="text-red-600 text-xl mr-3"/>
        <div>
          <h3 class="text-red-800 font-semibold">Error Loading Feedback Analytics</h3>
          <p class="text-red-700 mt-1">{{ error?.message || 'Failed to load feedback analytics data' }}</p>
          <button
            @click="refetch"
            class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Feedback Analytics Content -->
    <div v-else>
      <!-- Filter Controls -->
      <div class="card p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by guest name or feedback note..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[200px]"
          />

          <select
            v-model="ratingFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <button
            @click="clearFilters"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Rating Distribution Chart -->
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <i class="fas fa-chart-bar text-amber-600"></i>
          Rating Distribution
        </h3>
        <div class="space-y-3">
          <div v-for="n in 5" :key="6-n" class="flex items-center">
            <div class="flex items-center w-20">
              <span class="text-sm font-medium text-gray-900 mr-2">{{ 6-n }}</span>
              <i class="fas fa-star text-amber-500 text-xs"></i>
            </div>
            <div class="flex-1 mx-3">
              <div class="bg-gray-200 rounded-full h-3">
                <div
                  :class="getRatingColor(6-n)"
                  class="h-3 rounded-full transition-all duration-300"
                  :style="{ width: `${getRatingPercentage(6-n)}%` }"
                ></div>
              </div>
            </div>
            <span class="text-sm text-gray-600 w-12 text-right">{{ getRatingCount(6-n) }}</span>
          </div>
        </div>
      </div>

      <!-- Feedback Table -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stay Period
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nationality
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="feedback in filteredFeedbacks"
                :key="feedback.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ feedback.guest?.full_name || 'Unknown' }}</div>
                      <div class="text-sm text-gray-500">{{ feedback.guest?.whatsapp_number || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex">
                      <i
                        v-for="n in 5"
                        :key="n"
                        :class="[
                          'fas fa-star text-sm',
                          n <= feedback.rating ? 'text-amber-500' : 'text-gray-300'
                        ]"
                      ></i>
                    </div>
                    <span class="ml-2 text-sm text-gray-900">{{ feedback.rating }}.0</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ feedback.stay?.room?.room_number || 'N/A' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ feedback.stay?.room?.category || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(feedback.stay?.check_in_date) }} -
                  </div>
                  <div class="text-sm text-gray-900">
                    {{ formatDate(feedback.stay?.check_out_date) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ feedback.stay?.total_amount ? formatCurrency(feedback.stay.total_amount) : 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {{ feedback.guest?.nationality || 'Unknown' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate">
                    {{ feedback.note || 'No comment provided' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(feedback.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewFeedbackDetails(feedback)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    <i class="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredFeedbacks.length === 0" class="text-center py-12">
          <i class="fas fa-star text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
          <p class="text-gray-500">Try adjusting your filters or date range.</p>
        </div>
      </div>
    </div>

    <!-- Feedback Details Modal -->
    <Dialog
      v-model:visible="showFeedbackModal"
      :modal="true"
      :style="{ width: '600px' }"
      header="Feedback Details"
      :dismissableMask="true"
    >
      <div v-if="selectedFeedback" class="space-y-4">
        <!-- Guest Information -->
        <div class="border-b pb-4">
          <h4 class="font-semibold text-gray-900 mb-3">Guest Information</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-500">Name:</span>
              <p class="font-medium">{{ selectedFeedback.guest?.full_name || 'Unknown' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">WhatsApp:</span>
              <p class="font-medium">{{ selectedFeedback.guest?.whatsapp_number || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Nationality:</span>
              <p class="font-medium">{{ selectedFeedback.guest?.nationality || 'Unknown' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Feedback Date:</span>
              <p class="font-medium">{{ formatDate(selectedFeedback.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Rating -->
        <div class="border-b pb-4">
          <h4 class="font-semibold text-gray-900 mb-3">Rating</h4>
          <div class="flex items-center gap-2">
            <div class="flex">
              <i
                v-for="n in 5"
                :key="n"
                :class="[
                  'fas fa-star text-lg',
                  n <= selectedFeedback.rating ? 'text-amber-500' : 'text-gray-300'
                ]"
              ></i>
            </div>
            <span class="text-lg font-semibold">{{ selectedFeedback.rating }}.0 / 5.0</span>
          </div>
        </div>

        <!-- Stay Information -->
        <div class="border-b pb-4">
          <h4 class="font-semibold text-gray-900 mb-3">Stay Information</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-500">Room Number:</span>
              <p class="font-medium">{{ selectedFeedback.stay?.room?.room_number || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Room Category:</span>
              <p class="font-medium">{{ selectedFeedback.stay?.room?.category || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Check-in:</span>
              <p class="font-medium">{{ formatDate(selectedFeedback.stay?.check_in_date) }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Check-out:</span>
              <p class="font-medium">{{ formatDate(selectedFeedback.stay?.check_out_date) }}</p>
            </div>
            <div v-if="selectedFeedback.stay?.total_amount" class="col-span-2">
              <span class="text-sm text-gray-500">Total Amount:</span>
              <p class="font-medium">{{ formatCurrency(selectedFeedback.stay.total_amount) }}</p>
            </div>
          </div>
        </div>

        <!-- Feedback Comment -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-3">Comment</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-800">{{ selectedFeedback.note || 'No comment provided' }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Close"
          icon="fas fa-times"
          @click="showFeedbackModal = false"
          class="p-button-secondary"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetchFeedbackAnalytics } from '@/composables/useReporting'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

// Props
const props = defineProps<{
  dateRange: {
    start: string
    end: string
  }
}>()

// Emits
const emit = defineEmits<{
  'update-data': [data: any]
}>()

// State
const searchTerm = ref('')
const ratingFilter = ref('')
const showFeedbackModal = ref(false)
const selectedFeedback = ref<any>(null)

// Feedback Analytics Data
const {
  feedbackAnalytics: feedbackAnalyticsData,
  isLoading,
  error,
  refetch
} = useFetchFeedbackAnalytics(
  computed(() => ({
    start_date: props.dateRange.start || undefined,
    end_date: props.dateRange.end || undefined,
    room_id: undefined, // Can be added as prop if needed for filtering
    guest_whatsapp: undefined // Can be added as prop if needed for filtering
  }))
)

// Emit data to parent when loaded
watch(feedbackAnalyticsData, (newData) => {
  if (newData && newData.summary) {
    emit('update-data', newData)
  }
}, { immediate: true })

// Computed Properties
const filteredFeedbacks = computed(() => {
  if (!feedbackAnalyticsData.value?.feedbacks) return []

  return feedbackAnalyticsData.value.feedbacks.filter(feedback => {
    const matchesSearch = !searchTerm.value ||
      feedback.guest?.full_name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      feedback.note?.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesRating = !ratingFilter.value ||
      feedback.rating.toString() === ratingFilter.value

    return matchesSearch && matchesRating
  })
})

// Methods
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

const formatDecimal = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(num)
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const calculateResponseRate = () => {
  // This would be calculated based on your business logic
  // For now, return a placeholder based on feedback count
  const totalFeedback = feedbackAnalyticsData.value?.summary?.total_feedback || 0
  const totalGuests = feedbackAnalyticsData.value?.feedbacks?.length || 0

  if (totalGuests === 0) return '0%'

  return `${Math.round((totalFeedback / totalGuests) * 100)}%`
}

const getRatingCount = (rating: number) => {
  if (!feedbackAnalyticsData.value?.summary?.rating_distribution) return 0
  return feedbackAnalyticsData.value.summary.rating_distribution[rating.toString()] || 0
}

const getRatingPercentage = (rating: number) => {
  const count = getRatingCount(rating)
  const total = feedbackAnalyticsData.value?.summary?.total_feedback || 1
  return Math.round((count / total) * 100)
}

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'bg-emerald-500'
  if (rating >= 4) return 'bg-green-500'
  if (rating >= 3) return 'bg-amber-500'
  if (rating >= 2) return 'bg-orange-500'
  return 'bg-red-500'
}

const viewFeedbackDetails = (feedback: any) => {
  selectedFeedback.value = feedback
  showFeedbackModal.value = true
}

const clearFilters = () => {
  searchTerm.value = ''
  ratingFilter.value = ''
}

// Watch for date range changes
watch(() => props.dateRange, () => {
  refetch()
}, { deep: true })

// Export functionality
const exportPDF = () => {
  emit('export-pdf', feedbackAnalyticsData.value)
}
</script>
