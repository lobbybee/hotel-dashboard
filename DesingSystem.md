# Hotel Dashboard Design System

## Overview

This design system provides a comprehensive set of guidelines, patterns, and components for building consistent, professional, and accessible hotel management interfaces. It focuses on clean, modern design with excellent usability and maintainability, incorporating 2025 web standards and best practices.

---

## Section 1: Fundamentals

### Color System

#### Foundation Colors
- **White**: `#FFFFFF` - Primary background for cards and content areas
- **Gray 50**: `#F9FAFB` - Subtle page backgrounds and hover states
- **Gray 100**: `#F3F4F6` - Disabled elements and subtle dividers

#### Text Color Hierarchy
- **Gray 900**: `#111827` - Primary text (headings, important content)
- **Gray 700**: `#374151` - Secondary text (labels, descriptions)
- **Gray 600**: `#4B5563` - Tertiary text (placeholders, help text)
- **Gray 500**: `#6B7280` - Supporting text (metadata, timestamps)
- **Gray 400**: `#9CA3AF` - Muted text (empty states, hints)

#### Border System
- **Gray 200**: `#E5E7EB` - Default borders for cards and inputs
- **Gray 300**: `#D1D5DB` - Hover states and interactive elements
- **Gray 400**: `#9CA3AF` - Disabled borders

#### Semantic Colors (Universal)
- **Blue System**:
  - `bg-blue-50 text-blue-600` - Information, primary actions, calendar events
  - `#EFF6FF` (background), `#2563EB` (text/icon)
- **Green System**:
  - `bg-green-50 text-green-600` - Success states, active items, confirmation
  - `#F0FDF4` (background), `#059669` (text/icon)
- **Amber System**:
  - `bg-amber-50 text-amber-600` - Warnings, pending states, attention
  - `#FFFBEB` (background), `#D97706` (text/icon)
- **Red System**:
  - `bg-red-50 text-red-600` - Error states, destructive actions, alerts
  - `#FEF2F2` (background), `#DC2626` (text/icon)
- **Purple System**:
  - `bg-purple-50 text-purple-600` - Premium features, statistics
  - `#FAF5FF` (background), `#9333EA` (text/icon)
- **Indigo System**:
  - `bg-indigo-50 text-indigo-600` - Inventory, available items
  - `#EEF2FF` (background), `#6366F1` (text/icon)
- **Emerald System**:
  - `bg-emerald-50 text-emerald-600` - Metrics, percentages, growth
  - `#ECFDF5` (background), `#10B981` (text/icon)
- **Orange System**:
  - `bg-orange-50 text-orange-600` - Waiting states, processes
  - `#FFF7ED` (background), `#EA580C` (text/icon)
- **Rose System**:
  - `bg-rose-50 text-rose-600` - Departures, endings, checkouts
  - `#FFF1F2` (background), `#F43F5E` (text/icon)
- **Cyan System**:
  - `bg-cyan-50 text-cyan-600` - Arrivals, new items, creation
  - `#ECFEFF` (background), `#06B6D4` (text/icon)
- **Lime System**:
  - `bg-lime-50 text-lime-600` - Financial data, revenue, costs
  - `#F7FEE7` (background), `#84CC16` (text/icon)

#### Dark Mode Color Mapping
- **Background**: `#0F172A` (slate-900) for dark surfaces
- **Card Background**: `#1E293B` (slate-800) for elevated elements
- **Text Primary**: `#F8FAFC` (slate-50) for main text
- **Text Secondary**: `#CBD5E1` (slate-300) for secondary text
- **Border**: `#334155` (slate-700) for borders in dark mode

### Typography System

