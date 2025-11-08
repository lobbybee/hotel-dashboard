# Hotel Dashboard Design System

## Overview
This design system captures the visual aesthetics and design principles from the new staff management mockup, focusing on modern, clean, and professional UI components.

## Color Palette

### Primary Colors
- **Background White**: `#FFFFFF` - Main container and card backgrounds
- **Gray 50**: `#F9FAFB` - Subtle background variations
- **Gray 100**: `#F3F4F6` - Hover states and subtle backgrounds

### Text Colors
- **Gray 900**: `#111827` - Primary text color (headings, important content)
- **Gray 600**: `#4B5563` - Secondary text color (descriptions, subtitles)
- **Gray 500**: `#6B7280` - Tertiary text color (placeholders, less important content)
- **Gray 400**: `#9CA3AF` - Muted text (empty states, help text)

### Border Colors
- **Gray 200**: `#E5E7EB` - Default borders for cards and dividers
- **Gray 300**: `#D1D5DB` - Hover borders and interactive elements

### Role-Based Colors
- **Red 600**: `#DC2626` - Hotel Admin (highest privilege)
- **Amber 600**: `#D97706` - Manager 
- **Blue 600**: `#2563EB` - Receptionist
- **Green 600**: `#059669` - Department Staff
- **Gray 600**: `#4B5563` - Other Staff

### Status Colors
- **Success Green**: For active/verified status tags
- **Warning Amber**: For pending status states
- **Info Blue**: For active information states
- **Danger Red**: For suspended/error states
- **Secondary Gray**: For inactive/neutral states

### Status State Colors
- **Success Background**: `bg-green-50 border-green-200` for success states
- **Warning Background**: `bg-amber-50 border-amber-200` for warning states
- **Success Text**: `text-green-900` with `text-green-700` descriptions
- **Warning Text**: `text-amber-900` with `text-amber-700` descriptions

### Room Status Color System
- **Available**: Green (`#10b981`) with `border-green-200/300` backgrounds
- **Occupied**: Blue (`#3b82f6`) with `border-blue-200/300` backgrounds  
- **Cleaning**: Amber (`#f59e0b`) with `border-amber-200/300` backgrounds
- **Maintenance**: Red (`#ef4444`) with `border-red-200/300` backgrounds
- **Out of Order**: Gray (`#6b7280`) with `border-gray-200/300` backgrounds

## Typography

### Font Families
- **Primary**: System UI stack (default browser fonts)
- **Monospace**: For code and IDs (if needed)

### Font Sizes
- **Text 3xl**: `1.875rem` (30px) - Main page titles
  - Weight: 700 (Bold)
- **Text Base**: `1rem` (16px) - Body text, labels
- **Text Sm**: `0.875rem` (14px) - Secondary information
- **Text Xs**: `0.75rem` (12px) - Table headers, tags

### Font Weights
- **Bold (700)**: Page titles, important labels
- **Medium (500)**: Role names, emphasis text
- **Normal (400)**: Body text, descriptions

## Spacing System

### Margin/Padding Scale
- **2**: `0.5rem` (8px) - Tight spacing, between related items
- **3**: `0.75rem` (12px) - Small gaps
- **4**: `1rem` (16px) - Standard spacing, card padding
- **6**: `1.5rem` (24px) - Section spacing
- **8**: `2rem` (32px) - Large section separation

## Layout & Container

### Page Layout
- **Max Width Container**: `max-w-7xl mx-auto` - Standard width for data-heavy pages
- **Form Container**: `max-w-5xl mx-auto` - Optimized width for form layouts
- **Full Width**: `w-full` - For responsive elements
- **Flex Center**: `flex justify-center items-center` - For centering content

### Card & Container Design
- **Main Container**: White background with subtle border
  ```css
  background: #FFFFFF;
  border-radius: 0.5rem (8px);
  border: 1px solid #E5E7EB;
  ```

### Form Layout Patterns
- **Section Spacing**: `space-y-6` (24px) between form sections
- **Grid Layout**: `grid grid-cols-1 md:grid-cols-2 gap-4` for responsive form fields
- **Field Spanning**: `md:col-span-2` for full-width fields on larger screens
- **Label Spacing**: `mb-2` (8px) between labels and inputs

## Components

### 1. Page Header
- **Title Spacing**: `mb-2` (8px margin bottom)
- **Subtitle**: Lighter color (`text-gray-600`)
- **Button Alignment**: Right-aligned with flex layout

