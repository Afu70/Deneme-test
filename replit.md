# Order Tracking Application

## Overview

This is a full-stack order tracking application built with React, Express, and PostgreSQL. The application allows users to create, view, edit, and delete orders with detailed tracking information including order status, payment status, and invoice status. It features a modern UI built with shadcn/ui components and Tailwind CSS.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints for CRUD operations
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for database migrations
- **Storage**: Currently using in-memory storage (MemStorage) with interface for database storage
- **Validation**: Zod for API request validation

### Database Schema
The application uses a single `orders` table with the following structure:
- `id`: Serial primary key
- `listeNo`: Order/list number (text, required)
- `siparisiVeren`: Customer/orderer name (text, required)
- `urunListesi`: Product list/description (text, required)
- `adet`: Quantity (integer, required)
- `siparisDurumu`: Order status (text, required)
- `tahsilatDurumu`: Payment status (text, required)
- `faturaDurumu`: Invoice status (text, required)
- `tarih`: Order date (timestamp, auto-generated)

## Key Components

### Frontend Components
- **OrderTracking**: Main page component with order list, search, and filtering
- **OrderForm**: Form component for creating new orders
- **OrderCard**: Individual order display component with edit/delete actions
- **OrderStats**: Statistics dashboard showing order counts
- **EditOrderModal**: Modal dialog for editing existing orders

### Backend Components
- **Routes**: RESTful API endpoints (`/api/orders`)
- **Storage**: Abstracted storage layer with in-memory implementation
- **Schema**: Shared schema definitions and validation
- **Middleware**: Request logging and error handling

### Shared Components
- **Schema**: Drizzle ORM schema definitions shared between frontend and backend
- **Types**: TypeScript types generated from schema

## Data Flow

1. **Order Creation**: User fills out form → React Hook Form validation → API POST request → Database insertion → UI update via React Query
2. **Order Listing**: Component mount → React Query fetch → API GET request → Database query → UI rendering
3. **Order Editing**: User clicks edit → Modal opens with pre-filled form → Form submission → API PUT request → Database update → UI refresh
4. **Order Deletion**: User confirms deletion → API DELETE request → Database removal → UI update

## External Dependencies

### Frontend Dependencies
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **State Management**: TanStack Query for caching and synchronization
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for schema validation
- **Utilities**: clsx, tailwind-merge, class-variance-authority

### Backend Dependencies
- **Database**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM with Drizzle Kit
- **Validation**: Zod for API validation
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution

### Build Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Backend bundling for production
- **TypeScript**: Type checking and compilation
- **PostCSS**: CSS processing with Tailwind CSS

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with Node.js for TypeScript execution
- **Database**: Environment-based DATABASE_URL configuration

### Production
- **Frontend**: Vite build to `dist/public` directory
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend files
- **Database**: PostgreSQL via Neon Database connection

### Build Process
1. Frontend assets built with Vite
2. Backend bundled with esbuild
3. Database migrations applied with Drizzle Kit
4. Single Node.js process serves both API and static files

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```