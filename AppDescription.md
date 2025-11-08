# Hotel Dashboard Application Description

## Technology Stack
- **Frontend Framework**: Vue 3 with Composition API
- **UI Component Library**: PrimeVue
- **Build Tool**: Vite/Nuxt 3
- **State Management**: Pinia
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom PrimeVue theme

## Application Overview
This is a comprehensive Hotel Management Dashboard built for hotel operations including guest management, room inventory, staff administration, and hotel profile configuration. The application provides a modern, responsive interface with robust functionality for hotel staff and administrators.

---

## Pages Analysis

### 1. Check-in Page (`pages/checkin.vue`)

#### Data Flow
- **Data Received**: Minimal data (uses child components for data management)
- **Data Passed**: Mainly layout and navigation structure to child components

#### Functions & Features
1. **Layout Container Functions**:
   - Tab-based navigation interface
   - Responsive layout with animated transitions
   - Integration with CheckinHeader component
   - TabView/TabPanel components for organizing functionality

2. **Tab Management**:
   - "Pending Stays" tab for pre-booked guest check-ins
   - "Manual Walk-in" tab for on-the-spot guest registrations
   - Tab switching with animated transitions

#### Child Components Used
- `CheckinHeader`: Page title and description display
- `CheckinPendingStaysTab`: Manages pending guest reservations
- `CheckinManualWalkinTab`: Handles walk-in guest registrations

---

### 2. Check-in Child Components

#### CheckinHeader (`components/Checkin/Header.vue`)
**Functions**:
- Display animated page title and subtitle
- Show hotel check-in branding and navigation context
- Fade-in animation effects
- No data management (pure presentation component)

#### CheckinPendingStaysTab (`components/Checkin/PendingStaysTab.vue`)
**Data Received**: 
- Guest stay information from API
- Room availability data
- Identity verification status

**Functions**:
1. **Stay Management**:
   - Fetch pending stays from backend
   - Display guest information cards
   - Show verification status indicators
   - Handle loading and error states

2. **Check-in Process**:
   - Direct check-in functionality
   - WhatsApp check-in initiation
   - Room assignment during check-in
   - Register number management

3. **Guest Information Display**:
   - Guest full name and contact details
   - Room assignment preview
   - Expected check-in dates
   - Identity verification status badges

4. **Dialog Management**:
   - Check-in confirmation dialog
   - Room selection during check-in
   - Create new stay functionality
   - Error handling and toast notifications

#### CheckinManualWalkinTab (`components/Checkin/ManualWalkinTab.vue`)
**Data Received**: 
- Guest search results
- Available room inventory
- Room categories and floors

**Functions**:
1. **Guest Search & Selection**:
   - Phone number-based guest search
   - Guest profile selection interface
   - New guest creation workflow

2. **Guest Information Management**:
   - Complete guest form handling
   - Document upload for identity verification
   - Accompanying guest information
   - Nationality and personal details

3. **Stay Configuration**:
   - Room selection by category and floor
   - Check-out date selection
   - Multiple room assignment capability
   - Real-time room availability checking

4. **Document Management**:
   - Identity document upload (front/back)
   - Document type selection
   - File validation and size limits
   - Accompanying guest document handling

#### CheckinGuestForm (`components/Checkin/GuestForm.vue`)
**Data Received**: 
- Guest form data object
- Document types and validation rules

**Functions**:
1. **Guest Data Collection**:
   - Full name, email, phone inputs
   - Date of birth and nationality
   - Number of guests management
   - Accompanying guest names

2. **Document Handling**:
   - Document type selection dropdown
   - File upload interface
   - Multiple guest document management
   - Document preview and validation

3. **Form Validation**:
   - Required field validation
   - Email format validation
   - Phone number format checking
   - Real-time error display

#### CheckinStayForm (`components/Checkin/StayForm.vue`)
**Data Received**: 
- Stay form data (rooms, dates)
- Available rooms inventory
- Room categories and floor data