### 2. Search & Filter Bar
- **Container**: White card with padding `p-4` (16px)
- **Layout**: Flex with responsive columns
- **Gap**: `gap-4` (16px) between elements
- **Search Input**: Icon-left treatment with full width
- **Dropdowns**: Fixed widths (`w-full sm:w-56` and `w-full sm:w-48`)

### 3. Table Design
- **Header Background**: `bg-gray-50` with gray borders
- **Header Text**: Uppercase, extra small font, medium weight
- **Row Dividers**: `divide-y divide-gray-200`
- **Cell Padding**: `px-6 py-4` (24px horizontal, 16px vertical)
- **Hover Effect**: `hover:bg-gray-50 transition-colors`

### 4. Avatar System
- **Size**: `w-10 h-10` (40px)
- **Shape**: Fully rounded (`rounded-full`)
- **Background**: Role-based colors
- **Icon**: White user icon (`pi-user text-white`)

### 5. Tags & Badges
- **Spacing**: Small padding, rounded corners
- **Colors**: Role-based color system
- **Text**: Small font size with proper contrast

### 6. Buttons
- **Primary Action**: Standard button with icon
- **Secondary Actions**: Text buttons with rounded treatment
- **Icon Buttons**: Small size, text variant, rounded
- **Danger Actions**: Red/danger severity

### 7. Form Design Patterns
- **Card Sections**: PrimeVue Card component with icon-enhanced titles
- **Field Groups**: Logical grouping of related form fields
- **Responsive Grid**: 2-column layout on medium screens and above
- **Full-width Fields**: Textarea and important fields span full width
- **Required Fields**: Clear indication with asterisk (*) in labels

### 8. Card Section Headers
- **Title Structure**: Icon + text combination for visual hierarchy
- **Icon Treatment**: `text-primary-600` color for consistency
- **Header Spacing**: `gap-2` between icon and title
- **Status Integration**: Tags can be integrated in section headers

### 9. Input Field Variations
- **Standard Input**: Full width with proper spacing
- **Textarea**: Larger text areas with `rows="3"`
- **Password Fields**: Toggle visibility with eye icon button
  ```css
  position: relative;
  pr-10; /* Space for toggle button */
  ```
  **Toggle Button**: `absolute right-3 top-1/2 -translate-y-1/2`

### 10. Status Notification Cards
- **Success State**: Green background with check circle icon
- **Warning State**: Amber background with exclamation icon
- **Layout**: Flex layout with icon on left, content on right
- **Icon Size**: `text-2xl` for prominence
- **Content Structure**: Title + description + optional action button

### 11. Card-Heavy Grid Layouts (Room Management)
- **Status Summary Cards**: 5-column grid with status metrics
  ```css
  grid-cols-2 sm:grid-cols-5 gap-3
  ```
- **Room Cards Grid**: Responsive from 2 to 8 columns
  ```css
  grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3
  ```
- **Category Cards**: 1-3 column responsive grid
  ```css
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
  ```

### 12. Room Card Design Pattern
- **Card Container**: Aspect ratio square with status-based styling
- **Border Treatment**: `border-2` with status-specific colors
- **Background**: Status-based colored backgrounds (`bg-green-50`, `bg-blue-50`, etc.)
- **Hover Effects**: `transition-all hover:shadow-lg` with border color changes
- **Content Layout**: Flex column with full height usage
- **Selection State**: `ring-4 ring-primary-500` for selected cards

### 13. Room Card Content Structure
- **Room Number**: Large, bold text (`font-bold text-lg`)
- **Category Name**: Small gray text with truncate (`text-xs text-gray-600 truncate`)
- **Status Badge**: Small tag in bottom corner (`text-xs`)
- **Edit Button**: Absolute positioned top-right corner

### 14. Status Summary Cards
- **Layout**: Icon + label + count structure
- **Icon Treatment**: Status-specific colors with semantic icons
- **Border Treatment**: `border-2` with status-specific border classes
- **Typography**: Large count numbers (`text-2xl font-bold`)

### 15. Bulk Selection Interface
- **Selection Bar**: Gray background bar at bottom of grid
- **Layout**: Count display + action buttons
- **Button Hierarchy**: Primary action, danger action, clear action
- **Background**: `bg-gray-50` with rounded treatment

### 16. Filter and Control Patterns
- **Floor Navigation**: Horizontal scrollable button bar
- **Search Bar**: Full-width with icon treatment
- **Filter Dropdowns**: Fixed width (`w-full sm:w-48`)
- **Filter Container**: White card with border treatment

