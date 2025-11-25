import React, { useState, useCallback, useRef } from 'react';
import { UploadResponse } from '@/types';

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PhotoUploaderProps {
  onUploadSuccess?: (data: UploadResponse) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onUploadSuccess,
}) => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    content: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WebP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB.';
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    const error = validateFile(selectedFile);
    if (error) {
      setMessage({ type: 'error', content: error });
      return;
    }

    setFile(selectedFile);
    setMessage(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, [validateFile]);

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = useCallback(async () => {
    if (!file || !customerEmail || !gdprConsent) {
      setMessage({
        type: 'error',
        content: 'Please fill all fields and accept the privacy policy.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    simulateProgress();

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('customerEmail', customerEmail);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          content: '🎉 Your photo has been uploaded successfully! We\'ll process it and send you the results via email.',
        });
        
        // Reset form
        setTimeout(() => {
          setFile(null);
          setPreview(null);
          setCustomerEmail('');
          setGdprConsent(false);
          setUploadProgress(0);
        }, 2000);
        
        onUploadSuccess?.(result);
      } else {
        setMessage({ type: 'error', content: result.message });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'Upload failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [file, customerEmail, gdprConsent, onUploadSuccess]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="modern-form fade-in">
      {/* Enhanced Header with Icon */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24" className="drop-shadow-sm">
            <path d="M9 3L5 6.5V21h14V6.5L15 3z"/>
            <path d="M12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Upload Your Photo
        </h2>
        <p className="text-lg text-white/80 max-w-md mx-auto leading-relaxed">
          Transform your images with our <span className="text-orange-300 font-semibold">AI-powered processing</span>
        </p>
      </div>

      {/* Enhanced Message Banner */}
      {message && (
        <div 
          className={`p-5 rounded-2xl border backdrop-blur-sm transition-all duration-500 mb-8 bounce-in shadow-lg ${
            message.type === 'success' 
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100 shadow-emerald-500/20' 
              : 'bg-red-500/20 border-red-400/40 text-red-100 shadow-red-500/20'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
              {message.type === 'success' ? (
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              ) : (
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-base leading-relaxed">{message.content}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Enhanced Email Input */}
        <div className="form-group">
          <label className="block text-white font-semibold mb-3 text-lg">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
              </svg>
            </div>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-white/50 font-medium transition-all duration-300 focus:border-orange-400/60 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
              placeholder="your.email@example.com"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Enhanced File Upload Zone */}
        <div className="form-group">
          <label className="block text-white font-semibold mb-3 text-lg">
            Photo Upload
          </label>
          <div
            className={`relative border-3 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 backdrop-blur-sm ${
              isDragging 
                ? 'border-orange-400 bg-orange-500/20 shadow-2xl shadow-orange-500/30 scale-105' 
                : 'border-white/30 bg-white/5 hover:border-orange-400/60 hover:bg-white/10 hover:shadow-xl'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {preview ? (
              <div className="space-y-6 bounce-in">
                <div className="relative inline-block group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded-2xl shadow-2xl border-4 border-white/20"
                  />
                  <div className="absolute -top-3 -right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                      className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-white text-lg">{file?.name}</p>
                  <p className="text-white/70 font-medium">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                    <span className="font-semibold text-sm">Ready to upload</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <svg width="48" height="48" fill="white" viewBox="0 0 24 24" className="drop-shadow-sm">
                    {isDragging ? (
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    ) : (
                      <>
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        <path d="M12,12L15,15H13V19H11V15H9L12,12Z"/>
                      </>
                    )}
                  </svg>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    {isDragging ? '🎯 Drop your photo here!' : '📸 Choose or drag your photo'}
                  </h3>
                  <p className="text-white/70 text-lg font-medium">
                    Support for <span className="text-orange-300 font-semibold">JPG, PNG, WebP</span> • Max <span className="text-orange-300 font-semibold">10MB</span>
                  </p>
                  <div className="inline-block">
                    <button className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform">
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFileSelect(files);
          }}
          className="hidden"
        />

        {/* Enhanced Progress Bar */}
        {loading && (
          <div className="space-y-4 bounce-in">
            <div className="progress-bar h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 relative overflow-hidden"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <p className="text-center text-white/90 font-semibold text-lg">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Enhanced GDPR Consent */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <label className="flex items-start space-x-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                disabled={loading}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                gdprConsent 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-400' 
                  : 'border-white/30 bg-white/5 group-hover:border-orange-400/50'
              }`}>
                {gdprConsent && (
                  <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-white/90 group-hover:text-white transition-colors leading-relaxed">
              I consent to the processing of my personal data according to the{' '}
              <button className="text-orange-300 hover:text-orange-200 underline font-semibold transition-colors">
                privacy policy
              </button>
              {' '}and agree to receive email notifications about my photo processing.
            </span>
          </label>
        </div>

        {/* Enhanced Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || !customerEmail || !gdprConsent || loading}
          className={`w-full py-5 px-8 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl ${
            !file || !customerEmail || !gdprConsent || loading
              ? 'bg-gray-600/50 cursor-not-allowed text-white/50 shadow-none'
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-400 hover:via-red-400 hover:to-pink-400 text-white shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-4">
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing Your Photo...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
              <span>Upload & Process</span>
            </div>
          )}
        </button>

        {/* Enhanced Security Notice */}
        <div className="glass-card p-6 text-center rounded-2xl border border-white/10">
          <div className="flex items-center justify-center space-x-3 text-emerald-300 mb-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
              </svg>
            </div>
            <span className="font-bold text-lg">Secure & Private</span>
          </div>
          <p className="text-white/70 leading-relaxed">
            Your photos are <span className="text-emerald-300 font-semibold">encrypted during upload</span> and automatically deleted after processing
          </p>
        </div>
1      </div>
    </div>
  );
};