**Functions**:
1. **Room Selection**:
   - Category-based filtering
   - Floor-based filtering
   - Multi-room selection capability
   - Real-time availability checking

2. **Stay Configuration**:
   - Check-out date selection with validation
   - Room preview with categories
   - Selected rooms display by category
   - Room count preview

3. **Document Upload**:
   - Identity document type selection
   - Front and back document upload
   - File format and size validation
   - Optional backside document toggle

4. **Filter Management**:
   - Room category filter dropdown
   - Floor selection with loading states
   - Search and filter combinations
   - Filter reset functionality

#### CheckinGuestSearch (`components/Checkin/GuestSearch.vue`)
**Data Received**: 
- Search query parameters
- Guest search results

**Functions**:
1. **Guest Search**:
   - Phone number-based search
   - Real-time search functionality
   - Search result display in card format
   - Search loading states

2. **Guest Selection**:
   - Guest profile cards display
   - Guest details preview (name, phone, email)
   - Selection confirmation
   - Search result clearing

3. **Search Management**:
   - Search query input handling
   - Enter key search support
   - Search reset functionality
   - No results state handling

#### CheckinConfirmationDialog (`components/Checkin/ConfirmationDialog.vue`)
**Data Received**: 
- Stay object with guest details
- Available rooms for assignment
- Room categories and floors

**Functions**:
1. **Check-in Confirmation**:
   - Guest details display (name, email, phone, nationality)
   - Identity document verification status
   - Document preview and verification badges
   - Room selection for check-in

2. **Room Assignment**:
   - Available rooms dropdown with filtering
   - Category and floor-based room filtering
   - Room loading states
   - Default room pre-selection

3. **Stay Creation**:
   - Check-out date selection for new stays
   - Register number input
   - Room assignment validation
   - Create stay and check-in workflow

4. **Dialog Management**:
   - Modal visibility control
   - Form validation before submission
   - Loading states during processing
   - Success/error handling

---

### 3. Rooms Page (`pages/rooms.vue`)

#### Data Flow
**Data Received from API**:
- Floors data for hotel structure
- Rooms inventory with status and categories
- Room categories with pricing and amenities
- Available amenities list

**Data Passed to Components**:
- Filtered room lists by floor and status
- Room categories with counts and details
- Selected rooms for bulk operations
- Form data for room and category management

#### Functions & Features
1. **Room Management**:
   - Complete room inventory management
   - Room status updates (available, occupied, cleaning, maintenance, out of order)
   - Room category assignment and editing
   - Bulk room creation functionality

2. **Category Management**:
   - Create, edit, delete room categories
   - Category pricing and occupancy management
   - Amenities assignment per category
   - Category-based room organization

3. **Floor Operations**:
   - Floor-based room organization
   - Floor navigation and selection
   - Dynamic floor creation
   - Floor-wise room display

4. **Bulk Operations**:
   - Multi-room selection for bulk actions
   - Bulk status updates
   - Bulk room deletion
   - Selection management interface

5. **Search and Filtering**:
   - Real-time room search with debouncing
   - Status-based filtering
   - Floor-based filtering
   - Category-based filtering

6. **Form Management**:
   - Room category creation/editing forms
   - Room editing forms
   - Bulk room creation forms
   - Form validation and error handling

7. **Data Synchronization**:
   - Real-time data refetching after operations
   - Optimistic UI updates
   - Error recovery and retry mechanisms
   - Loading states management

---

### 4. Room Management Components

#### RoomCategories (`components/Room/RoomCategories.vue`)
**Data Received**: 
- Categories list with room counts
- Loading and error states
- Update/delete operation status

**Functions**:
1. **Category Display**:
   - Grid layout of category cards
   - Category details (name, description, price, occupancy)
   - Room count per category
   - Amenities display with overflow handling

2. **Category Actions**:
   - Add new category functionality
   - Edit existing category details
   - Delete category with confirmation
   - Status indicators (active/inactive)

3. **Visual Elements**:
   - Category icons and badges
   - Animated hover effects
   - Responsive grid layout
   - Loading states and empty states

