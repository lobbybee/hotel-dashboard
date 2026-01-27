# LobbyBee Verified Frontend Features

## 1. Dashboard & Onboarding (`index`, `onboard`)
### Dashboard
*   **Real-time Overview**
    *   Visual masonry grid of key hotel metrics.
    *   Displays: Occupancy Rate, Active Stays, Expected Check-ins/Checkouts.
    *   Room Status Counts (Available, Occupied, Cleaning, Maintenance, Out of Order).
*   **Quick Access**
    *   Hotel Verification QR Code (if verified).
    *   Current Date/Time display.

### Onboarding Wizard
*   **Step-by-Step Setup**
    *   Guided flow for new hotels: Welcome -> Basic Info -> Contact -> Location -> Settings -> Complete.
    *   **Data Collection**: Hotel Name, Description, Phone, Email, Google Review Link, Address details, Check-in Time, Timezone.
    *   **Review Mode**: Summary confirmation before final save.
    *   **Progress Tracking**: Visual step indicators and navigation control.

## 2. Front Desk Operations (`checkin`, `checkout`)
### Check-in Management
*   **Pending Stays**: View and process mobile/online check-in requests.
*   **Manual Walk-in**: Direct check-in for walk-in guests.
*   **Tabbed Interface**: Seamless switching between Pending and Walk-in modes.

### Checkout Management
*   **Active Stay Search**: Global search by guest name or room number.
*   **Stay Details Card**:
    *   Visual indicators for Billing Cycle (12h/24h) and WhatsApp status.
    *   Quick actions: Check Out, View Guest.
*   **Guest Information Dialog**:
    *   Full guest profile (Nationality, Language, DOB).
    *   **Identity Verification**: View front/back of uploaded ID documents.
    *   **Stay Extension**: Date picker to modify checkout date instantly.
*   **Checkout Process**:
    *   **Billing**: Input final charges.
    *   **Quality Control**: Internal Rating (1-5 stars) and Staff Notes.
    *   **Guest Flagging**: Option to flag problematic guests (requires mandatory note).
    *   **Print Summary**: Auto-generates PDF receipt/summary for the guest.

## 3. Room & Floor Management (`rooms`)
### Room Grid
*   **Visual Floor Plan**: Grid view of rooms filtered by Floor.
*   **Status Indicators**: Color-coded badges for Available, Occupied, Cleaning, Maintenance, Out of Order.
*   **Bulk Operations**:
    *   **Mass Creation**: Add ranges of rooms (e.g., 101-120) with Prefix/Suffix support.
    *   **Bulk Status Update**: Change status for multiple selected rooms at once.
    *   **Bulk Delete**: Remove multiple rooms simultaneously.
*   **Filters**: Floor selection, Status filter, Text search.

### Category Management
*   **Category CRUD**: Create/Edit/Delete room categories (e.g., Deluxe, Suite).
*   **Attributes**: Base Price, Max Occupancy, Amenities list.
*   **WiFi Management**: Manage credentials per room/category.

## 4. Staff & Department Management (`staff`, `departments`)
### Staff Administration
*   **Role-Based Access**:
    *   Roles: Hotel Admin, Manager, Receptionist, Department Staff.
    *   Color-coded role badges for easy identification.
*   **Staff Directory**: List view with Search and Filters (Role/Department).
*   **Account Management**: Create/Edit/Delete staff profiles.
*   **Security**: Reset passwords, Toggle active status.

### Department Configuration
*   **Department Setup**: Create departments (Reception, Housekeeping, Spa, etc.).
*   **Operational Details**: Set Operating Hours and dedicated WhatsApp numbers.
*   **Visual Identity**: Pre-defined icons and color schemes for each department type.

## 5. Hotel Administration (`hotel-profile`, `settings`)
### Profile Management
*   **General Info**: Update logo, description, and contact details.
*   **Location Services**: Manage address and map coordinates.
*   **Operational Settings**: Toggle Breakfast/Dinner reminders, Set Check-in time.
*   **Document Vault**: Upload/View internal hotel documents (Licenses, Permits).
*   **QR Code**: View and verify hotel identity QR.

### Account Settings
*   **Security**: Password change functionality with strength validation.

## 6. Reports & Analytics (`reports`)
### Analytics Dashboard
*   **KPI Cards**: Total Guests, Rooms, Occupancy %, Revenue.
*   **Date Filtering**: Custom date range selection for all reports.

### Detailed Reports (PDF Export)
*   **Guest History**: Visitor frequency, preferred languages, contact info.
*   **Room History**: Utilization rates, stay counts per room/floor.
*   **Conversation Stats**: Message volume, response times, active chats.
*   **Feedback Analytics**: Guest ratings distribution and comment logs.
*   **PDF Generation**: Client-side generation of professional reports including tables and headers.

## 7. Communication (`chat`, `message_templates`)
### Chat System
*   **Integrated Messenger**: Real-time chat interface (via `ChatApp` component).

### Template Manager
*   **Response Library**: Manage custom message templates for quick replies.
*   **Quick Actions**: Create, Edit, Delete, and Toggle Active status for templates.
*   **Role Access**: Restricted access for creating global vs local templates (implied).
