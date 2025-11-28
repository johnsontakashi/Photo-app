import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { PhotoUploader } from '@/components/PhotoUploader';
import { UploadResponse } from '@/types';
import { useAuth } from '@/lib/auth';

const CustomerUploadPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUploadSuccess = (response: UploadResponse) => {
    console.log('Upload successful:', response);
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>PhotoAI Pro | AI-Powered Photo Processing Platform</title>
        <meta name="description" content="Transform your photos with our cutting-edge AI technology. Professional photo processing, enhancement, and transformation in minutes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="PhotoAI Pro - AI Photo Processing" />
        <meta property="og:description" content="Transform your photos with AI-powered processing" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="page-layout">
        {/* Modern Header */}
        <header className="page-header">
          <div className="container">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-lg">
                <div className="flex items-center gap-md">
                  <img 
                    src="/logos/photoai-pro-logo.svg" 
                    alt="PhotoAI Pro - AI-Powered Photo Processing" 
                    width="180" 
                    height="54" 
                    style={{ height: 'auto', maxWidth: '140px' }}
                    className="responsive-logo"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-md">
                {user && (
                  <div className="flex items-center gap-sm text-secondary text-small">
                    <span className="hide-mobile">Welcome, {user.firstName || user.email}</span>
                    <span className="show-mobile">Hi, {user.firstName || 'User'}</span>
                  </div>
                )}
                <button 
                  onClick={() => window.location.href = '/customer/profile'}
                  className="btn btn-primary btn-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  <span className="hide-mobile">My Profile</span>
                  <span className="show-mobile">Profile</span>
                </button>
                <button 
                  onClick={logout}
                  className="btn btn-outline btn-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                  </svg>
                  <span className="hide-mobile">Logout</span>
                  <span className="show-mobile">Exit</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/login'}
                  className="btn btn-outline btn-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  <span className="hide-mobile">Admin</span>
                  <span className="show-mobile">Admin</span>
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="page-main">
          <div className="container">
            
            {/* Clean Hero Section */}
            <section className="text-center mb-16">
              <div className="container-md mx-auto">
                <div className="mb-12 fade-in">
                  {/* Simple Badge */}
                  <div className="inline-flex items-center gap-2 p-3 bg-gray-100 rounded-full mb-8">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-small font-medium text-gray-700">AI-Powered Photo Processing</span>
                  </div>
                  
                  {/* Bold Main Title */}
                  <h1 className="heading-1">
                    Transform Your Photos<br />
                    with Professional AI
                  </h1>
                  
                  {/* Clean Subtitle */}
                  <p className="text-large text-secondary max-w-2xl mx-auto mb-8">
                    Upload your images and let our advanced AI technology enhance, 
                    process, and transform them into stunning professional visuals.
                  </p>

                  {/* Clean Feature Badges */}
                  <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                    <div className="badge badge-success">
                      <span>Lightning Fast</span>
                    </div>
                    <div className="badge badge-info">
                      <span>AI Enhanced</span>
                    </div>
                    <div className="badge badge-warning">
                      <span>Secure & Private</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Upload Section */}
            <section className="mb-4xl">
              <div className="grid grid-cols-1 gap-4xl items-start">
                
                {/* Upload Form */}
                <div className="container-md mx-auto">
                  <PhotoUploader onUploadSuccess={handleUploadSuccess} />
                </div>
                
              </div>
            </section>

            {/* Bento Box Features Section */}
            <section className="mb-16">
              <div className="container-lg mx-auto">
                <div className="text-center mb-12">
                  <h2 className="heading-2">Complete Your Profile</h2>
                  <p className="text-large text-secondary">Personalize your AI experience for better results</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card text-center interactive">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg width="32" height="32" fill="#3b82f6" viewBox="0 0 24 24">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-3">Personal Profile</h3>
                    <p className="text-secondary mb-6">
                      Set up your personal details and style preferences for customized AI processing
                    </p>
                    <button 
                      onClick={() => window.location.href = '/customer/profile'}
                      className="btn btn-primary w-full"
                    >
                      Setup Profile
                    </button>
                  </div>

                  <div className="card text-center interactive">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg width="32" height="32" fill="#22c55e" viewBox="0 0 24 24">
                        <path d="M12,2A2,2 0 0,1 14,4C14,5.5 13,6.19 13,7H16V10H13V13H16V16H13C13,16.81 14,17.5 14,19A2,2 0 0,1 12,21A2,2 0 0,1 10,19C10,17.5 11,16.81 11,16H8V13H11V10H8V7H11C11,6.19 10,5.5 10,4A2,2 0 0,1 12,2Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-3">Body Measurements</h3>
                    <p className="text-secondary mb-6">
                      Add precise measurements for accurate size recommendations across brands
                    </p>
                    <button 
                      onClick={() => window.location.href = '/customer/profile?tab=measurements'}
                      className="btn btn-primary w-full"
                    >
                      Add Measurements
                    </button>
                  </div>

                  <div className="card text-center interactive">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg width="32" height="32" fill="#f97316" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-5 mb-3">AI Recommendations</h3>
                    <p className="text-secondary mb-6">
                      Get intelligent size suggestions based on your measurements and photos
                    </p>
                    <button 
                      onClick={() => window.location.href = '/customer/profile?tab=recommendations'}
                      className="btn btn-primary w-full"
                    >
                      View Recommendations
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Cyber Capabilities Grid */}
            <section className="mb-4xl">
              <div className="container-lg mx-auto">
                <div className="text-center mb-2xl">
                  <h2 className="heading-2 mb-md">Next-Gen Capabilities</h2>
                  <p className="text-large text-secondary">Revolutionary technology that pushes the boundaries of what's possible</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
                  <div className="card text-center bounce-in interactive">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-1 flex items-center justify-center mx-auto mb-lg glow">
                      <svg width="36" height="36" fill="white" viewBox="0 0 24 24">
                        <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm holographic">Quantum Processing</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      Sub-millisecond processing with quantum-accelerated neural networks
                    </p>
                  </div>

                  <div className="card text-center bounce-in interactive" style={{ animationDelay: '0.1s' }}>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-2 flex items-center justify-center mx-auto mb-lg glow">
                      <svg width="36" height="36" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm holographic">Neural Synthesis</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      Deep learning algorithms with transformer-based image enhancement
                    </p>
                  </div>

                  <div className="card text-center bounce-in interactive" style={{ animationDelay: '0.2s' }}>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-3 flex items-center justify-center mx-auto mb-lg glow">
                      <svg width="36" height="36" fill="white" viewBox="0 0 24 24">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm holographic">Zero-Trust Security</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      Military-grade encryption with blockchain-verified data integrity
                    </p>
                  </div>

                  <div className="card text-center bounce-in interactive" style={{ animationDelay: '0.3s' }}>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-4 flex items-center justify-center mx-auto mb-lg glow">
                      <svg width="36" height="36" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm holographic">24/7 Neural Support</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      AI-powered assistance with human experts on standby for complex queries
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics Section */}
            <section className="mb-4xl section-world">
              <div className="container-md mx-auto">
                <div className="card card-spacious text-center">
                  <h2 className="heading-4 text-primary mb-2xl">Trusted by Professionals Worldwide</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2xl">
                    <div>
                      <div className="heading-2 text-primary mb-sm">50K+</div>
                      <div className="text-body font-medium text-secondary">Photos Processed</div>
                    </div>
                    <div>
                      <div className="heading-2 text-primary mb-sm">99.9%</div>
                      <div className="text-body font-medium text-secondary">Uptime Guarantee</div>
                    </div>
                    <div>
                      <div className="heading-2 text-primary mb-sm">4.9★</div>
                      <div className="text-body font-medium text-secondary">Customer Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Process Steps */}
            <section className="sectionWork mb-4xl">
              <div className="container-lg mx-auto">
                <div className="text-center mb-2xl">
                  <h2 className="heading-3 text-primary mb-md">How It Works</h2>
                  <p className="text-large text-secondary">Simple three-step process to transform your photos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-xl flex">
                  <div className="text-center slide-up">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-lg">
                      <span className="heading-3 text-white font-extrabold">1</span>
                    </div>
                    <h3 className="heading-5 text-primary mb-md">Upload</h3>
                    <p className="text-body leading-relaxed">
                      Simply drag and drop your photo or browse to select from your device
                    </p>
                  </div>

                  <div className="text-center slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-lg">
                      <span className="heading-3 text-white font-extrabold">2</span>
                    </div>
                    <h3 className="heading-5 text-primary mb-md">Process</h3>
                    <p className="text-body leading-relaxed">
                      Our AI analyzes and enhances your image using advanced algorithms
                    </p>
                  </div>

                  <div className="text-center slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-lg">
                      <span className="heading-3 text-white font-extrabold">3</span>
                    </div>
                    <h3 className="heading-5 text-primary mb-md">Download</h3>
                    <p className="text-body leading-relaxed">
                      Receive your professionally processed image via email notification
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>

        {/* Modern Footer */}
        <footer className="page-footer">
          <div className="container">
            <div className="bottom-text grid grid-cols-1 md:grid-cols-3 gap-xl text-center md:text-left">
              
              <div>
                <h3 className="heading-6 text-primary mb-lg">Supported Formats</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-small text-secondary">JPEG & JPG</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-teal-500"></div>
                    <span className="text-small text-secondary">PNG with transparency</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-emerald-500"></div>
                    <span className="text-small text-secondary">WebP format</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <span className="text-small text-secondary">Up to 10MB per file</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="heading-6 text-primary mb-lg">Security & Privacy</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-emerald-500"></div>
                    <span className="text-small text-secondary">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-teal-500"></div>
                    <span className="text-small text-secondary">GDPR compliant</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-small text-secondary">Auto-delete after processing</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-sm">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-small text-secondary">No data sharing</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="heading-6 text-primary mb-lg">Company</h3>
                <div className="flex flex-col items-center md:items-start gap-sm">
                  <div className="flex items-center gap-sm">
                    <div>
                      <div className="heading-6 text-primary">PhotoAI Pro</div>
                      <div className="text-xs text-muted">AI Photo Processing Platform</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-2xl pt-xl border-t border-glass-border text-center">
              <p className="text-small text-muted">
                © 2024 PhotoAI Pro. All rights reserved. | Phase 1 (UI Layer) Implementation
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default CustomerUploadPage;