4. **Pagination**:
   - Category list pagination
   - Page change event handling
   - Records per page management

#### RoomFilters (`components/Room/RoomFilters.vue`)
**Data Received**: 
- Filter values (search, status, floor)
- Available floor options
- Room status options

**Functions**:
1. **Search Functionality**:
   - Real-time room search input
   - Debounced search submission
   - Search query management

2. **Status Filtering**:
   - Room status dropdown filter
   - Multiple status options
   - Clear filter functionality

3. **Floor Selection**:
   - Floor selector button group
   - Dynamic floor option generation
   - Add new floor functionality
   - Floor navigation

4. **Filter Synchronization**:
   - Local state management
   - Two-way binding with parent
   - Filter change event emission

#### RoomGrid (`components/Room/RoomGrid.vue`)
**Data Received**: 
- Room list with details
- Selected rooms array
- Total room count for pagination

**Functions**:
1. **Room Display**:
   - Responsive grid layout for rooms
   - Color-coded room status indicators
   - Room number and category display
   - Interactive room cards

2. **Room Interaction**:
   - Click to select/deselect rooms
   - Keyboard navigation support
   - Room editing functionality
   - Accessibility attributes

3. **Visual Status Indicators**:
   - Color-coded borders and backgrounds
   - Status badges with icons
   - Hover effects and transitions
   - Selection ring indicators

4. **Pagination**:
   - Room grid pagination
   - Page navigation controls
   - Records per page display

5. **Empty States**:
   - No rooms on floor display
   - Loading states
   - Error states

#### SelectedRoomsActions (`components/Room/SelectedRoomsActions.vue`)
**Data Received**: 
- Selected room count
- Operation loading states
- Available actions

**Functions**:
1. **Bulk Action Interface**:
   - Display selected rooms count
   - Bulk status change button
   - Bulk delete functionality
   - Clear selection option

2. **Action Management**:
   - Loading state indicators
   - Action button enabling/disabling
   - Confirmation dialog triggers
   - Responsive button layout

3. **Visual Design**:
   - Sticky bottom positioning
   - Backdrop blur effect
   - Animated appearance
   - Mobile-responsive design

#### RoomDialogs (`components/Room/RoomDialogs.vue`)
**Data Received**: 
- Dialog visibility states
- Form data for all dialog types
- Validation error messages
- Available options for dropdowns

**Functions**:
1. **Category Management Dialogs**:
   - Add/Edit category form with validation
   - Category fields: name, description, price, occupancy
   - Amenities selection with checkboxes
   - Category deletion confirmation

2. **Bulk Room Creation Dialog**:
   - Start and end room number input
   - Floor assignment dropdown
   - Category selection
   - Room count preview

3. **Room Edit Dialog**:
   - Room details display
   - Category assignment dropdown
   - Status selection dropdown
   - Room update confirmation

4. **Bulk Status Dialog**:
   - Status selection for multiple rooms
   - Selected room count display
   - Status change confirmation

5. **Delete Confirmation Dialogs**:
   - Category deletion with warning
   - Bulk room deletion confirmation
   - Impact warnings and information

6. **Form Validation**:
   - Real-time validation for all forms
   - Error message display
   - Required field indicators
   - Input format validation

#### RoomLegend (`components/Room/RoomLegend.vue`)
**Functions**:
1. **Status Legend Display**:
   - Color-coded status indicators
   - Room status descriptions
   - Icon associations for statuses
   - Visual reference for room colors

2. **Status Types**:
   - Available (green)
   - Occupied (blue)
   - Cleaning (yellow)
   - Maintenance (yellow)
   - Out of Order (red)

#### WifiCredentialManager (`components/Room/WifiCredentialManager.vue`)
**Data Received**: 
- WiFi credentials list
- Room categories for assignment
- Floor options for organization

**Functions**:
1. **WiFi Credential Management**:
   - Create, edit, delete WiFi networks
   - Network name and password management
   - Floor and category assignment
   - Active/inactive status toggling

