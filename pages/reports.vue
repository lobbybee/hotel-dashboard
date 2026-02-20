<template>
  <div class="p-5 bg-gray-50 min-h-screen max-w-screen overflow-x-hidden">
    <!-- Page Header -->
    <div class="content-container">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Hotel Reports</h1>
          <p class="text-gray-600 mt-1">Comprehensive analytics and insights</p>
        </div>

        <!-- Export Controls -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <!-- Date Range Filter -->
          <div class="flex gap-2 w-full sm:w-auto">
            <input
              v-model="dateRange.start"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:flex-none"
              placeholder="Start date"
            />
            <input
              v-model="dateRange.end"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:flex-none"
              placeholder="End date"
            />
          </div>

          <!-- Export Buttons -->
          <button
            @click="exportToPDF"
            :disabled="isExporting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap max-w-full sm:max-w-xs"
          >
            <i class="fas fa-file-pdf" v-if="!isExporting"></i>
            <i class="fas fa-spinner fa-spin" v-if="isExporting"></i>
            <span class="truncate">{{ isExporting ? 'Exporting...' : 'Export PDF' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isOverviewLoading" class="content-container">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p class="text-gray-600">Loading overview data...</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="overviewError" class="content-container">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
          <div>
            <h3 class="text-red-800 font-semibold">Error Loading Data</h3>
            <p class="text-red-700 mt-1">{{ overviewError?.message || 'Failed to load overview statistics' }}</p>
            <button
              @click="refetchOverview"
              class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="content-container space-y-6">
      <!-- Overview Statistics -->
      <section id="overview-section">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fas fa-chart-line text-blue-600"></i>
          Overview Statistics
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Total Guests Card -->
          <div class="card p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 bg-cyan-50 rounded-lg">
                <i class="fas fa-users text-cyan-600 text-xl"></i>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm text-gray-600">Total Guests</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(overviewStats?.total_guests || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Total Rooms Card -->
          <div class="card p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 bg-indigo-50 rounded-lg">
                <i class="fas fa-bed text-indigo-600 text-xl"></i>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm text-gray-600">Total Rooms</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(overviewStats?.total_rooms || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Occupancy Rate Card -->
          <div class="card p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 bg-emerald-50 rounded-lg">
                <i class="fas fa-percentage text-emerald-600 text-xl"></i>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm text-gray-600">Occupancy Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatPercentage(overviewStats?.occupancy_rate || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Revenue Card -->
          <div class="card p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 bg-lime-50 rounded-lg">
                <i class="fas fa-dollar-sign text-lime-600 text-xl"></i>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm text-gray-600">Total Revenue</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(overviewStats?.total_revenue || 0) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Detailed Reports Tabs -->
      <section>
        <div class="border-b border-gray-200">
          <nav class="flex space-x-1 sm:space-x-8 overflow-x-auto scrollbar-hide">
            <button
              v-for="tab in reportTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors min-w-fit sm:min-w-0 flex-shrink-0',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="[tab.icon, 'mr-1 sm:mr-2']"></i>
              <span class="hidden sm:inline">{{ tab.label }}</span>
              <span class="sm:hidden">{{ tab.label.split(' ')[0] }}</span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mt-6">
          <!-- Guest History Tab -->
          <div v-if="activeTab === 'guests'" id="guest-history-section">
            <GuestHistoryReport
              :date-range="dateRange"
              @update-data="(data) => guestHistoryData = data"
            />
          </div>

          <!-- Room History Tab -->
          <div v-if="activeTab === 'rooms'" id="room-history-section">
            <RoomHistoryReport
              :date-range="dateRange"
              @update-data="(data) => roomHistoryData = data"
            />
          </div>

          <!-- Conversation History Tab -->
          <div v-if="activeTab === 'conversations'" id="conversation-history-section">
            <ConversationHistoryReport
              :date-range="dateRange"
              @update-data="(data) => conversationHistoryData = data"
            />
          </div>

          <!-- Feedback Analytics Tab -->
          <div v-if="activeTab === 'feedback'" id="feedback-analytics-section">
            <FeedbackAnalyticsReport
              :date-range="dateRange"
              @update-data="(data) => feedbackAnalyticsData = data"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  useFetchHotelOverview,
  useFetchGuestHistory,
  useFetchRoomHistory,
  useFetchConversationHistory,
  useFetchFeedbackAnalytics
} from '@/composables/useReporting'

// Import child components
import GuestHistoryReport from '@/components/reports/GuestHistoryReport.vue'
import RoomHistoryReport from '@/components/reports/RoomHistoryReport.vue'
import ConversationHistoryReport from '@/components/reports/ConversationHistoryReport.vue'
import FeedbackAnalyticsReport from '@/components/reports/FeedbackAnalyticsReport.vue'

// State
const activeTab = ref('guests')
const isExporting = ref(false)
const dateRange = reactive({
  start: '',
  end: ''
})

// Initialize default dates
try {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.end = end.toISOString().split('T')[0]
  dateRange.start = start.toISOString().split('T')[0]
} catch (error) {
  console.error('Error initializing date range:', error)
  dateRange.end = ''
  dateRange.start = ''
}

// Report Tabs Configuration
const reportTabs = [
  { id: 'guests', label: 'Guest History', icon: 'fas fa-users' },
  { id: 'rooms', label: 'Room History', icon: 'fas fa-bed' },
  { id: 'conversations', label: 'Conversations', icon: 'fas fa-comments' },
  { id: 'feedback', label: 'Feedback Analytics', icon: 'fas fa-star' }
]

// Hotel Overview Stats
const hotelOverviewResult = useFetchHotelOverview(
  computed(() => {
    return {
      date: dateRange.start && dateRange.end ? undefined : getCurrentDate(),
      start_date: dateRange.start || undefined,
      end_date: dateRange.end || undefined
    }
  })
)

const hotelOverview = hotelOverviewResult.hotelOverview
const isOverviewLoading = hotelOverviewResult.isLoading
const overviewError = hotelOverviewResult.error
const refetchOverview = hotelOverviewResult.refetch

// Computed overview stats
const overviewStats = computed(() => {
  // Check if hotelOverview exists and has value
  if (!hotelOverview?.value) {
    return {
      total_guests: 0,
      total_rooms: 0,
      occupancy_rate: 0,
      total_revenue: 0,
      current_guests: 0,
      average_daily_rate: 0
    }
  }

  return {
    total_guests: hotelOverview.value.metrics?.total_guests || 0,
    total_rooms: hotelOverview.value.metrics?.total_rooms || 0,
    occupancy_rate: hotelOverview.value.metrics?.occupancy_rate || 0,
    total_revenue: hotelOverview.value.metrics?.total_revenue || 0,
    current_guests: hotelOverview.value.metrics?.current_guests || 0,
    average_daily_rate: hotelOverview.value.metrics?.average_daily_rate || 0,
    ...hotelOverview.value.metrics
  }
})


// References to component data for PDF export
const guestHistoryData = ref(null)
const roomHistoryData = ref(null)
const conversationHistoryData = ref(null)
const feedbackAnalyticsData = ref(null)

// Methods
const getCurrentDate = () => {
  try {
    return new Date().toISOString().split('T')[0]
  } catch (error) {
    console.error('Error getting current date:', error)
    return ''
  }
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const formatDecimal = (value: number) => {
  return value.toFixed(1)
}

const exportToPDF = async () => {
  if (isExporting.value) return

  isExporting.value = true

  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 30

    // Hotel Name and Details
    const hotelDetails = hotelOverview.value?.hotel_details
    const hotelName = hotelDetails?.name || 'Hotel Analytics Report'
    const hotelAddress = hotelDetails?.address || ''
    const hotelPhone = hotelDetails?.phone || ''

    // Title with Hotel Name
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(hotelName, pageWidth / 2, yPosition, { align: 'center' })

    // Hotel Details
    yPosition += 10
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    if (hotelAddress) {
      pdf.text(hotelAddress, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 8
    }
    if (hotelPhone) {
      pdf.text(hotelPhone, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 8
    }

    // Report Title
    yPosition += 5
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' })

    // Date range
    yPosition += 15
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const dateText = dateRange.start && dateRange.end
      ? `Period: ${dateRange.start} to ${dateRange.end}`
      : `Report Date: ${getCurrentDate()}`
    pdf.text(dateText, pageWidth / 2, yPosition, { align: 'center' })

    // Overview Statistics
    yPosition += 20
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Overview Statistics', 20, yPosition)

    yPosition += 15
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const overviewData = [
      `Total Guests: ${formatNumber(overviewStats.value.total_guests)}`,
      `Total Rooms: ${formatNumber(overviewStats.value.total_rooms)}`,
      `Occupancy Rate: ${formatPercentage(overviewStats.value.occupancy_rate)}`,
      `Total Revenue: ${formatCurrency(overviewStats.value.total_revenue)}`
    ]

    overviewData.forEach((line) => {
      pdf.text(line, 25, yPosition)
      yPosition += 8
    })

    // Simple data from current tab
    yPosition += 15
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    const currentTab = activeTab.value || 'guests'
    const tabLabel = reportTabs.find(tab => tab.id === currentTab)?.label || 'Report'
    pdf.text(`${tabLabel} Summary`, 20, yPosition)

    yPosition += 15
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')

    // Add detailed tab-specific data
    switch (currentTab) {
      case 'guests':
        pdf.text('Guest History - Detailed guest stay records and analytics', 25, yPosition)
        yPosition += 10
        pdf.text(`Total Guest Records: ${formatNumber(guestHistoryData.value?.summary?.total_guests || 0)}`, 25, yPosition)
        yPosition += 8
        pdf.text(`Total Stay Records: ${formatNumber(guestHistoryData.value?.summary?.total_stays || 0)}`, 25, yPosition)
        yPosition += 15

        // Add guest details table
        if (guestHistoryData.value?.guests && guestHistoryData.value.guests.length > 0) {
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Guest Details:', 25, yPosition)
          yPosition += 10

          // Table headers
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Guest Name', 25, yPosition)
          pdf.text('Stays', 80, yPosition)
          pdf.text('Contact', 120, yPosition)
          pdf.text('Language', 160, yPosition)
          yPosition += 8

          // Table rows
          pdf.setFont('helvetica', 'normal')
          guestHistoryData.value.guests.forEach((guest: any) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage()
              yPosition = 30
            }
            pdf.text(guest.full_name || 'N/A', 25, yPosition)
            pdf.text(String(guest.total_stays || 0), 80, yPosition)
            pdf.text(guest.whatsapp_number || 'N/A', 120, yPosition)
            pdf.text(guest.preferred_language || 'en', 160, yPosition)
            yPosition += 7
          })
        }
        break

      case 'rooms':
        pdf.text('Room History - Room utilization and stay analytics', 25, yPosition)
        yPosition += 10
        pdf.text(`Total Rooms: ${formatNumber(roomHistoryData.value?.summary?.total_rooms || 0)}`, 25, yPosition)
        yPosition += 8
        pdf.text(`Total Room Stays: ${formatNumber(roomHistoryData.value?.summary?.total_stays || 0)}`, 25, yPosition)
        yPosition += 15

        // Add room details table
        if (roomHistoryData.value?.rooms && roomHistoryData.value.rooms.length > 0) {
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Room Details:', 25, yPosition)
          yPosition += 10

          // Table headers
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Room Number', 25, yPosition)
          pdf.text('Category', 60, yPosition)
          pdf.text('Floor', 100, yPosition)
          pdf.text('Total Stays', 130, yPosition)
          pdf.text('Occupancy Rate', 160, yPosition)
          yPosition += 8

          // Table rows
          pdf.setFont('helvetica', 'normal')
          roomHistoryData.value.rooms.forEach((room: any) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage()
              yPosition = 30
            }
            pdf.text(room.room_number || 'N/A', 25, yPosition)
            pdf.text(room.category || 'N/A', 60, yPosition)
            pdf.text(String(room.floor || 0), 100, yPosition)
            pdf.text(String(room.total_stays || 0), 130, yPosition)
            pdf.text(`${formatPercentage(room.occupancy_rate || 0)}`, 160, yPosition)
            yPosition += 7
          })
        }
        break

      case 'conversations':
        pdf.text('Conversation History - Guest communication analytics', 25, yPosition)
        yPosition += 10
        pdf.text(`Total Conversations: ${formatNumber(conversationHistoryData.value?.summary?.total_conversations || 0)}`, 25, yPosition)
        yPosition += 8
        pdf.text(`Total Messages: ${formatNumber(conversationHistoryData.value?.summary?.total_messages || 0)}`, 25, yPosition)
        yPosition += 15

        // Add conversation details table
        if (conversationHistoryData.value?.conversations && conversationHistoryData.value.conversations.length > 0) {
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Conversation Details:', 25, yPosition)
          yPosition += 10

          // Table headers
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Guest', 25, yPosition)
          pdf.text('Messages', 80, yPosition)
          pdf.text('Last Activity', 120, yPosition)
          pdf.text('Status', 160, yPosition)
          yPosition += 8

          // Table rows
          pdf.setFont('helvetica', 'normal')
          conversationHistoryData.value.conversations.forEach((conv: any) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage()
              yPosition = 30
            }
            pdf.text(conv.guest?.full_name || 'N/A', 25, yPosition)
            pdf.text(String(conv.message_count || 0), 80, yPosition)
            const lastActivity = conv.last_message_at || conv.created_at
            pdf.text(lastActivity ? new Date(lastActivity).toLocaleDateString() : 'N/A', 120, yPosition)
            pdf.text(conv.status || 'N/A', 160, yPosition)
            yPosition += 7
          })
        }
        break

      case 'feedback':
        pdf.text('Feedback Analytics - Guest ratings and satisfaction analytics', 25, yPosition)
        yPosition += 10
        pdf.text(`Total Feedback: ${formatNumber(feedbackAnalyticsData.value?.summary?.total_feedback || 0)}`, 25, yPosition)
        yPosition += 8
        pdf.text(`Average Rating: ${formatDecimal(feedbackAnalyticsData.value?.summary?.average_rating || 0)} / 5.0`, 25, yPosition)
        yPosition += 15

        // Add feedback details table
        if (feedbackAnalyticsData.value?.feedbacks && feedbackAnalyticsData.value.feedbacks.length > 0) {
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Feedback Details:', 25, yPosition)
          yPosition += 10

          // Table headers
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Guest', 25, yPosition)
          pdf.text('Rating', 80, yPosition)
          pdf.text('Category', 100, yPosition)
          pdf.text('Date', 140, yPosition)
          pdf.text('Comment', 160, yPosition)
          yPosition += 8

          // Table rows
          pdf.setFont('helvetica', 'normal')
          feedbackAnalyticsData.value.feedbacks.forEach((feedback: any) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage()
              yPosition = 30
            }
            pdf.text(feedback.guest?.full_name || 'N/A', 25, yPosition)
            pdf.text(String(feedback.rating || 0), 80, yPosition)
            pdf.text(feedback.stay?.room?.category || feedback.category || 'N/A', 100, yPosition)
            pdf.text(new Date(feedback.created_at).toLocaleDateString(), 140, yPosition)
            pdf.text(feedback.note?.substring(0, 30) + '...' || '', 160, yPosition)
            yPosition += 7
          })
        }
        break
    }

    // LobbyBee Branding
    yPosition = pageHeight - 30
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Powered by LobbyBee', pageWidth / 2, yPosition, { align: 'center' })

    // Footer
    yPosition += 10
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' })

    // Save PDF
    const hotelNameSlug = hotelDetails?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'hotel'
    const fileName = `${hotelNameSlug}-report-${currentTab}-${getCurrentDate()}.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Failed to export PDF. Please try again.')
  } finally {
    isExporting.value = false
  }
}

</script>