### 17. QR Code Display
- **Container**: White background with border treatment
- **Code Size**: `w-48 h-48` (192px) for optimal scanning
- **Center Layout**: Flex column with centered alignment
- **Description**: Centered text with max-width constraint
- **Action Button**: Outlined style for secondary actions

### 12. Dialog/Modal Design
- **Width**: `35rem` (560px) for forms
- **Form Spacing**: `space-y-4` (16px between fields)
- **Label Treatment**: Block labels with bottom margin
- **Input Treatment**: Full width inputs with proper spacing

## Animation & Transitions

### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Transition Effects
- **Hover Transitions**: `transition-colors` for smooth color changes
- **Animation Duration**: 0.5s ease-in for fade-in effects

## Form Interaction Patterns

### Input Validation
- **Required Field Indication**: Asterisk (*) in label
- **Error States**: Red border and text for validation errors
- **Success States**: Green borders for valid inputs

### Password Visibility Toggle
- **Button Position**: Absolute positioning within input container
- **Icon States**: Eye icon for show, eye-slash for hide
- **Hover Effect**: Color transition on hover
- **Accessibility**: Proper button semantics and ARIA labels

### Button States in Forms
- **Loading State**: Spinner with disabled state
- **Primary Action**: Solid button style for save/submit
- **Secondary Action**: Outlined or text style for cancel
- **Icon Integration**: Consistent icon usage with labels

## Responsive Design

### Breakpoints
- **Small (sm)**: 640px and up
- **Medium (md)**: 768px and up
- **Large (lg)**: 1024px and up

### Responsive Patterns
- **Flex Direction**: Column on mobile, row on desktop
- **Full Width Mobile**: `w-full sm:w-[fixed]` pattern
- **Responsive Gaps**: Reduced spacing on mobile
- **Form Grid**: Single column on mobile, 2-column on desktop
- **Card Layout**: Full width cards on all screen sizes

## Visual Hierarchy

### Information Architecture
1. **Page Title** (Text 3xl, Bold, Gray 900)
2. **Section Titles** (Text Base, Medium, Gray 900)
3. **Primary Content** (Text Base, Normal, Gray 900)
4. **Secondary Content** (Text Sm, Normal, Gray 600)
5. **Tertiary Content** (Text Xs, Normal, Gray 500)

### Empty States
- **Icon Size**: Text 6xl (60px)
- **Icon Color**: Gray 300 with low opacity
- **Message Hierarchy**: Larger title with smaller description
- **Call to Action**: Clear button to add first item

## Card-Heavy UI Design Principles

### 1. Visual Hierarchy in Dense Environments
- **Status-Based Coloring**: Immediate visual recognition through consistent color coding
- **Progressive Disclosure**: Summary cards → detailed cards → individual item cards
- **Spatial Grouping**: Logical grouping with consistent spacing and borders
- **Size Variation**: Important information gets larger visual treatment

### 2. Intuitive Navigation Patterns
- **Floor-Based Filtering**: Contextual navigation that matches mental models
- **Quick Actions**: Inline edit buttons for immediate access
- **Bulk Operations**: Multi-select with clear feedback and action options
- **Visual Feedback**: Hover states, selection rings, and transition effects

### 3. Information Density Management
- **Responsive Grids**: Progressive enhancement from mobile to desktop
- **Truncation Strategy**: Text overflow handling with ellipsis
- **Progressive Loading**: Load more information as needed
- **Scanning Patterns**: Left-to-right, top-to-bottom information hierarchy

### 4. State Communication
- **Color Consistency**: Same colors used across all status indicators
- **Icon Semantics**: Meaningful icons that reinforce status meaning
- **Border Treatments**: Colored borders that communicate without overwhelming
- **Background Subtlety**: Light backgrounds that support but don't dominate

### 5. Scalable Card Systems
- **Modular Design**: Cards work independently and in grids
- **Aspect Ratios**: Consistent sizing for visual harmony
- **Content Flexibility**: Adapts to different content types and lengths
- **Interaction Patterns**: Consistent hover, click, and selection behaviors

## Design Principles

### 1. Clean & Minimal
- Generous white space
- Clear visual separation
- Minimal decorative elements

### 2. Consistent Spacing
- 8px grid system
- Consistent padding and margins
- Logical visual rhythm

### 3. Accessible Colors
- High contrast ratios
- Clear status indicators
- Role-based color coding

### 4. Responsive First
- Mobile-first approach
- Flexible layouts
- Touch-friendly targets

### 5. Professional Appearance
- Subtle shadows and borders
- Modern flat design
- Business-appropriate styling