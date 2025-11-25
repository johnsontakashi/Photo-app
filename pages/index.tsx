import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { PhotoUploader } from '@/components/PhotoUploader';
import { UploadResponse } from '@/types';

const CustomerUploadPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

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
                    style={{ height: 'auto' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-md">
                <button 
                  onClick={() => window.location.href = '/admin/photos'}
                  className="btn btn-secondary btn-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                  Admin Dashboard
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="page-main">
          <div className="container">
            
            {/* Hero Content */}
            <section className="text-center mb-4xl">
              <div className="container-md mx-auto">
                <div className="mb-2xl fade-in">
                  <div className="inline-flex items-center gap-sm p-md card-compact mb-xl">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <span className="text-small font-semibold text-accent">Powered by Advanced AI</span>
                  </div>
                  
                  <h1 className="heading-1 mb-lg">
                    Transform Your Photos with <br />
                    <span className="text-primary">Professional AI</span>
                  </h1>
                  
                  <p className="text-large text-secondary leading-relaxed max-w-2xl mx-auto mb-2xl">
                    Upload your images and let our cutting-edge AI technology enhance, 
                    process, and transform them into stunning professional visuals in minutes.
                  </p>

                  <div className="flex items-center justify-center gap-lg mb-2xl">
                    <div className="flex items-center gap-sm">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-small font-medium category-title">Lightning Fast</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-small font-medium category-title">AI-Powered</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      <span className="text-small font-medium category-title">Secure & Private</span>
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

            {/* Features Grid */}
            <section className="sectionAI mb-4xl mt-20 mb-20">
              <div className="container-lg mx-auto">
                <div className="text-center mb-2xl">
                  <h2 className="heading-3 text-primary mb-md">Why Choose PhotoAI Pro?</h2>
                  <p className="text-large text-secondary">Powerful features designed for professional results</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl flex">
                  <div className="card text-center slide-up">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-lg">
                      <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                        <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm">Lightning Fast</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      Process your photos in seconds with our optimized AI algorithms
                    </p>
                  </div>

                  <div className="card text-center slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-lg">
                      <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm">AI Enhanced</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      Advanced machine learning for intelligent photo enhancement
                    </p>
                  </div>

                  <div className="card text-center slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-lg">
                      <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm">Secure & Private</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      GDPR compliant with end-to-end encryption for your privacy
                    </p>
                  </div>

                  <div className="card text-center slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-lg">
                      <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                      </svg>
                    </div>
                    <h3 className="heading-6 text-primary mb-sm">24/7 Support</h3>
                    <p className="text-small text-secondary leading-relaxed">
                      Round-the-clock assistance for all your processing needs
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