#### Font Stack
```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

#### Type Scale (Mobile-First)
- **Text XS**: `0.75rem` (12px) - Labels, tags, metadata
- **Text SM**: `0.875rem` (14px) - Supporting text, descriptions
- **Text Base**: `1rem` (16px) - Body content, primary text
- **Text LG**: `1.125rem` (18px) - Emphasized content
- **Text XL**: `1.25rem` (20px) - Section headings
- **Text 2XL**: `1.5rem` (24px) - Page headings (mobile)
- **Text 3XL**: `1.875rem` (30px) - Page headings (desktop)

#### Font Weights
- **Normal (400)**: Body text, descriptions
- **Medium (500)**: Labels, emphasized content, buttons
- **Semibold (600)**: Section headings, important labels
- **Bold (700)**: Page titles, critical information

#### Line Heights
- **Tight**: `1.25` - Large headings, compact displays
- **Normal**: `1.5` - Body text, paragraphs
- **Relaxed**: `1.625` - Small text, improved readability

#### Fluid Typography
```css
/* Responsive typography that scales with viewport */
.text-fluid {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}
```

### Spacing System

#### 8px Grid System
- **1**: `0.25rem` (4px) - Micro adjustments
- **2**: `0.5rem` (8px) - Tight spacing, related items
- **3**: `0.75rem` (12px) - Small gaps, form padding
- **4**: `1rem` (16px) - Standard spacing, card padding
- **5**: `1.25rem` (20px) - Section separation
- **6**: `1.5rem` (24px) - Component spacing
- **8**: `2rem` (32px) - Large section breaks
- **10**: `2.5rem` (40px) - Page sections
- **12**: `3rem` (48px) - Major page breaks
- **16**: `4rem` (64px) - Full page sections

#### Spacing Patterns
- **Gap Scale**: `gap-2, gap-3, gap-4, gap-6, gap-8`
- **Margin Scale**: `mb-2, mb-3, mb-4, mb-6, mb-8`
- **Padding Scale**: `p-4, p-6, p-8`
- **Space Between**: `space-y-4, space-y-6, space-y-8`

### Elevation & Depth System

#### Shadow Scale
- **Shadow XS**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Subtle hover states
- **Shadow SM**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)` - Raised elements
- **Shadow Base**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` - Standard cards
- **Shadow MD**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` - Modals, dropdowns
- **Shadow LG**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` - Tooltips, popovers
- **Shadow XL**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)` - Large modals, overlays

#### Z-Index Scale
- **Z-10**: Decorative elements, under content
- **Z-20**: Sticky elements below header
- **Z-30**: Dropdown overlays
- **Z-40**: Sticky headers, sidebars
- **Z-50**: Modals, tooltips
- **Z-60**: Toast notifications
- **Z-70**: Loading overlays

---

## Section 2: Mobile-First Layout & Responsive Design

### Layout System

#### Container Patterns
```css
/* Standard Page Container */
.page-container {
  min-height: 100vh;
  background: gray-50;
}

/* Content Container */
.content-container {
  max-width: 7xl; /* 80rem */
  margin: 0 auto;
  padding: 1rem 1rem; /* Mobile */
  /* padding: 1.5rem 1.5rem; Tablet */
  /* padding: 2rem 2rem; Desktop */
}

/* Form Container */
.form-container {
  max-width: 5xl; /* 64rem */
}
```

#### Grid System
- **Auto-fit**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Fixed Columns**: `grid-cols-12` for complex layouts
- **Responsive Gaps**: `gap-4 md:gap-6 lg:gap-8`

#### Breakpoint System
- **Small**: `640px` (sm) - Tablets and large phones
- **Medium**: `768px` (md) - Small desktops and tablets
- **Large**: `1024px` (lg) - Standard desktops
- **Extra Large**: `1280px` (xl) - Large desktops
- **2X Large**: `1536px` (2xl) - Extra large screens

### Mobile-First Approach

#### Basic Principles
- Start with mobile layouts (320px and up)
- Progressively enhance for larger screens
- Use min-width breakpoints, not max-width

#### Responsive Patterns
```html
<!-- Responsive Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- Items -->
</div>

<!-- Responsive Text -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">Responsive Heading</h1>

<!-- Responsive Spacing -->
<div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
  <!-- Content -->
</div>

<!-- Responsive Navigation -->
<nav class="flex flex-col md:flex-row gap-4">
  <!-- Navigation items -->
</nav>
```

#### Touch Targets
- Minimum touch target size: 44px × 44px
- Increased spacing on mobile devices
- Finger-friendly button and link sizing

### Modern Responsive Patterns (2025)

#### Container Queries
```css
/* Component that responds to parent container */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
  }
}

@container (min-width: 600px) {
  .card {
    grid-template-columns: 1fr 3fr;
  }
}
```

---

## Section 6: Accessibility & Implementation Guidelines

### Modern Accessibility Features

#### Focus Management
```css
/* Better focus indicators */
.focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* Focus management for modals */
.modal:focus-within {
  outline: 2px solid #2563EB;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #2563EB;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}
```