2. **Search and Filtering**:
   - Network name search
   - Floor-based filtering
   - Category-based filtering
   - Status-based filtering

3. **Security Features**:
   - Password visibility toggle
   - Copy to clipboard functionality
   - Password masking/showing
   - Network activation controls

4. **User Interface**:
   - Credential cards with details
   - Action buttons for each credential
   - Pagination for large lists
   - Loading and error states

5. **Forms and Validation**:
   - Add/Edit WiFi network forms
   - Password strength validation
   - Required field validation
   - Duplicate network prevention

---

### 5. Checkout Page (`pages/checkout.vue`)

#### Data Flow
**Data Received from API**:
- Active guest stays list
- Guest and room details for each stay
- Check-out operation results

**Data Passed**: Minimal data (mainly display and operation handling)

#### Functions & Features
1. **Active Stays Display**:
   - Grid layout of currently checked-in guests
   - Guest information cards with photos
   - Room assignment details
   - Stay duration information

2. **Guest Information Display**:
   - Guest full name and contact details
   - WhatsApp number display
   - Check-in and check-out dates
   - Room number and status badges

3. **Search Functionality**:
   - Search by guest name
   - Search by room number
   - Real-time filtering of active stays
   - Case-insensitive search

4. **Check-out Process**:
   - Check-out confirmation dialog
   - Guest stay details confirmation
   - Room status update to 'cleaning'
   - Success/error toast notifications

5. **Status Management**:
   - Loading states during check-out
   - Error handling and retry mechanisms
   - Success confirmation messages
   - Automatic list refresh after operations

6. **Responsive Design**:
   - Mobile-responsive card layout
   - Adaptive grid columns
   - Touch-friendly interaction
   - Loading spinner states

7. **Empty States**:
   - No active stays message
   - Visual empty state illustration
   - Informational text display
   - Refresh button for data reload

---

### 6. Hotel Profile Page (`pages/hotel-profile.vue`)

#### Data Flow
**Data Received from API**:
- Hotel profile information (name, address, contact, etc.)
- Hotel verification status and documents
- Operational settings (check-in times, timezone, etc.)

**Data Passed to Components**:
- Hotel form data with validation
- Document upload handlers
- Profile update functions

#### Functions & Features
1. **Profile Management**:
   - Complete hotel information editing
   - Basic information updates (name, address, contact)
   - Operational settings configuration
   - Document management and uploads

2. **Form Management**:
   - Comprehensive hotel form with validation
   - Real-time error handling and display
   - Form field organization by sections
   - Auto-save and recovery functionality

3. **Document Management**:
   - Business license upload and management
   - Additional documents upload
   - Document preview and download
   - Document update functionality

4. **Settings Configuration**:
   - Check-in time settings
   - Timezone configuration
   - WiFi password management
   - Verification status tracking

5. **QR Code Generation**:
   - Hotel QR code generation for verified hotels
   - High-quality QR code download
   - WhatsApp integration QR codes
   - Custom branding on QR codes

6. **Profile Verification**:
   - Verification status display
   - Verification request triggering
   - Document verification tracking
   - Status badge management

7. **Data Validation**:
   - Form schema validation using Zod
   - Email and phone format validation
   - Required field validation
   - Custom validation rules

8. **UI/UX Features**:
   - Animated page transitions
   - Loading states for all operations
   - Success and error notifications
   - Responsive design for all screen sizes

---

### 7. Hotel Profile Components

#### HotelProfileHeader (`components/Hotel/HotelProfileHeader.vue`)
**Data Received**: 
- Hotel object with basic information
- Loading state for save operations

**Functions**:
1. **Header Display**:
   - Hotel profile page title
   - Hotel name display
   - Save button with loading state
   - Responsive header layout

2. **Save Functionality**:
   - Save button click handling
   - Loading state management
   - Save event emission to parent

#### HotelStatusCard (`components/Hotel/HotelStatusCard.vue`)
**Data Received**: 
- Hotel object with status information

