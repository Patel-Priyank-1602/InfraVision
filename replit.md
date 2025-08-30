# InfraVision - Green Hydrogen Infrastructure Planning

## Overview

InfraVision is an interactive web-based tool designed to revolutionize the planning and optimization of green hydrogen infrastructure. The application combines gamification, AI intelligence, and impact metrics to make infrastructure planning engaging and accessible for urban planners, energy companies, project developers, and policy analysts.

The platform features three core functionalities: gamified optimization through drag-and-drop map interactions, AI-assisted site suggestions using machine learning algorithms, and comprehensive sustainability impact dashboards that quantify environmental and economic benefits. Users can interactively place hydrogen plant markers on maps, receive real-time suitability scoring, and access AI-powered recommendations for optimal site locations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built with React and TypeScript, utilizing a modern component-based architecture. The UI leverages shadcn/ui components built on Radix UI primitives, providing a consistent and accessible design system. The application uses Wouter for client-side routing and React Query (TanStack Query) for efficient data fetching and state management.

Interactive mapping functionality is implemented using Leaflet.js, enabling drag-and-drop site placement and real-time visualization of hydrogen plants, renewable energy sources, and demand centers. The mapping system supports dynamic marker placement with immediate suitability scoring feedback.

### Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The application uses a layered architecture with separate concerns for routing, data access, and business logic. OpenAI integration provides AI-powered site analysis and chatbot functionality for user assistance.

The backend implements real-time suitability scoring using rule-based algorithms that consider factors like proximity to renewable energy sources, industrial demand hubs, transportation costs, and regulatory environments. Distance calculations and infrastructure proximity analysis are performed server-side for accurate scoring.

### Authentication System
User authentication is handled through Replit's OpenID Connect integration using the openid-client library. The system maintains user sessions with PostgreSQL-backed session storage using connect-pg-simple. Authentication state is managed client-side through React Query with automatic token handling and session validation.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, hydrogen sites, renewable energy sources, and demand centers. Site data includes geographic coordinates, suitability scores, and impact metrics like CO2 savings and supported industries.

Session management is implemented with a dedicated sessions table required for Replit Auth integration. The database supports both user-placed sites and AI-suggested locations with appropriate flags and metadata.

### AI Integration
OpenAI's GPT models power two key features: an intelligent chatbot assistant that helps users understand hydrogen infrastructure planning, and automated site analysis that provides suitability scoring with detailed factor breakdowns. The AI system generates recommendations based on geographic data, renewable energy proximity, and infrastructure considerations.

## External Dependencies

### Third-Party Services
- **Neon Database**: PostgreSQL-compatible serverless database for production data storage
- **OpenAI API**: Powers the AI chatbot assistant and site analysis features
- **Replit Authentication**: Handles user authentication via OpenID Connect

### Key Libraries and Frameworks
- **React**: Frontend framework with TypeScript support
- **Express.js**: Backend web application framework
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL operations
- **Leaflet.js**: Interactive mapping library for geographic visualizations
- **Radix UI**: Accessible component primitives for the design system
- **TailwindCSS**: Utility-first CSS framework for styling
- **React Query**: Data fetching and state management
- **Chart.js**: Data visualization for impact dashboards
- **Vite**: Build tool and development server

### Development Tools
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **Zod**: Runtime type validation for API schemas