#### Screen Reader Support
```html
<!-- Semantic navigation -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
    <li><a href="/bookings">Bookings</a></li>
  </ul>
</nav>

<!-- ARIA descriptions -->
<button aria-describedby="help-text">Submit</button>
<div id="help-text" class="sr-only">Submits the form and creates a new booking</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true" id="status-message"></div>

<!-- Progress indicators -->
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress 75%">
  75%
</div>
```

#### High Contrast Mode Support
```css
@media (prefers-contrast: high) {
  .card {
    border: 2px solid #000000;
  }
  
  .button {
    border: 2px solid currentColor;
  }
  
  /* Ensure all interactive elements have clear boundaries */
}
```

### Implementation Guidelines

#### Modern CSS Architecture
- **CSS Cascade Layers**: Organize styles by priority
- **CSS Custom Properties**: Use for theming and consistency
- **Container Queries**: Build responsive components
- **CSS Modules**: Scope styles to components

#### Performance Best Practices
```css
/* Optimize animations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Containment for performance */
.performance-critical {
  contain: layout style paint;
}
```

#### JavaScript Guidelines
```javascript
// Modern JavaScript features
const validateForm = async (formData) => {
  try {
    const result = await api.validate(formData);
    return result;
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
};

// Web Components for reusable UI
class StatusBadge extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <span class="status-badge status-${this.dataset.status}">
        ${this.dataset.text}
      </span>
    `;
  }
}

customElements.define('status-badge', StatusBadge);
```

#### Testing Guidelines
```javascript
// Automated accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';

