import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { PhotoTable } from '@/components/PhotoTable';
import { PhotoModal } from '@/components/PhotoModal';
import { PhotoData } from '@/types';

const AdminPhotosPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/photos/list');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPhotos(data.photos || []);
      } else {
        throw new Error(data.message || 'Failed to load photos');
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPhotos();
    }
  }, [fetchPhotos, mounted]);

  const handlePhotoClick = useCallback((photo: PhotoData) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedPhoto(null);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const getStatusSummary = () => {
    const summary = photos.reduce((acc, photo) => {
      acc[photo.status] = (acc[photo.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      pending: summary.pending || 0,
      processing: summary.processing || 0,
      done: summary.done || 0,
      total: photos.length,
    };
  };

  const statusSummary = getStatusSummary();

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>PhotoAI Pro - Admin Dashboard</title>
        <meta name="description" content="Manage customer photo uploads with AI processing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen relative">
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="glass-card mx-6 mt-6 p-6 fade-in">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">PhotoAI Pro</h1>
                  <p className="text-white/70">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="gradient-button flex items-center space-x-2"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
                  </svg>
                  <span>Refresh</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="gradient-button success"
                >
                  Customer Portal
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M9 11L12 14L22 4"/>
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"/>
                    </svg>
                  </div>
                  <span className="status-badge done text-xs">Active</span>
                </div>
                <div className="stat-number">{statusSummary.total}</div>
                <div className="stat-label">Total Photos</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                    </svg>
                  </div>
                  <span className="status-badge pending text-xs">Queue</span>
                </div>
                <div className="stat-number">{statusSummary.pending}</div>
                <div className="stat-label">Pending</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-coral-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18A8 8 0 1 1 20 12A8 8 0 0 1 12 20Z"/>
                      <path d="M12 6V12L16 16"/>
                    </svg>
                  </div>
                  <span className="status-badge processing text-xs">Live</span>
                </div>
                <div className="stat-number">{statusSummary.processing}</div>
                <div className="stat-label">Processing</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                  </div>
                  <span className="status-badge done text-xs">Complete</span>
                </div>
                <div className="stat-number">{statusSummary.done}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            {/* System Status */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Upload API</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Photo Storage</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">AI Processing</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-red-300 text-sm">Phase 2</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full gradient-button text-sm py-2">
                    📊 Download Report
                  </button>
                  <button className="w-full gradient-button success text-sm py-2">
                    🔄 Bulk Process
                  </button>
                  <button className="w-full gradient-button warning text-sm py-2">
                    ⚙️ System Settings
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {photos.length > 0 ? (
                  <div className="space-y-3">
                    {photos
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 3)
                      .map((photo, index) => (
                        <div key={photo.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                          <div className="w-8 h-8 bg-gradient-to-r from-coral-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{photo.customerEmail}</p>
                            <p className="text-white/60 text-xs">{new Date(photo.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24" opacity="0.5">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                      </svg>
                    </div>
                    <p className="text-white/60 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6 bounce-in">
                <div className="flex items-center space-x-2">
                  <svg width="20" height="20" fill="#fca5a5" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                  </svg>
                  <p className="text-red-100 font-medium">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto text-red-300 hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Phase 1 Info Banner */}
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6 mb-6 bounce-in">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-100 font-semibold mb-2">🚀 Phase 1 (UI Layer) - Complete!</h4>
                  <p className="text-blue-200/80 text-sm mb-3">
                    This beautiful interface shows uploaded photos with temporary storage. Photos are stored in memory and will reset on server restart.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="status-badge done text-xs">✅ UI Complete</span>
                    <span className="status-badge pending text-xs">⏳ Phase 2: n8n</span>
                    <span className="status-badge pending text-xs">🤖 Phase 3: ComfyUI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Table */}
            <div className="slide-up" style={{ animationDelay: '0.8s' }}>
              <PhotoTable
                photos={photos}
                loading={loading}
                onPhotoClick={handlePhotoClick}
              />
            </div>
          </main>
        </div>

        {/* Photo Modal */}
        <PhotoModal
          photo={selectedPhoto}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        .relative {
          position: relative;
        }
        .z-10 {
          z-index: 10;
        }
        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .items-start {
          align-items: flex-start;
        }
        .justify-between {
          justify-content: space-between;
        }
        .space-x-2 > * + * {
          margin-left: 0.5rem;
        }
        .space-x-3 > * + * {
          margin-left: 0.75rem;
        }
        .space-x-4 > * + * {
          margin-left: 1rem;
        }
        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }
        .grid {
          display: grid;
        }
        .grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .gap-6 {
          gap: 1.5rem;
        }
        .max-w-7xl {
          max-width: 80rem;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .mx-6 {
          margin-left: 1.5rem;
          margin-right: 1.5rem;
        }
        .mt-6 {
          margin-top: 1.5rem;
        }
        .mt-0\\.5 {
          margin-top: 0.125rem;
        }
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        .mb-3 {
          margin-bottom: 0.75rem;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        .mb-8 {
          margin-bottom: 2rem;
        }
        .ml-auto {
          margin-left: auto;
        }
        .p-2 {
          padding: 0.5rem;
        }
        .p-4 {
          padding: 1rem;
        }
        .p-6 {
          padding: 1.5rem;
        }
        .px-6 {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .py-4 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        .w-2 {
          width: 0.5rem;
        }
        .w-8 {
          width: 2rem;
        }
        .w-12 {
          width: 3rem;
        }
        .w-full {
          width: 100%;
        }
        .h-2 {
          height: 0.5rem;
        }
        .h-8 {
          height: 2rem;
        }
        .h-12 {
          height: 3rem;
        }
        .min-w-0 {
          min-width: 0;
        }
        .flex-1 {
          flex: 1;
        }
        .flex-shrink-0 {
          flex-shrink: 0;
        }
        .flex-wrap {
          flex-wrap: wrap;
        }
        .text-xs {
          font-size: 0.75rem;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-lg {
          font-size: 1.125rem;
        }
        .text-2xl {
          font-size: 1.5rem;
        }
        .font-bold {
          font-weight: 700;
        }
        .font-semibold {
          font-weight: 600;
        }
        .font-medium {
          font-weight: 500;
        }
        .text-white {
          color: white;
        }
        .text-center {
          text-align: center;
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rounded-lg {
          border-radius: 0.5rem;
        }
        .rounded-xl {
          border-radius: 0.75rem;
        }
        .rounded-full {
          border-radius: 9999px;
        }
        .border {
          border-width: 1px;
        }
        .bg-white\\/5 {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .bg-white\\/10 {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .bg-red-500\\/20 {
          background-color: rgba(239, 68, 68, 0.2);
        }
        .bg-blue-500\\/20 {
          background-color: rgba(59, 130, 246, 0.2);
        }
        .bg-green-400 {
          background-color: #4ade80;
        }
        .bg-red-400 {
          background-color: #f87171;
        }
        .bg-gradient-to-r {
          background-image: linear-gradient(to right, var(--tw-gradient-stops));
        }
        .from-blue-500 {
          --tw-gradient-from: #3b82f6;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
        }
        .to-cyan-500 {
          --tw-gradient-to: #06b6d4;
        }
        .from-yellow-500 {
          --tw-gradient-from: #eab308;
        }
        .to-orange-500 {
          --tw-gradient-to: #f97316;
        }
        .from-purple-500 {
          --tw-gradient-from: #a855f7;
        }
        .to-pink-500 {
          --tw-gradient-to: #ec4899;
        }
        .from-green-500 {
          --tw-gradient-from: #22c55e;
        }
        .to-emerald-500 {
          --tw-gradient-to: #10b981;
        }
        .from-blue-400 {
          --tw-gradient-from: #60a5fa;
        }
        .to-cyan-400 {
          --tw-gradient-to: #22d3ee;
        }
        .from-purple-400 {
          --tw-gradient-from: #c084fc;
        }
        .to-pink-400 {
          --tw-gradient-to: #f472b6;
        }
        .border-red-400\\/30 {
          border-color: rgba(248, 113, 113, 0.3);
        }
        .border-blue-400\\/30 {
          border-color: rgba(96, 165, 250, 0.3);
        }
        .text-white\\/70 {
          color: rgba(255, 255, 255, 0.7);
        }
        .text-white\\/80 {
          color: rgba(255, 255, 255, 0.8);
        }
        .text-white\\/60 {
          color: rgba(255, 255, 255, 0.6);
        }
        .text-green-300 {
          color: #86efac;
        }
        .text-red-300 {
          color: #fca5a5;
        }
        .text-red-100 {
          color: #fee2e2;
        }
        .text-red-200 {
          color: #fecaca;
        }
        .text-blue-100 {
          color: #dbeafe;
        }
        .text-blue-200\\/80 {
          color: rgba(191, 219, 254, 0.8);
        }
        .hover\\:text-red-200:hover {
          color: #fecaca;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        @media (min-width: 768px) {
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1024px) {
          .lg\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
};

export default AdminPhotosPage;