import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { PhotoTable } from '@/components/PhotoTable';
import { PhotoModal } from '@/components/PhotoModal';
import { PhotoData } from '@/types';
import AdminProtected from '@/components/AdminProtected';

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

      const response = await fetch('/api/photos/list?stats=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Convert new API format to existing PhotoData format
        const convertedPhotos = (data.data || []).map((photo: any) => ({
          id: photo.id,
          customerEmail: photo.customerEmail,
          photoUrl: photo.photoUrl,
          originalFilename: photo.originalName || 'Unknown',
          status: photo.status === 'completed' ? 'done' : photo.status,
          createdAt: photo.createdAt,
          updatedAt: photo.updatedAt,
          fileSize: photo.fileSize,
          mimeType: photo.mimeType,
        }));
        setPhotos(convertedPhotos);
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
      
      // Set up auto-refresh every 10 seconds
      const interval = setInterval(() => {
        fetchPhotos();
      }, 10000);

      return () => clearInterval(interval);
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  }, []);

  const getStatusSummary = () => {
    const summary = photos.reduce((acc, photo) => {
      acc[photo.status] = (acc[photo.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const virtualFittingCount = photos.filter(photo => photo.isVirtualFittingPhoto).length;

    return {
      pending: summary.pending || 0,
      processing: summary.processing || 0,
      done: summary.done || 0,
      failed: summary.failed || 0,
      total: photos.length,
      virtualFitting: virtualFittingCount,
    };
  };

  const statusSummary = getStatusSummary();

  if (!mounted) return null;

  return (
    <AdminProtected>
      <Head>
        <title>PhotoAI Pro - Admin Dashboard</title>
        <meta name="description" content="Manage customer photo uploads with AI processing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
 
      <div className="page-layout">
        {/* Modern Header */}
        <header className="page-header">
          <div className="container">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-lg">
                <div className="flex items-center gap-md">
                  <img 
                    src="/logos/photoai-icon.svg" 
                    alt="PhotoAI Pro" 
                    width="40" 
                    height="40" 
                    style={{ height: 'auto' }}
                  />
                  <div>
                    <div className="heading-6 text-primary">PhotoAI Pro</div>
                    <div className="text-xs text-muted font-medium">Admin Dashboard</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-md">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="btn btn-primary btn-sm flex items-center gap-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
                  </svg>
                  <span className="hide-mobile">Refresh</span>
                </button>
                <button 
                  onClick={() => window.open('/', '_blank')}
                  className="btn btn-secondary btn-sm"
                >
                  <span className="hide-mobile">Customer Portal</span>
                  <span className="show-mobile">Portal</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm flex items-center gap-sm text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                  </svg>
                  <span className="hide-mobile">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="page-main admin-page-main">
          <div className="container">
            {/* Stats Dashboard */}
            <div className="admin-section-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-xl mb-4xl fade-in">
              <div className="card-1 card text-center">
                <div className="flex items-center justify-between mb-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M9 11L12 14L22 4"/>
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"/>
                    </svg>
                  </div>
                  <div className="badge badge-success text-xs">Active</div>
                </div>
                <div className="heading-2 text-primary mb-sm">{statusSummary.total}</div>
                <div className="text-body text-secondary">Total Photos</div>
              </div>

              <div className="card-1 card text-center">
                <div className="flex items-center justify-between mb-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                    </svg>
                  </div>
                  <div className="badge badge-warning text-xs">Queue</div>
                </div>
                <div className="heading-2 text-primary mb-sm">{statusSummary.pending}</div>
                <div className="text-body text-secondary">Pending</div>
              </div>

              <div className="card-1 card text-center">
                <div className="flex items-center justify-between mb-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18A8 8 0 1 1 20 12A8 8 0 0 1 12 20Z"/>
                      <path d="M12 6V12L16 16"/>
                    </svg>
                  </div>
                  <div className="badge badge-info text-xs">Live</div>
                </div>
                <div className="heading-2 text-primary mb-sm">{statusSummary.processing}</div>
                <div className="text-body text-secondary">Processing</div>
              </div>

              <div className="card-1 card text-center">
                <div className="flex items-center justify-between mb-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                  </div>
                  <div className="badge badge-success text-xs">Complete</div>
                </div>
                <div className="heading-2 text-primary mb-sm">{statusSummary.done}</div>
                <div className="text-body text-secondary">Completed</div>
              </div>

              <div className="card-1 card text-center">
                <div className="flex items-center justify-between mb-lg">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                  <div className="badge badge-info text-xs">AI</div>
                </div>
                <div className="heading-2 text-primary mb-sm">{statusSummary.virtualFitting}</div>
                <div className="text-body text-secondary">Virtual Fitting</div>
              </div>
            </div>

            {/* System Status */}
            <div className="admin-section-2 grid md:grid-cols-3 gap-xl mb-4xl">
              <div className="card-2-1 card slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="heading-5 text-primary mb-lg">System Status</h3>
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Upload API</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="status text-emerald-300 text-small">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Database</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="status text-emerald-300 text-small">PostgreSQL</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">n8n Webhook</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="status text-yellow-300 text-small">Phase 2</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-2-2 card slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="heading-5 text-primary mb-lg">Quick Actions</h3>
                <div className="space-y-md quick-action">
                  <button className="btn btn-primary btn-sm w-full">
                    📊 Download Report
                  </button>
                  <button className="btn btn-secondary btn-sm w-full">
                    🔄 Bulk Process
                  </button>
                  <button className="btn btn-outline btn-sm w-full">
                    ⚙️ System Settings
                  </button>
                </div>
              </div>

              <div className="card-2-3 card slide-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="heading-5 text-primary mb-lg">Recent Activity</h3>
                {photos.length > 0 ? (
                  <div className="space-y-md">
                    {photos
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 3)
                      .map((photo, index) => (
                        <div key={photo.id} className="flex items-center gap-md p-sm rounded-lg bg-glass-light">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-primary text-small truncate">{photo.customerEmail}</p>
                            <p className="text-muted text-xs">{new Date(photo.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-lg">
                    <div className="w-12 h-12 bg-glass-light rounded-full flex items-center justify-center mx-auto mb-md">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-muted">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                      </svg>
                    </div>
                    <p className="text-secondary text-small">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="card-alert alert-error fade-in mb-xl">
                <div className="flex items-center gap-sm">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="text-red-400">
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                  </svg>
                  <p className="text-body font-medium flex-1">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="text-muted hover:text-secondary transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Phase 1 Info Banner */}
            {/* <div className="card-alert alert-info fade-in mb-xl">
              <div className="flex items-start gap-md">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-xs">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-primary font-semibold mb-sm">🚀 Phase 1 (UI Layer) - Complete!</h4>
                  <p className="text-secondary text-body mb-md leading-relaxed">
                    This beautiful interface shows uploaded photos with temporary storage. Photos are stored in memory and will reset on server restart.
                  </p>
                  <div className="flex flex-wrap gap-sm">
                    <div className="badge badge-success text-xs">✅ UI Complete</div>
                    <div className="badge badge-warning text-xs">⏳ Phase 2: n8n</div>
                    <div className="badge badge-info text-xs">🤖 Phase 3: ComfyUI</div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Customer Management Section */}
            <div className="admin-section-3 mb-4xl">
              <div className="card slide-up" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center justify-between mb-xl">
                  <h2 className="heading-4 text-primary">Customer Management</h2>
                  <div className="flex gap-md">
                    <button 
                      onClick={() => window.open('/customer/profile', '_blank')}
                      className="btn btn-secondary btn-sm"
                    >
                      📋 Customer Portal
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-xl">
                  {/* Customer Stats */}
                  <div className="customer-stats">
                    <h3 className="heading-6 text-primary mb-lg">Customer Insights</h3>
                    <div className="space-y-md">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Unique Customers</span>
                        <span className="text-primary font-semibold">
                          {new Set(photos.map(p => p.customerEmail)).size}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Virtual Fitting Users</span>
                        <span className="text-primary font-semibold">
                          {new Set(photos.filter(p => p.isVirtualFittingPhoto).map(p => p.customerEmail)).size}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Avg Photos/Customer</span>
                        <span className="text-primary font-semibold">
                          {photos.length > 0 ? Math.round(photos.length / new Set(photos.map(p => p.customerEmail)).size * 10) / 10 : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Customers */}
                  <div className="recent-customers">
                    <h3 className="heading-6 text-primary mb-lg">Recent Customers</h3>
                    <div className="space-y-md">
                      {Array.from(new Set(photos.map(p => p.customerEmail)))
                        .slice(0, 4)
                        .map((email, index) => {
                          const customerPhotos = photos.filter(p => p.customerEmail === email);
                          const hasVirtualFitting = customerPhotos.some(p => p.isVirtualFittingPhoto);
                          return (
                            <div key={email} className="flex items-center gap-md p-sm rounded-lg bg-glass-light">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {email.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-primary text-small truncate">{email}</p>
                                <div className="flex items-center gap-sm">
                                  <p className="text-muted text-xs">{customerPhotos.length} photos</p>
                                  {hasVirtualFitting && (
                                    <div className="flex items-center gap-xs">
                                      <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24" className="text-indigo-400">
                                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                                      </svg>
                                      <span className="text-xs text-indigo-400">VF</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => window.open(`/customer/profile?email=${encodeURIComponent(email)}`, '_blank')}
                                className="text-primary hover:text-indigo-400 transition-colors"
                                title="View customer profile"
                              >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Customer Features */}
                  <div className="customer-features">
                    <h3 className="heading-6 text-primary mb-lg">Available Features</h3>
                    <div className="space-y-md">
                      <div className="feature-item">
                        <div className="flex items-center gap-sm mb-sm">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-emerald-400">
                            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                          </svg>
                          <span className="text-primary font-medium">Profile Management</span>
                        </div>
                        <p className="text-secondary text-xs">Name, contact info, style preferences</p>
                      </div>
                      <div className="feature-item">
                        <div className="flex items-center gap-sm mb-sm">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-emerald-400">
                            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                          </svg>
                          <span className="text-primary font-medium">Body Measurements</span>
                        </div>
                        <p className="text-secondary text-xs">Top & bottom measurements in cm</p>
                      </div>
                      <div className="feature-item">
                        <div className="flex items-center gap-sm mb-sm">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-emerald-400">
                            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                          </svg>
                          <span className="text-primary font-medium">Size Recommendations</span>
                        </div>
                        <p className="text-secondary text-xs">AI-powered size matching</p>
                      </div>
                      <div className="feature-item">
                        <div className="flex items-center gap-sm mb-sm">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-yellow-400">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                          </svg>
                          <span className="text-primary font-medium">Shopify Integration</span>
                        </div>
                        <p className="text-secondary text-xs">Order history & customer sync</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Table */}
            <div className="slide-up" style={{ animationDelay: '0.9s' }}>
              <PhotoTable
                photos={photos}
                loading={loading}
                onPhotoClick={handlePhotoClick}
              />
            </div>

          </div>
        </main>

        {/* Photo Modal */}
        <PhotoModal
          photo={selectedPhoto}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>
    </AdminProtected>
  );
};

export default AdminPhotosPage;