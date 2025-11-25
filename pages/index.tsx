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
        <title>AI Photo Processing | Upload Your Photos</title>
        <meta name="description" content="Transform your photos with AI-powered processing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen relative">
        {/* Hero Section */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="glass-card mx-6 mt-6 p-4 fade-in">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M9 3L5 6.5V21h14V6.5L15 3z"/>
                    <path d="M12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">PhotoAI Pro</h1>
                  <p className="text-sm text-white/70">AI-Powered Processing</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.location.href = '/admin/photos'}
                  className="gradient-button text-sm"
                >
                  Admin Dashboard
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-6xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side - Hero Content */}
                <div className="space-y-8 slide-up">
                  <div className="space-y-6">
                    <div className="inline-block">
                      <span className="status-badge processing text-sm">
                        ✨ AI Powered
                      </span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                      Transform Your
                      <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Photos with AI
                      </span>
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed max-w-lg">
                      Upload your photos and let our advanced AI technology enhance, 
                      process, and transform them into stunning visuals in minutes.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4 max-w-lg">
                    <div className="glass-card p-4 text-center bounce-in" style={{ animationDelay: '0.2s' }}>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                          <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-sm">Lightning Fast</h3>
                      <p className="text-white/60 text-xs mt-1">Process in seconds</p>
                    </div>

                    <div className="glass-card p-4 text-center bounce-in" style={{ animationDelay: '0.4s' }}>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-sm">AI Enhanced</h3>
                      <p className="text-white/60 text-xs mt-1">Smart processing</p>
                    </div>

                    <div className="glass-card p-4 text-center bounce-in" style={{ animationDelay: '0.6s' }}>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                          <path d="M9 12L11 14L15 10M12 3L1 9L12 15L23 9L12 3Z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-sm">Secure</h3>
                      <p className="text-white/60 text-xs mt-1">GDPR compliant</p>
                    </div>

                    <div className="glass-card p-4 text-center bounce-in" style={{ animationDelay: '0.8s' }}>
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-sm">24/7 Support</h3>
                      <p className="text-white/60 text-xs mt-1">Always here</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-8 pt-4">
                    <div className="text-center">
                      <div className="stat-number text-2xl">10K+</div>
                      <div className="stat-label text-white/60">Photos Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="stat-number text-2xl">99.9%</div>
                      <div className="stat-label text-white/60">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="stat-number text-2xl">4.9★</div>
                      <div className="stat-label text-white/60">User Rating</div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Upload Form */}
                <div className="slide-up" style={{ animationDelay: '0.3s' }}>
                  <PhotoUploader onUploadSuccess={handleUploadSuccess} />
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="glass-card mx-6 mb-6 p-6 fade-in">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                  <h3 className="font-semibold text-white mb-2">How It Works</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center md:justify-start justify-center space-x-2">
                      <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                      <span>Upload your photo</span>
                    </div>
                    <div className="flex items-center md:justify-start justify-center space-x-2">
                      <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                      <span>AI processes your image</span>
                    </div>
                    <div className="flex items-center md:justify-start justify-center space-x-2">
                      <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                      <span>Receive enhanced results</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Supported Formats</h3>
                  <div className="space-y-1 text-sm text-white/70">
                    <div>📸 JPEG, JPG</div>
                    <div>🖼️ PNG with transparency</div>
                    <div>🎨 WebP format</div>
                    <div>📏 Up to 10MB per file</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Privacy & Security</h3>
                  <div className="space-y-1 text-sm text-white/70">
                    <div>🔒 End-to-end encryption</div>
                    <div>🛡️ GDPR compliant</div>
                    <div>🗑️ Auto-delete after 30 days</div>
                    <div>🚫 No data sharing</div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        .flex {
          display: flex;
        }
        .flex-col {
          flex-direction: column;
        }
        .flex-1 {
          flex: 1;
        }
        .items-center {
          align-items: center;
        }
        .justify-center {
          justify-content: center;
        }
        .justify-between {
          justify-content: space-between;
        }
        .space-x-3 > * + * {
          margin-left: 0.75rem;
        }
        .space-x-4 > * + * {
          margin-left: 1rem;
        }
        .space-x-8 > * + * {
          margin-left: 2rem;
        }
        .space-y-1 > * + * {
          margin-top: 0.25rem;
        }
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
        .space-y-8 > * + * {
          margin-top: 2rem;
        }
        .grid {
          display: grid;
        }
        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .gap-4 {
          gap: 1rem;
        }
        .gap-8 {
          gap: 2rem;
        }
        .gap-12 {
          gap: 3rem;
        }
        .max-w-6xl {
          max-width: 72rem;
        }
        .max-w-7xl {
          max-width: 80rem;
        }
        .max-w-lg {
          max-width: 32rem;
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
        .mt-1 {
          margin-top: 0.25rem;
        }
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        .mb-3 {
          margin-bottom: 0.75rem;
        }
        .mb-6 {
          margin-bottom: 1.5rem;
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
        .py-12 {
          padding-top: 3rem;
          padding-bottom: 3rem;
        }
        .pt-4 {
          padding-top: 1rem;
        }
        .w-full {
          width: 100%;
        }
        .w-6 {
          width: 1.5rem;
        }
        .w-10 {
          width: 2.5rem;
        }
        .w-12 {
          width: 3rem;
        }
        .h-6 {
          height: 1.5rem;
        }
        .h-10 {
          height: 2.5rem;
        }
        .h-12 {
          height: 3rem;
        }
        .text-xs {
          font-size: 0.75rem;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-xl {
          font-size: 1.25rem;
        }
        .text-2xl {
          font-size: 1.5rem;
        }
        .text-5xl {
          font-size: 3rem;
        }
        .font-bold {
          font-weight: 700;
        }
        .font-black {
          font-weight: 900;
        }
        .font-semibold {
          font-weight: 600;
        }
        .text-white {
          color: white;
        }
        .text-center {
          text-align: center;
        }
        .leading-tight {
          line-height: 1.25;
        }
        .leading-relaxed {
          line-height: 1.625;
        }
        .relative {
          position: relative;
        }
        .z-10 {
          z-index: 10;
        }
        .block {
          display: block;
        }
        .inline-block {
          display: inline-block;
        }
        .rounded-xl {
          border-radius: 0.75rem;
        }
        .rounded-full {
          border-radius: 9999px;
        }
        .bg-gradient-to-r {
          background-image: linear-gradient(to right, var(--tw-gradient-stops));
        }
        .from-purple-500 {
          --tw-gradient-from: #8b5cf6;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0));
        }
        .to-pink-500 {
          --tw-gradient-to: #ec4899;
        }
        .from-pink-400 {
          --tw-gradient-from: #f472b6;
        }
        .to-purple-400 {
          --tw-gradient-to: #c084fc;
        }
        .from-blue-400 {
          --tw-gradient-from: #60a5fa;
        }
        .to-cyan-400 {
          --tw-gradient-to: #22d3ee;
        }
        .from-green-400 {
          --tw-gradient-from: #4ade80;
        }
        .to-emerald-400 {
          --tw-gradient-to: #34d399;
        }
        .from-orange-400 {
          --tw-gradient-from: #fb923c;
        }
        .to-red-400 {
          --tw-gradient-to: #f87171;
        }
        .from-blue-500 {
          --tw-gradient-from: #3b82f6;
        }
        .to-cyan-500 {
          --tw-gradient-to: #06b6d4;
        }
        .from-green-500 {
          --tw-gradient-from: #22c55e;
        }
        .to-emerald-500 {
          --tw-gradient-to: #10b981;
        }
        .bg-clip-text {
          background-clip: text;
          -webkit-background-clip: text;
        }
        .text-transparent {
          color: transparent;
        }
        .text-white\/70 {
          color: rgba(255, 255, 255, 0.7);
        }
        .text-white\/80 {
          color: rgba(255, 255, 255, 0.8);
        }
        .text-white\/60 {
          color: rgba(255, 255, 255, 0.6);
        }
        
        @media (min-width: 1024px) {
          .lg\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .lg\\:text-6xl {
            font-size: 3.75rem;
          }
        }
        
        @media (min-width: 768px) {
          .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .md\\:text-left {
            text-align: left;
          }
          .md\\:justify-start {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerUploadPage;