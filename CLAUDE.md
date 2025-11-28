# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (next lint)
- `npm run type-check` - Run TypeScript type checking (tsc --noEmit)

### Testing and Deployment
- `vercel` - Deploy to Vercel (requires Vercel CLI)
- `vercel --prod` - Production deployment

### Quality Checks
When making changes, always run these commands before committing:
1. `npm run type-check` - Ensure TypeScript types are correct
2. `npm run lint` - Check code style and catch potential issues

## Project Architecture

### Technology Stack
- **Framework**: Next.js 14 with TypeScript and React 18
- **UI**: Shopify Polaris design system with custom CSS
- **Styling**: CSS3 with glass morphism and gradient themes
- **Backend**: Next.js API routes with Node.js
- **Database**: Prisma ORM with PostgreSQL (transitioning from in-memory storage)
- **Storage**: Filesystem storage with database metadata

### Core Structure
This is a **PhotoAI Pro** application - an AI-powered photo processing app with a beautiful modern UI featuring glass morphism and gradient designs.

**Two main interfaces:**
- **Customer Portal** (`/` - pages/index.tsx): Public photo upload interface
- **Admin Dashboard** (`/admin/photos` - pages/admin/photos.tsx): Photo management interface

### Key Directories
- `pages/` - Next.js pages (customer portal, admin dashboard, API routes)
- `components/` - Reusable React components (PhotoUploader, PhotoTable, PhotoModal)
- `lib/` - Utility libraries (storage, database, security, file handling, n8n integration)
- `prisma/` - Database schema and migrations
- `types/index.ts` - TypeScript type definitions
- `styles/globals.css` - Global styles with gradient themes

### Database Architecture
**Transitioning to Prisma + PostgreSQL:**
- **Current**: Hybrid approach with in-memory storage (`lib/storage.ts`) and Prisma schema ready
- **Schema**: Photo model with comprehensive metadata (prisma/schema.prisma:15)
- **Status Enum**: PENDING, PROCESSING, COMPLETED, FAILED (prisma/schema.prisma:33)
- **Indexes**: Optimized for status, creation date, and customer email lookups
- **Files**: Stored in `/tmp/uploads` directory (created automatically)
- **Important**: In-memory data lost on restart until full Prisma migration
- **Future**: Phase 2 n8n integration, Phase 3 ComfyUI AI processing

### API Routes
- `POST /api/upload-photo` - Photo upload with validation (max 10MB, JPG/PNG/WebP)
- `GET /api/photos/list` - Retrieve all uploaded photos with metadata
- `PUT /api/photos/update` - Update photo status and metadata
- `GET /api/photos/serve/[filename]` - Serve uploaded images with security checks

### Component Architecture
- **PhotoUploader**: Drag & drop upload with progress, validation, GDPR compliance
- **PhotoTable**: Admin photo management with search, filtering, status updates
- **PhotoModal**: Detailed photo viewer with metadata display

### Configuration
- **TypeScript**: Strict mode enabled, path aliases (`@/*` for root), incremental compilation
- **Next.js**: React strict mode, Shopify Polaris transpilation, unoptimized images for localhost, experimental ESM externals
- **Prisma**: PostgreSQL datasource with cuid() IDs, comprehensive indexing strategy
- **Vercel**: Custom function timeouts (upload: 30s, list/serve: 10s) for photo processing endpoints

### Design System
- **Primary gradient**: Purple to blue (#667eea → #764ba2)
- **Glass morphism**: Translucent backgrounds with backdrop blur
- **Animations**: Fade-in, slide-up, bounce effects
- **Responsive design**: Mobile-first approach

### Security Features
- File type validation (client and server-side)
- File size limits (10MB maximum)  
- Path traversal protection
- Input sanitization
- GDPR compliance checkbox

### Development Notes
- Uses Shopify Polaris components for consistent UI
- Custom CSS with CSS3 gradients and modern effects
- Photo status workflow: PENDING → PROCESSING → COMPLETED/FAILED (Prisma enum)
- Multiple utility libraries in `lib/` for modular architecture
- TypeScript types defined in `types/index.ts` - extend PhotoData interface for new fields
- File uploads use formidable middleware in API routes
- All image serving goes through `/api/photos/serve/[filename]` for security
- n8n webhook integration ready for workflow automation
- Database migration available but currently using hybrid storage

### Important Implementation Details
- **File Upload Flow**: Client → `/api/upload-photo` → `StorageService.saveFile()` + `savePhoto()`
- **Photo Status Updates**: Use `StorageService.updatePhotoStatus(id, status)` for in-memory, `/api/photos/update` for persistence
- **Data Retrieval**: `StorageService.getAllPhotos()` returns sorted by creation date (newest first)
- **File Validation**: Both client-side (drag/drop) and server-side (formidable + manual checks)
- **Path Handling**: All file paths use `path.join()` to prevent traversal attacks
- **Database Schema**: Prisma model ready with comprehensive fields including n8n webhook tracking
- **Library Structure**: Modular design with separate concerns (db.ts, file.ts, security.ts, n8n.ts)

### Development Workflow
- Always run `npm run type-check` and `npm run lint` before committing
- Use existing `StorageService` for current operations while Prisma migration is in progress
- Follow the established photo status enum values (PENDING/PROCESSING/COMPLETED/FAILED)
- Leverage existing utility libraries in `lib/` for security, file handling, and integrations