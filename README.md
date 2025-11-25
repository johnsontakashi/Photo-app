# 🎨 PhotoAI Pro - AI-Powered Photo Processing App

A stunning, modern photo processing application built with Next.js, TypeScript, and Shopify Polaris with beautiful gradients and glass morphism design.

## ✨ Features

### 🎨 Beautiful Modern Design
- **Glass Morphism UI** with translucent cards and backdrop blur
- **Gradient Backgrounds** with animated purple-to-blue themes
- **Smooth Animations** including fade-in, slide-up, and bounce effects
- **Responsive Design** optimized for all screen sizes
- **Professional Branding** with cohesive color palette

### 📸 Customer Upload Portal
- **Drag & Drop Upload** with interactive hover effects
- **File Validation** (JPG, PNG, WebP, max 10MB)
- **Live Preview** of uploaded images
- **Progress Bar** with animated upload feedback
- **GDPR Compliance** with privacy consent checkbox

### 👨‍💼 Admin Dashboard
- **Real-time Statistics** with colorful gradient cards
- **Photo Management** with search and filtering
- **System Status** indicators with live updates
- **Photo Gallery** with thumbnail previews
- **Detailed Modal** views for each upload

## 🚀 Technology Stack

- **Frontend**: React 18 + Next.js 14 + TypeScript
- **UI Framework**: Shopify Polaris + Custom CSS
- **Styling**: CSS3 with gradients, glass morphism, and animations
- **Backend**: Next.js API Routes + Node.js
- **File Storage**: Temporary filesystem storage (Phase 1)
- **Deployment**: Vercel

## 📱 Live Demo

- **Customer Portal**: Upload photos with beautiful UI
- **Admin Dashboard**: Manage and view uploaded photos

## 🛠 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd PhotoAI-Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Customer Portal: http://localhost:3000
   Admin Dashboard: http://localhost:3000/admin/photos
   ```

## 🎯 Project Structure

```
├── components/           # Reusable React components
│   ├── PhotoUploader.tsx # Beautiful upload interface
│   ├── PhotoTable.tsx    # Admin photo management
│   └── PhotoModal.tsx    # Detailed photo viewer
├── pages/
│   ├── index.tsx         # Customer upload portal
│   ├── admin/photos.tsx  # Admin dashboard
│   └── api/             # Backend API endpoints
├── styles/
│   └── globals.css      # Global styles with gradients
├── lib/
│   └── storage.ts       # File storage utilities
└── types/
    └── index.ts         # TypeScript definitions
```

## 🎨 Design System

### Color Palette
- **Primary Gradient**: Purple to Blue (#667eea → #764ba2)
- **Secondary Gradient**: Pink to Red (#f093fb → #f5576c)
- **Success Gradient**: Blue to Cyan (#4facfe → #00f2fe)
- **Glass Effects**: Translucent backgrounds with blur

### Animations
- **Fade In**: Smooth element appearance
- **Slide Up**: Content slides from bottom
- **Bounce In**: Playful element entrance
- **Hover Effects**: Interactive feedback

## 🔄 Project Phases

### ✅ Phase 1 (Current): UI Layer
- Beautiful frontend interface
- Basic file upload and management
- Temporary storage system
- Modern design implementation

### ⏳ Phase 2 (Coming): n8n Integration
- Automated workflow processing
- External service integrations
- Advanced file management

### 🤖 Phase 3 (Future): ComfyUI AI
- AI-powered photo enhancement
- Machine learning processing
- Advanced image transformations

## 🌐 Deployment

### Vercel Deployment
1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables
- `NODE_ENV=production` (auto-set by Vercel)

## 📄 API Endpoints

- `POST /api/upload-photo` - Upload photo with validation
- `GET /api/photos/list` - Retrieve all uploaded photos
- `GET /api/photos/serve/[filename]` - Serve uploaded images

## 🛡️ Security Features

- **File Type Validation** (client and server-side)
- **File Size Limits** (10MB maximum)
- **Path Traversal Protection** 
- **GDPR Compliance** with privacy controls
- **Input Sanitization** for all user data

## 📈 Performance

- **Optimized Components** with React.memo and useCallback
- **Image Optimization** with Next.js Image component
- **Code Splitting** for optimal loading
- **CSS Optimization** with modern properties

## 🎭 Visual Highlights

- **Animated Background** with floating particles
- **Glass Cards** with sophisticated blur effects
- **Gradient Buttons** with hover animations
- **Status Badges** with color-coded states
- **Loading Spinners** with smooth transitions
- **Progress Bars** with shimmer effects

---

Built with ❤️ using modern web technologies and stunning visual design.