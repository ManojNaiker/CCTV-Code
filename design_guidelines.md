# Design Guidelines: Hik-Connect Device Monitoring Dashboard

## Design Approach: Enterprise Dashboard System

**Selected Framework**: Material Design 3 principles adapted for enterprise monitoring dashboards  
**Rationale**: Data-dense application requiring clear hierarchy, efficient space usage, and robust data visualization components. The system prioritizes functionality and readability over decorative elements.

**Core Design Principles**:
- Information clarity: Every pixel serves the purpose of data communication
- Scannable layouts: Quick visual parsing of device status and metrics
- Consistent feedback: Clear visual states for online/offline/error conditions
- Efficient navigation: Tab-based architecture for feature access

---

## Color Palette

### Light Mode
- **Primary Brand**: 217 91% 35% (Deep blue - professional, trustworthy)
- **Success/Online**: 142 76% 36% (Green for online devices)
- **Error/Offline**: 0 84% 60% (Red for offline devices)
- **Warning**: 38 92% 50% (Amber for degraded status)
- **Background**: 210 20% 98% (Soft white)
- **Surface**: 0 0% 100% (Pure white cards)
- **Text Primary**: 222 47% 11% (Dark slate)
- **Text Secondary**: 215 16% 47% (Medium gray)

### Dark Mode
- **Primary Brand**: 217 91% 65% (Lighter blue for contrast)
- **Success/Online**: 142 71% 45% (Brighter green)
- **Error/Offline**: 0 84% 65% (Softer red)
- **Warning**: 38 92% 60% (Brighter amber)
- **Background**: 222 47% 11% (Deep slate)
- **Surface**: 217 19% 18% (Elevated dark surface)
- **Text Primary**: 210 20% 98% (Off-white)
- **Text Secondary**: 217 10% 70% (Light gray)

---

## Typography

**Font Stack**: 'Inter', system-ui, -apple-system, sans-serif via Google Fonts CDN

**Hierarchy**:
- Dashboard Title: 2xl/3xl, font-bold (main dashboard heading)
- Section Headers: xl, font-semibold (chart titles, tab headings)
- Card Titles: lg, font-medium (device counts, metric labels)
- Body Text: base, font-normal (tables, descriptions)
- Data Labels: sm, font-medium (chart labels, timestamps)
- Helper Text: xs, font-normal (hints, secondary info)
- Numeric Metrics: 3xl/4xl, font-bold (device counts in cards)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Page margins: p-6 to p-8

**Grid System**:
- Dashboard metrics: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Chart layouts: 2-column for dual charts (grid-cols-1 lg:grid-cols-2)
- Device tables: Full-width with responsive horizontal scroll
- Forms: Single column max-w-2xl for branch management

---

## Component Library

### Navigation
- **Sidebar Navigation**: Fixed left sidebar (w-64) with collapsible sections for Dashboard, Branches, Device Mapping, Notifications
- Active tab: Primary color background with white text
- Icons: Heroicons outline for inactive, solid for active states

### Dashboard Components
- **Metric Cards**: Elevated cards (shadow-md) with large numeric display, icon, and trend indicator
  - Online Devices: Green accent border-l-4
  - Offline Devices: Red accent border-l-4
  - Total Devices: Blue accent border-l-4
  - Last Check: Neutral with timestamp

- **State Filter**: Multi-select dropdown with checkboxes, sticky positioned below header
- **Charts**: 
  - Status Distribution: Donut chart using recharts/chart.js
  - State-wise Breakdown: Horizontal bar chart
  - Timeline: Line chart showing online/offline trends
  - All charts with consistent color scheme (success/error colors)

### Data Tables
- **Device List Table**: 
  - Striped rows (even/odd background differentiation)
  - Status indicator: Colored dot (h-3 w-3 rounded-full) in first column
  - Sortable headers with arrow indicators
  - Row hover: Subtle background change
  - Sticky header on scroll
  - Columns: Status, Device Name, Branch, State, IP Address, Last Seen, Actions

### Branch Management
- **Form Cards**: Clean form layout with:
  - Input labels: text-sm font-medium mb-1
  - Text inputs: border rounded-md p-2.5 with focus:ring-2
  - State dropdown: Full list of Indian states
  - Action buttons: Primary (save) and Secondary (cancel) at bottom

### Device Mapping
- **Two-Column Layout**: 
  - Left: Available devices list with search
  - Right: Branch selection and assignment
  - Drag-drop or checkbox-based selection
  - Visual feedback on assignment (success toast)

### Notification Settings
- **Settings Panel**:
  - Toggle switches for enable/disable notifications
  - Email configuration section
  - Threshold settings (e.g., "Alert when >10 devices offline")
  - Schedule preferences (notification timing)
  - Test notification button

### Status Indicators
- **Visual Language**:
  - Online: Green dot + "Online" text
  - Offline: Red dot + "Offline" text + duration
  - Checking: Animated pulse blue dot + "Checking..."
  - Error: Red exclamation icon + error message

### Buttons & Actions
- **Primary Actions**: Solid primary color, white text, rounded-md
- **Secondary Actions**: Outline variant with border
- **Destructive Actions**: Red background for delete/remove
- **Icon Buttons**: Square (p-2) with icon centered, subtle hover

---

## Animations

**Minimal Animation Strategy** (used sparingly):
- Loading states: Subtle shimmer effect on table/card skeletons
- Status changes: 300ms color transition for status dots
- Chart rendering: Smooth 500ms entrance animation
- Dropdown/modal: Simple fade-in (200ms)
- Toast notifications: Slide-in from top-right (300ms)

**No animations for**: Navigation, hover states, scrolling effects

---

## Responsive Behavior

**Breakpoints**:
- Mobile (<768px): Stacked metric cards, hamburger sidebar menu, simplified charts
- Tablet (768px-1024px): 2-column metrics, collapsible sidebar
- Desktop (>1024px): Full layout with 4-column metrics, expanded sidebar

**Mobile Optimizations**:
- Horizontal scroll tables with sticky first column
- Bottom sheet for filters instead of dropdowns
- Larger touch targets (min h-12)

---

## Images

**No hero images needed** - This is a utility dashboard focused on data display.

**Icon Usage**: 
- Dashboard metrics: Device icon, signal icon, clock icon, alert icon
- Sidebar navigation: Dashboard, building, map-pin, bell icons
- All from Heroicons library via CDN

---

## Key Visual Patterns

1. **Status-First Design**: Color-coded status is the primary visual language
2. **Card-Based Layout**: All major content in elevated cards for clear boundaries
3. **Data Density**: Maximize information while maintaining readability
4. **Consistent Spacing**: Predictable rhythm using 4/6/8 unit spacing
5. **Professional Aesthetic**: Enterprise-grade with clean lines and purposeful color use