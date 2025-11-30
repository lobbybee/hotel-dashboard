<template>
  <div class="space-y-6">
    <!-- Conversation History Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-50 rounded-lg">
            <i class="fas fa-comments text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Conversations</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(conversationHistoryData?.summary?.total_conversations || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-cyan-50 rounded-lg">
            <i class="fas fa-message text-cyan-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Total Messages</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(conversationHistoryData?.summary?.total_messages || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-emerald-50 rounded-lg">
            <i class="fas fa-chart-line text-emerald-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Avg Messages</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatDecimal(conversationHistoryData?.summary?.average_messages_per_conversation || 0) }}
            </p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-50 rounded-lg">
            <i class="fas fa-check-circle text-purple-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-600">Fulfillment Rate</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ calculateFulfillmentRate() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-600">Loading conversation history...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
        <div>
          <h3 class="text-red-800 font-semibold">Error Loading Conversation History</h3>
          <p class="text-red-700 mt-1">{{ error?.message || 'Failed to load conversation history data' }}</p>
          <button 
            @click="refetch" 
            class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Conversation History Content -->
    <div v-else>
      <!-- Filter Controls -->
      <div class="card p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by guest name or message preview..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[200px]"
          />
          
          <select
            v-model="departmentFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            <option v-for="dept in availableDepartments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>

          <select
            v-model="typeFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option v-for="type in availableTypes" :key="type" :value="type">
              {{ type.replace('_', ' ').toUpperCase() }}
            </option>
          </select>

          <button
            @click="clearFilters"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Conversation History Table -->
      <div class="card p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="conversation in filteredConversations" 
                :key="conversation.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <i class="fas fa-user text-gray-600"></i>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ conversation.guest?.full_name || 'Unknown' }}</div>
                      <div class="text-sm text-gray-500">
                        {{ conversation.guest?.whatsapp_number || 'No phone' }}
                        <span v-if="conversation.guest?.room_number" class="ml-1">
                          • Room {{ conversation.guest.room_number }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ conversation.department }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                    {{ conversation.conversation_type?.replace('_', ' ') || 'Unknown' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="getStatusClass(conversation.status)"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ conversation.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ conversation.message_count || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(conversation.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewConversationDetails(conversation)"
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
        <div v-if="filteredConversations.length === 0" class="text-center py-12">
          <i class="fas fa-comments text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
          <p class="text-gray-500">Try adjusting your filters or date range.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetchConversationHistory } from '@/composables/useReporting'

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
const departmentFilter = ref('')
const typeFilter = ref('')

// Conversation History Data
const {
  conversationHistory: conversationHistoryData,
  isLoading,
  error,
  refetch
} = useFetchConversationHistory(
  computed(() => ({
    start_date: props.dateRange.start || undefined,
    end_date: props.dateRange.end || undefined
  }))
)

// Emit data to parent when loaded
watch(conversationHistoryData, (newData) => {
  if (newData && newData.summary) {
    emit('update-data', newData)
  }
}, { immediate: true })

// Computed Properties
const filteredConversations = computed(() => {
  if (!conversationHistoryData.value?.conversations) return []
  
  return conversationHistoryData.value.conversations.filter(conv => {
    const matchesSearch = !searchTerm.value || 
      conv.guest?.full_name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      conv.last_message_preview?.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesDepartment = !departmentFilter.value || 
      conv.department === departmentFilter.value
    
    const matchesType = !typeFilter.value || 
      conv.conversation_type === typeFilter.value
    
    return matchesSearch && matchesDepartment && matchesType
  })
})

const availableDepartments = computed(() => {
  if (!conversationHistoryData.value?.summary?.department_breakdown) return []
  
  return conversationHistoryData.value.summary.department_breakdown.map(dept => dept.department).sort()
})

const availableTypes = computed(() => {
  if (!conversationHistoryData.value?.summary?.type_breakdown) return []
  
  return conversationHistoryData.value.summary.type_breakdown.map(type => type.conversation_type).sort()
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

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const calculateFulfillmentRate = () => {
  if (!conversationHistoryData.value?.conversations) return '0%'
  
  const total = conversationHistoryData.value.conversations.length
  const fulfilled = conversationHistoryData.value.conversations.filter(conv => conv.is_fulfilled).length
  
  if (total === 0) return '0%'
  
  return `${Math.round((fulfilled / total) * 100)}%`
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800'
    case 'closed':
      return 'bg-green-100 text-green-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const viewConversationDetails = (conversation: any) => {
  // Simple alert for now - can be enhanced with a modal
  alert(`Conversation Details:\n\nGuest: ${conversation.guest?.full_name || 'Unknown'}\nDepartment: ${conversation.department}\nType: ${conversation.conversation_type?.replace('_', ' ') || 'Unknown'}\nStatus: ${conversation.status}\nMessages: ${conversation.message_count}\nLast Message: ${conversation.last_message_preview || 'N/A'}\nFulfilled: ${conversation.is_fulfilled ? 'Yes' : 'No'}`)
}

const clearFilters = () => {
  searchTerm.value = ''
  departmentFilter.value = ''
  typeFilter.value = ''
}

// Watch for date range changes
watch(() => props.dateRange, () => {
  refetch()
}, { deep: true })

// Export functionality
const exportPDF = () => {
  emit('export-pdf', conversationHistoryData.value)
}
</script>