test('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Visual regression testing
import { createMatcher } from 'jest-emotion';

expect.extend({
  toMatchStyleSnapshot: createMatcher(),
});

test('should match style snapshot', () => {
  const { container } = render(<Button />);
  expect(container.firstChild).toMatchStyleSnapshot();
});
```

### Design Principles

#### 1. Consistency Over Convention
- Maintain consistent patterns across all interfaces
- Reuse established patterns rather than creating new ones
- Document exceptions and special cases

#### 2. Clarity and Simplicity
- Prioritize clarity over cleverness
- Remove unnecessary complexity
- Use familiar patterns and conventions

#### 3. Accessibility First
- Design for all users from the beginning
- Test with accessibility tools and users
- Consider diverse user needs and contexts

#### 4. Performance Awareness
- Optimize for mobile performance
- Minimize animation impact on battery life
- Consider network conditions and loading times

#### 5. Maintainability Focus
- Write code that others can understand and modify
- Document decisions and patterns
- Plan for future evolution and scaling

---

This design system provides the foundation for building consistent, professional hotel management interfaces while allowing flexibility for specific use cases and future growth.

---

## Section 3: Basic Components

### Button System

#### Primary Button
```html
<button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  <!-- Button content -->
</button>
```

#### Secondary Button
```html
<button class="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors">
  <!-- Button content -->
</button>
```

#### Text Button
```html
<button class="text-gray-700 hover:text-gray-900 font-medium transition-colors">
  <!-- Button content -->
</button>
```

#### Icon-Only Button
```html
<button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
  <i class="pi pi-[icon]"></i>
</button>
```

#### Button Variants by Severity
- **Success**: `bg-green-600 hover:bg-green-700`
- **Warning**: `bg-amber-600 hover:bg-amber-700`
- **Danger**: `bg-red-600 hover:bg-red-700`
- **Info**: `bg-blue-600 hover:bg-blue-700`

### Card Patterns

#### Basic Card Pattern
```html
<div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
  <!-- Card content -->
</div>
```

#### Icon Card Pattern
```html
<div class="bg-white rounded-lg border border-gray-200 p-6">
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 bg-[color]-50 rounded-lg flex items-center justify-center text-[color]-600">
      <i class="pi pi-[icon] text-xl"></i>
    </div>
    <div class="flex-1">
      <p class="text-sm font-medium text-gray-600 mb-1">Label</p>
      <p class="text-2xl font-bold text-gray-900">Value</p>
    </div>
  </div>
</div>
```

### Form Components

#### Form Structure
```html
<form class="space-y-6" novalidate>
  <!-- Form fields -->
</form>
```

#### Field Pattern
```html
<div class="space-y-1">
  <label for="[id]" class="block text-sm font-medium text-gray-700">Label Text <span class="text-red-500">*</span></label>
  <div class="relative">
    <input 
      id="[id]" 
      type="text" 
      class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
      :class="{'border-red-500 focus:ring-red-100': error, 'border-green-500 focus:ring-green-100': valid}"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="error ? 'error-message' : help-text ? 'help-text' : undefined"
    />
    <div v-if="valid" class="absolute inset-y-0 right-0 flex items-center pr-3">
      <i class="pi pi-check-circle text-green-500"></i>
    </div>
  </div>
  <small v-if="helpText && !error" :id="help-text" class="text-gray-500 text-xs block">{{ helpText }}</small>
  <small v-if="error" :id="error-message" class="text-red-500 text-sm mt-1 block" role="alert">{{ error }}</small>
</div>
```

#### Input States
- **Default**: `border-gray-300`
- **Focus**: `border-blue-500 focus:ring-2 focus:ring-blue-100`
- **Error**: `border-red-500 focus:ring-red-100`
- **Success**: `border-green-500 focus:ring-green-100`
- **Disabled**: `bg-gray-50 text-gray-500 cursor-not-allowed`

#### Form Layouts
```html
<!-- Single Column -->
<div class="space-y-4">
  <!-- Fields -->
</div>

<!-- Two Column -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Fields -->
</div>

<!-- Three Column -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Fields -->
</div>

<!-- Sectioned Form -->
<div class="space-y-8">
  <div class="space-y-4">
    <h2 class="text-lg font-medium text-gray-900">Personal Information</h2>
    <!-- Personal info fields -->
  </div>
  <div class="space-y-4">
    <h2 class="text-lg font-medium text-gray-900">Contact Information</h2>
    <!-- Contact info fields -->
  </div>
</div>
```

### Component State Management

#### Loading States
```html
<!-- Skeleton Loading -->
<div class="animate-pulse space-y-4">
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

<!-- Spinner Loading -->
<div class="flex items-center justify-center p-8">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  <span class="ml-2 text-gray-600">Loading...</span>
</div>

<!-- Progress Loading -->
<div class="w-full bg-gray-200 rounded-full h-2">
  <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 60%"></div>
</div>
```

#### Disabled States
```html
<!-- Disabled Button -->
<button disabled class="opacity-50 cursor-not-allowed bg-gray-300 text-gray-500">
  Disabled Button
</button>

<!-- Disabled Input -->
<input disabled class="bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed">
```

#### Read-only States
```html
<!-- Read-only Input -->
<input readonly class="bg-gray-50 border-gray-200 text-gray-700 cursor-default">
```

#### Validation States
```html
<!-- Pristine (untouched) -->
<input class="border-gray-300">

<!-- Touched (focused and blurred) -->
<input class="border-gray-300 focus:border-blue-500">

<!-- Dirty (value changed) -->
<input class="border-blue-300">

<!-- Invalid (validation failed) -->
<input class="border-red-500 focus:border-red-500 focus:ring-red-100">

<!-- Valid (validation passed) -->
<input class="border-green-500 focus:border-green-500 focus:ring-green-100">
```

#### Multi-state Component Pattern
```html
<div class="component" data-state="loading">
  <!-- Loading state content -->
</div>

<style>
.component[data-state="loading"] { /* loading styles */ }
.component[data-state="error"] { /* error styles */ }
.component[data-state="success"] { /* success styles */ }
.component[data-state="empty"] { /* empty styles */ }
</style>
```

---

## Section 4: Advanced Patterns

### Navigation & Interaction Patterns

#### Breadcrumb Pattern
```html
<nav class="flex items-center space-x-2 text-sm">
  <a href="#" class="text-gray-500 hover:text-gray-700">Home</a>
  <span class="text-gray-300">/</span>
  <a href="#" class="text-gray-500 hover:text-gray-700">Section</a>
  <span class="text-gray-300">/</span>
  <span class="text-gray-900 font-medium">Current Page</span>
</nav>
```

#### Tab Pattern
```html
<div class="border-b border-gray-200">
  <nav class="flex space-x-8">
    <a href="#" class="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">Active Tab</a>
    <a href="#" class="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">Inactive Tab</a>
  </nav>
</div>
```

#### Pagination Pattern
```html
<nav class="flex items-center justify-between">
  <div class="text-sm text-gray-700">
    Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">97</span> results
  </div>
  <div class="flex gap-2">
    <!-- Pagination buttons -->
  </div>
</nav>
```

### Data Display Patterns

#### Table Pattern
```html
<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header</th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cell Content</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Badge Pattern
```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Badge Text
</span>
```

#### Status Indicator Pattern
```html
<div class="flex items-center gap-2">
  <div class="w-2 h-2 rounded-full bg-green-500"></div>
  <span class="text-sm text-gray-600">Active</span>
</div>
```

### Feedback & State Patterns

#### Empty States
```html
<div class="text-center py-12">
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <i class="pi pi-[icon] text-gray-400 text-2xl"></i>
  </div>
  <h3 class="text-lg font-medium text-gray-900 mb-2">Empty State Title</h3>
  <p class="text-gray-500 mb-4">Description of what to do next</p>
  <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
    Action Button
  </button>
</div>
```

#### Error States
```html
<div class="bg-red-50 border border-red-200 rounded-lg p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <i class="pi pi-exclamation-triangle text-red-400 text-xl"></i>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">Error Title</h3>
      <div class="mt-2 text-sm text-red-700">
        <p>Error message description</p>
      </div>
    </div>
  </div>
</div>
```

#### Success States
```html
<div class="bg-green-50 border border-green-200 rounded-lg p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <i class="pi pi-check-circle text-green-400 text-xl"></i>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-green-800">Success Title</h3>
      <div class="mt-2 text-sm text-green-700">
        <p>Success message description</p>
      </div>
    </div>
  </div>
</div>
```

### Modal & Overlay Patterns

#### Modal Pattern
```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Modal Title</h3>
    </div>
    <div class="px-6 py-4">
      <!-- Modal content -->
    </div>
    <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
      <!-- Modal actions -->
    </div>
  </div>
</div>
```

#### Tooltip Pattern
```html
<div class="group relative">
  <button class="p-2 rounded-lg hover:bg-gray-100">
    <i class="pi pi-question-circle text-gray-500"></i>
  </button>
  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
    Tooltip text
  </div>
</div>
```

### Form Patterns (Advanced)

#### Form Validation UX

##### Validation Timing
- **Real-time Validation**: For format-specific fields (email, phone, URL)
- **On-blur Validation**: For most standard fields to avoid premature errors
- **On-submit Validation**: Required fields and form-wide validation
- **Progressive Validation**: Validate as user completes sections

##### Error Message Positioning
```html
<!-- Inline Error Message -->
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">Email</label>
  <input type="email" class="w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-100" />
  <p class="text-red-500 text-sm mt-1">Please enter a valid email address</p>
</div>

<!-- Field-level Error Banner -->
<div class="border-l-4 border-red-400 bg-red-50 p-3 mb-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <i class="pi pi-exclamation-circle text-red-400"></i>
    </div>
    <div class="ml-3">
      <p class="text-sm text-red-700">Please fix the following errors:</p>
      <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
        <li>Email is required</li>
        <li>Phone number is invalid</li>
      </ul>
    </div>
  </div>
</div>

<!-- Form-level Summary -->
<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
  <h3 class="text-sm font-medium text-red-800 mb-2">Please correct the following errors:</h3>
  <ul class="text-sm text-red-700 space-y-1">
    <li>• Full name is required</li>
    <li>• Email address is invalid</li>
    <li>• Password must be at least 8 characters</li>
  </ul>
</div>
```

##### Success Indicators
```html
<!-- Field Success State -->
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">Email</label>
  <div class="relative">
    <input type="email" value="user@example.com" class="w-full border-green-500 rounded-lg focus:border-green-500 focus:ring-green-100 pr-10" />
    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
      <i class="pi pi-check-circle text-green-500"></i>
    </div>
  </div>
  <p class="text-green-600 text-sm">Email address is valid</p>
</div>

<!-- Form Success Message -->
<div class="bg-green-50 border border-green-200 rounded-lg p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <i class="pi pi-check-circle text-green-400"></i>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-green-800">Form submitted successfully!</h3>
      <p class="mt-1 text-sm text-green-700">Your information has been saved.</p>
    </div>
  </div>
</div>
```

##### Multi-step Form Patterns
```html
<!-- Progress Indicator -->
<div class="mb-8">
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
      <span class="ml-2 text-sm font-medium text-gray-900">Personal Info</span>
    </div>
    <div class="flex-1 h-px bg-gray-300 mx-4"></div>
    <div class="flex items-center">
      <div class="w-8 h-8 bg-white border-2 border-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
      <span class="ml-2 text-sm text-gray-500">Address</span>
    </div>
    <div class="flex-1 h-px bg-gray-300 mx-4"></div>
    <div class="flex items-center">
      <div class="w-8 h-8 bg-white border-2 border-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
      <span class="ml-2 text-sm text-gray-500">Review</span>
    </div>
  </div>
</div>

<!-- Step Content -->
<div class="space-y-6">
  <!-- Current step fields -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
    <input type="text" class="w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-100" />
  </div>
</div>

<!-- Step Navigation -->
<div class="flex justify-between mt-8">
  <button class="px-4 py-2 text-gray-600 hover:text-gray-800" disabled>Previous</button>
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next</button>
</div>
```

---

## Section 5: Modern Features (2025 CSS, Animations, Transitions)

### 2025-Specific Modern CSS Features

#### CSS Cascade Layers
```css
/* Organize styles by priority to prevent specificity conflicts */
@layer reset, base, components, utilities, overrides;

@layer components {
  .card { /* component styles */ }
}
```

#### View Transitions API
```css
/* Smooth page transitions without JavaScript libraries */
::view-transition-old(root),
::view-transition-new(root) {
  animation: fade 0.3s ease-in-out;
}
```

#### Popover API
```html
<!-- Native tooltip/popover support without custom libraries -->
<button popovertarget="tooltip">Hover me</button>
<div id="tooltip" popover>Tooltip content</div>
```

#### Scroll-driven Animations
```css
/* Modern parallax and scroll effects */
@keyframes adjust-hue {
  to { filter: hue-rotate(360deg); }
}

.scrolling-element {
  animation: adjust-hue linear;
  animation-timeline: scroll();
}
```

#### CSS Nesting
```css
/* Improved readability with native nesting (widely supported) */
.card {
  background: white;
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .title {
    font-size: 1.25rem;
  }
}
```

### Performance Optimization Features

#### Container Queries
```css
/* Responsive components based on parent container size */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

#### CSS Grid Subgrid
```css
/* Complex nested layouts without additional markup */
.parent-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
}

