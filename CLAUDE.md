# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Testing and Deployment
- `vercel` - Deploy to Vercel (requires Vercel CLI)
- `vercel --prod` - Production deployment

## Project Architecture

### Technology Stack
- **Framework**: Next.js 14 with TypeScript and React 18
- **UI**: Shopify Polaris design system with custom CSS
- **Styling**: CSS3 with glass morphism and gradient themes
- **Backend**: Next.js API routes with Node.js
- **Storage**: Temporary filesystem storage (Phase 1 - in-memory metadata)

### Core Structure
This is a **PhotoAI Pro** application - an AI-powered photo processing app with a beautiful modern UI featuring glass morphism and gradient designs.

**Two main interfaces:**
- **Customer Portal** (`/` - pages/index.tsx): Public photo upload interface
- **Admin Dashboard** (`/admin/photos` - pages/admin/photos.tsx): Photo management interface

### Key Directories
- `pages/` - Next.js pages (customer portal, admin dashboard, API routes)
- `components/` - Reusable React components (PhotoUploader, PhotoTable, PhotoModal)
- `lib/storage.ts` - Storage service with in-memory metadata and filesystem storage
- `types/index.ts` - TypeScript type definitions
- `styles/globals.css` - Global styles with gradient themes

### Storage Architecture
Currently in **Phase 1** with temporary storage:
- **Metadata**: In-memory array (`photoMetadata`) in `lib/storage.ts`
- **Files**: Stored in `/tmp/uploads` directory
- **Future**: Phase 2 will integrate with n8n workflows, Phase 3 with ComfyUI AI

### API Routes
- `POST /api/upload-photo` - Photo upload with validation (max 10MB, JPG/PNG/WebP)
- `GET /api/photos/list` - Retrieve all uploaded photos with metadata
- `GET /api/photos/serve/[filename]` - Serve uploaded images

### Component Architecture
- **PhotoUploader**: Drag & drop upload with progress, validation, GDPR compliance
- **PhotoTable**: Admin photo management with search, filtering, status updates
- **PhotoModal**: Detailed photo viewer with metadata display

### Configuration
- **TypeScript**: Strict mode enabled, path aliases (`@/*` for root)
- **Next.js**: React strict mode, Shopify Polaris transpilation, unoptimized images for localhost
- **Vercel**: Custom function timeouts for photo processing endpoints

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
- Photo status workflow: 'pending' → 'processing' → 'done'
- Temporary storage will be replaced in future phases