**Functions**:
1. **Status Display**:
   - Verification status badge
   - Status color coding
   - Hotel status information
   - Document approval status

2. **Visual Elements**:
   - Status icons and indicators
   - Color-coded status badges
   - Animated status transitions
   - Professional card design

#### HotelBasicInfo (`components/Hotel/HotelBasicInfo.vue`)
**Data Received**: 
- Hotel form object with basic information
- Validation error messages

**Data Passed**: Updated hotel form data

**Functions**:
1. **Basic Information Forms**:
   - Hotel name input with validation
   - Description textarea with auto-resize
   - Address input fields
   - City, state, country, pincode inputs

2. **Contact Information**:
   - Phone number input with validation
   - Email input with format validation
   - Contact details organization
   - Required field indicators

3. **Form Management**:
   - Real-time form validation
   - Error message display
   - Form field organization
   - Two-way data binding

4. **User Experience**:
   - Floating labels for all inputs
   - Focus state management
   - Responsive form layout
   - Professional styling

#### HotelOperationalSettings (`components/Hotel/HotelOperationalSettings.vue`)
**Data Received**: 
- Hotel form with operational settings
- Validation errors for settings

**Data Passed**: Updated operational settings

**Functions**:
1. **Time Management**:
   - Check-in time picker with 24-hour format
   - Check-out time picker (future feature)
   - Timezone selection dropdown
   - Time format handling and conversion

2. **Settings Configuration**:
   - WiFi password input with masking
   - Operational hour settings
   - Timezone management
   - System configuration options

3. **Advanced Features**:
   - Timezone database integration
   - International time support
   - Time format conversion utilities
   - Settings validation

4. **User Interface**:
   - Professional settings form
   - Input validation and feedback
   - Loading states management
   - Responsive design

#### HotelDocuments (`components/Hotel/HotelDocuments.vue`)
**Data Received**: 
- Hotel object with documents array
- Upload loading states

**Functions**:
1. **Document Management**:
   - Business license upload interface
   - Additional documents upload
   - Document preview with status
   - Document update functionality

2. **File Upload Features**:
   - Drag and drop file upload
   - Multiple file support
   - File validation (type, size)
   - Upload progress indication

3. **Document Display**:
   - Uploaded documents list
   - Document status indicators
   - Document preview links
   - Download functionality

4. **Upload Management**:
   - File type validation (PDF, images)
   - File size limits (2MB)
   - Multiple file handling
   - Upload error management

#### HotelQRCode (`components/Hotel/HotelQRCode.vue`)
**Data Received**: 
- Hotel object with verification status
- Hotel ID for QR code generation

**Functions**:
1. **QR Code Generation**:
   - Dynamic QR code generation for verified hotels
   - WhatsApp integration QR codes
   - Hotel-specific QR code URLs
   - High-resolution QR code generation

2. **QR Code Features**:
   - Custom QR code styling with logo
   - Multiple QR code sizes
   - Download functionality
   - Print-ready QR code generation

3. **Download Management**:
   - High-quality PNG download
   - Custom QR code with branding
   - Cutting guidelines for printing
   - Multiple format support

4. **Verification Integration**:
   - Verification status checking
   - QR code availability based on status
   - Profile verification triggering
   - Status-based feature access

---

### 8. Staff Page (`pages/staff.vue`)

#### Data Flow
**Data Received from API**:
- Staff members list with roles and details
- Department options and role types
- Staff creation, update, delete operation results

**Data Passed**: Minimal data (mainly state management and API calls)

#### Functions & Features
1. **Staff Management**:
   - Complete staff member CRUD operations
   - Staff role assignment and management
   - Department assignment for department staff
   - Staff activation/deactivation

2. **User Account Management**:
   - Staff user account creation
   - Login credentials management
   - Password management and updates
   - Access control by role

3. **Data Organization**:
   - Staff list with pagination
   - Role-based filtering (admin, manager, receptionist, department staff, other)
   - Department-based filtering
   - Search functionality by name, email