.child-subgrid {
  grid-column: 2 / -1;
  display: grid;
  grid-template-columns: subgrid;
  gap: inherit;
}
```

#### Content-Visibility
```css
/* Skip rendering off-screen content for better performance */
.offscreen-content {
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
}
```

#### Scroll Snap
```css
/* Smooth carousels and galleries without JavaScript */
.carousel {
  display: flex;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  overflow-x: auto;
}

.carousel-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

### Backdrop Filters for Glass-morphism
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Modern Layout Patterns

#### Sticky Positioning Patterns
```css
/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

/* Sticky Sidebar */
.sticky-sidebar {
  position: sticky;
  top: 6rem;
  height: calc(100vh - 6rem);
  overflow-y: auto;
}
```

### Animation & Transitions

#### Transition Guidelines
- **Duration**: 150ms - 300ms for most interactions
- **Easing**: `ease-out` for entrance, `ease-in` for exit
- **Properties**: Transform, opacity, color (avoid animating layout properties)

#### Performance-Optimized Animations
```css
/* Use transform and opacity for better performance */
.optimized-transition {
  will-change: transform, opacity;
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

/* CSS Animations with hardware acceleration */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-up {
  animation: slideInUp 0.3s ease-out;
  backface-visibility: hidden;
}
```

#### Modern Animation Features
```css
/* CSS Scroll-driven Animations */
@keyframes reveal {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal-on-scroll {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

/* View Transitions API */
::view-transition-old(card) {
  animation: cardExit 0.3s ease-out;
}

::view-transition-new(card) {
  animation: cardEnter 0.3s ease-out;
}
```

#### Common Transitions
```css
/* Hover Effects */
.hover-transition {
  transition: all 0.2s ease-out;
}

/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale In */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Slide In */
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Stagger Animation */
.stagger-item {
  animation: slideInUp 0.3s ease-out backwards;
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
```

#### Motion Preferences
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Alternative static indicators */
.motion-safe { /* Animated version */ }
.motion-reduced { /* Static version */ }
```

### Dark Mode Support
```css
/* System color scheme support */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --text-primary: #F8FAFC;
    --text-secondary: #CBD5E1;
    --border-color: #334155;
  }
}
```