# Hik-Connect Device Monitoring Dashboard

## Overview

This is an enterprise device monitoring dashboard for managing 200+ Hik-Connect surveillance devices across multiple Indian states. The application provides real-time device status tracking, state-wise analytics, branch management, and automated alerting capabilities. Built with a modern TypeScript stack, it features a Material Design 3-inspired interface optimized for data visualization and operational monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**UI Component System**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library with "new-york" style variant
- Tailwind CSS for styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**State Management**:
- TanStack Query (React Query) for server state management and data fetching
- Local React state for UI interactions
- No global state management library (Redux/Zustand) - relies on React Query's caching

**Routing**: Wouter for lightweight client-side routing

**Key Design Decisions**:
- Tab-based navigation using Radix UI Tabs for feature access
- Responsive dashboard with metric cards, charts (Recharts), and data tables
- Dark/light theme support with CSS variables and localStorage persistence
- Mobile-first responsive design with sidebar drawer on mobile devices

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Database ORM**: Drizzle ORM with PostgreSQL dialect (using Neon serverless driver)

**API Design**: RESTful endpoints with Express route handlers
- Credential management (`/api/hik-connect/credentials`)
- Device sync and status checking (`/api/hik-connect/sync`, `/api/devices/check-status`)
- Branch management (`/api/branches`)
- Device mapping (`/api/devices/:id/branch`)
- Notification settings (`/api/notification-settings`)

**Background Jobs**: Node-cron scheduler running every 15 minutes to check device status

**Storage Layer**:
- Interface-based storage abstraction (`IStorage`)
- Database implementation (`DbStorage`) using Drizzle ORM
- In-memory implementation (`MemStorage`) for testing/development

**Key Design Decisions**:
- Separation of storage interface from implementation for flexibility
- Scheduled status checks to maintain up-to-date device information
- Credential-based authentication with Hik-Connect API
- Session-based tracking with status history

### Data Models

**Core Entities**:
- `hikConnectCredentials`: Single-row configuration for Hik-Connect API access
- `branches`: Indian state-based branch locations with email contacts
- `devices`: Hik-Connect devices with status, branch mapping, and metadata
- `deviceStatusHistory`: Timestamped status change tracking
- `notificationSettings`: Email alert configuration with thresholds

**Status Flow**:
1. Credentials stored and validated
2. Manual or scheduled device sync from Hik-Connect API
3. Device status updates trigger history records
4. Status changes compared against notification thresholds

### External Dependencies

**Third-Party Services**:
- **Hik-Connect API** (`https://iind-team.hikcentralconnect.com`): Primary integration for device data retrieval and status monitoring
  - Authentication via username/password
  - Optional API key/secret for enhanced security
  - HMAC-SHA256 signature generation for authenticated requests

**Database**:
- **PostgreSQL** (via Neon serverless): Primary data store
  - Connection pooling with `@neondatabase/serverless`
  - WebSocket-based connections
  - Schema migrations via Drizzle Kit

**External Libraries**:
- **Axios**: HTTP client for Hik-Connect API communication
- **Recharts**: Data visualization library for charts and graphs
- **React Hook Form + Zod**: Form validation and management
- **date-fns**: Date manipulation and formatting
- **node-cron**: Background job scheduling
- **Google Fonts (Inter)**: Typography via CDN

**Development Tools**:
- **Replit Plugins**: Cartographer, runtime error modal, dev banner
- **Vite Plugins**: React, source maps, development experience enhancements

**Key Integration Points**:
- Hik-Connect client wrapper (`HikConnectClient`) abstracts API communication
- Scheduler service orchestrates periodic status checks
- Email notification system (configured but implementation details in settings)
- Branch-device mapping enables state-wise analytics and reporting