4. **Staff Information Display**:
   - Staff member cards with details
   - Role indicators with color coding
   - Department tags for department staff
   - Contact information display
   - Active/inactive status badges

5. **Forms and Validation**:
   - Add/Edit staff forms with validation
   - Password strength requirements
   - Email format validation
   - Required field validation
   - Role-specific field management

6. **User Interface Features**:
   - Responsive data table with sorting
   - Mobile-responsive card layout
   - Loading states for all operations
   - Success/error notifications
   - Confirmation dialogs for destructive actions

7. **Department and Role Management**:
   - Multiple department assignment for department staff
   - Role hierarchy and permissions
   - Role color coding and icons
   - Department filtering options

8. **Bulk Operations**:
   - Multiple staff member selection
   - Bulk status updates
   - Bulk role assignment
   - Bulk delete operations

---

## Data Models and Types

### Core Data Structures

#### Hotel
```typescript
interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  check_in_time: string;
  time_zone: string;
  wifi_password: string;
  status: string; // 'active', 'pending', 'verified', 'suspended'
  documents: HotelDocument[];
}
```

#### Guest
```typescript
interface Guest {
  id: number;
  full_name: string;
  whatsapp_number: string;
  email: string;
  date_of_birth: string;
  nationality: string;
  number_of_guests: number;
  guest_names: string[];
  identity_documents: IdentityDocument[];
}
```

#### Room
```typescript
interface Room {
  id: number;
  room_number: string;
  floor: number;
  category: RoomCategory;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out_of_order';
  wifi_credentials?: WifiCredential[];
}
```

#### Room Category
```typescript
interface RoomCategory {
  id: number;
  name: string;
  description: string;
  base_price: number;
  max_occupancy: number;
  amenities: string[];
}
```

#### Stay
```typescript
interface Stay {
  id: number;
  guest: Guest;
  room: Room;
  check_in_date: string;
  check_out_date: string;
  expected_check_in_date?: string;
  status: 'pending' | 'active' | 'completed';
  identity_verified: boolean;
}
```

#### Staff Member
```typescript
interface Staff {
  id: number;
  username: string;
  email: string;
  user_type: 'hotel_admin' | 'manager' | 'receptionist' | 'department_staff' | 'other_staff';
  phone_number?: string;
  is_active_hotel_user: boolean;
  department: string[];
}
```

#### WiFi Credential
```typescript
interface WifiCredential {
  id: number;
  network_name: string;
  password: string;
  floor?: number;
  room_category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Key Features Summary

### 1. Guest Management
- Complete guest lifecycle management
- Identity verification with document upload
- WhatsApp integration for check-in
- Guest search and profile management
- Multi-guest stay support

### 2. Room Management
- Visual room grid with status indicators
- Category-based room organization
- Bulk room operations
- Room status management
- Floor-based navigation

### 3. Staff Administration
- Role-based access control
- Department-based organization
- Staff account management
- Multi-role assignment capability
- Active/inactive status management

### 4. Hotel Operations
- Comprehensive hotel profile management
- Document verification system
- QR code generation for guest access
- WiFi credential management
- Operational settings configuration

### 5. User Experience
- Responsive design for all devices
- Real-time data synchronization
- Loading states and error handling
- Animated transitions and interactions
- Professional UI with PrimeVue components

### 6. Security & Validation
- Form validation with error handling
- Identity document verification
- Secure password management
- Role-based permissions
- Data validation at multiple levels

---

## Integration Points

### API Integration
- RESTful API communication
- Real-time data fetching and updates
- Error handling and retry mechanisms
- Optimistic UI updates
- Offline capability considerations

### Third-party Services
- WhatsApp API integration
- Document storage services
- QR code generation service
- Email notification services
- Payment gateway integration (future)

### Browser Features
- Clipboard API for password copying
- File upload with drag-and-drop
- Local storage for form persistence
- Responsive design with mobile support
- Print functionality for documents

This comprehensive hotel management system provides all essential functionality for modern hotel operations with a focus on user experience, data management, and operational efficiency.