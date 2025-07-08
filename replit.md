# Royal Casino - Full Stack Casino Application

## Overview

Royal Casino is a full-stack web application built with React, Express, and PostgreSQL that provides an immersive online casino experience. The application features multiple casino games including slots, blackjack, and roulette, with a complete user management system, transaction tracking, and administrative controls.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom casino-themed color palette
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with WebSocket support for real-time features

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- Replit Auth integration with mandatory session and user tables
- OpenID Connect flow for secure authentication
- Session persistence with PostgreSQL storage
- User profile management with avatar support

### Game Engine
- Modular game system supporting multiple casino games
- Slots game with configurable reels and payout system
- Blackjack with standard card game logic
- Roulette support (extensible architecture)
- Real-time game state management

### User Management
- User profiles with balance tracking
- Transaction history and audit trails
- Statistics tracking (wins, losses, games played)
- Administrative controls for user management

### UI/UX System
- Responsive design with mobile-first approach
- Dark theme with casino-inspired color scheme
- Component library based on Radix UI primitives
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

### Authentication Flow
1. User accesses application
2. Replit Auth redirects to OpenID provider
3. Successful authentication creates/updates user session
4. User data cached in React Query for efficient access

### Game Flow
1. User selects game from dashboard
2. Game component loads with current user balance
3. User places bet through validated form inputs
4. Server processes game logic and updates database
5. Results returned to client with updated balance
6. Transaction recorded for audit purposes

### Administrative Flow
1. Admin users access dedicated admin panel
2. User management interface for balance adjustments
3. Game configuration and statistics monitoring
4. Transaction oversight and system health checks

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **express**: Web application framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for server development

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TSX for server-side TypeScript execution
- Environment variable configuration for database connections
- Replit-specific development banner integration

### Production Build
- Vite production build with code splitting
- ESBuild for server bundle compilation
- Static asset serving through Express
- Environment-based configuration management

### Database Management
- Drizzle migrations for schema changes
- Connection pooling for performance
- Environment-specific database URLs
- Automated table creation for sessions

## Changelog
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.