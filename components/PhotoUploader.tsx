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
    <div className="modern-form space-y-6 fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Upload Your Photo</h2>
        <p className="text-white/70">
          Transform your images with our AI-powered processing
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div 
          className={`p-4 rounded-lg border backdrop-blur-sm transition-all bounce-in ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-400/30 text-green-100' 
              : 'bg-red-500/20 border-red-400/30 text-red-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            <p className="font-medium">{message.content}</p>
          </div>
        </div>
      )}

      {/* Email Input */}
      <div className="form-group">
        <label className="form-label text-white">Email Address</label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="form-input"
          placeholder="your.email@example.com"
          disabled={loading}
          required
        />
      </div>

      {/* File Upload Zone */}
      <div className="form-group">
        <label className="form-label text-white">Photo Upload</label>
        <div
          className={`upload-zone p-8 text-center cursor-pointer transition-all ${
            isDragging ? 'dragging' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {preview ? (
            <div className="space-y-4 bounce-in">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg shadow-lg"
                />
                <div className="absolute -top-2 -right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">{file?.name}</p>
                <p className="text-sm text-white/70">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  <path d="M12,12L15,15H13V19H11V15H9L12,12Z"/>
                </svg>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {isDragging ? '🎯 Drop your photo here!' : '📸 Choose or drag your photo'}
                </h3>
                <p className="text-white/70">
                  Support for JPG, PNG, WebP • Max 10MB
                </p>
                <div className="inline-block">
                  <button className="gradient-button success text-sm px-6">
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

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-center text-white/70 text-sm">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* GDPR Consent */}
      <div className="form-group">
        <label className="flex items-start space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            disabled={loading}
            className="w-5 h-5 mt-0.5 rounded border-2 border-white/30 bg-white/10 checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
          />
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
            I consent to the processing of my personal data according to the{' '}
            <span className="text-pink-300 hover:text-pink-200 underline">
              privacy policy
            </span>
            {' '}and agree to receive email notifications about my photo processing.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          onClick={handleSubmit}
          disabled={!file || !customerEmail || !gdprConsent || loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
            !file || !customerEmail || !gdprConsent || loading
              ? 'bg-gray-500/50 cursor-not-allowed'
              : 'gradient-button hover:transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="loading-spinner" />
              <span>Processing Your Photo...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🚀 Upload & Process</span>
            </div>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="glass-card p-4 text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 text-green-300">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
          </svg>
          <span className="text-sm font-medium">Secure & Private</span>
        </div>
        <p className="text-xs text-white/60">
          Your photos are encrypted during upload and automatically deleted after processing
        </p>
      </div>

      <style jsx>{`
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        .space-y-4 > * + * {
          margin-top: 1rem;
        }
        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
        .space-x-2 > * + * {
          margin-left: 0.5rem;
        }
        .space-x-3 > * + * {
          margin-left: 0.75rem;
        }
        .text-center {
          text-align: center;
        }
        .text-2xl {
          font-size: 1.5rem;
        }
        .text-xl {
          font-size: 1.25rem;
        }
        .text-lg {
          font-size: 1.125rem;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-xs {
          font-size: 0.75rem;
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
        .text-white\\/70 {
          color: rgba(255, 255, 255, 0.7);
        }
        .text-white\\/80 {
          color: rgba(255, 255, 255, 0.8);
        }
        .text-white\\/60 {
          color: rgba(255, 255, 255, 0.6);
        }
        .text-green-100 {
          color: #dcfce7;
        }
        .text-green-300 {
          color: #86efac;
        }
        .text-red-100 {
          color: #fee2e2;
        }
        .text-pink-300 {
          color: #f9a8d4;
        }
        .text-pink-200 {
          color: #fbcfe8;
        }
        .p-4 {
          padding: 1rem;
        }
        .p-8 {
          padding: 2rem;
        }
        .py-4 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        .px-6 {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .pt-2 {
          padding-top: 0.5rem;
        }
        .mt-0\\.5 {
          margin-top: 0.125rem;
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
        .border-2 {
          border-width: 2px;
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        .transition-colors {
          transition: color 0.3s ease-in-out;
        }
        .duration-300 {
          transition-duration: 300ms;
        }
        .bg-green-500\\/20 {
          background-color: rgba(34, 197, 94, 0.2);
        }
        .bg-red-500\\/20 {
          background-color: rgba(239, 68, 68, 0.2);
        }
        .bg-red-500 {
          background-color: #ef4444;
        }
        .bg-red-600 {
          background-color: #dc2626;
        }
        .bg-gray-500\\/50 {
          background-color: rgba(107, 114, 128, 0.5);
        }
        .bg-white\\/10 {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .border-green-400\\/30 {
          border-color: rgba(74, 222, 128, 0.3);
        }
        .border-red-400\\/30 {
          border-color: rgba(248, 113, 113, 0.3);
        }
        .border-white\\/30 {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .w-5 {
          width: 1.25rem;
        }
        .w-8 {
          width: 2rem;
        }
        .w-20 {
          width: 5rem;
        }
        .w-full {
          width: 100%;
        }
        .h-5 {
          height: 1.25rem;
        }
        .h-8 {
          height: 2rem;
        }
        .h-20 {
          height: 5rem;
        }
        .max-w-full {
          max-width: 100%;
        }
        .max-h-48 {
          max-height: 12rem;
        }
        .flex {
          display: flex;
        }
        .inline-block {
          display: inline-block;
        }
        .items-center {
          align-items: center;
        }
        .items-start {
          align-items: flex-start;
        }
        .justify-center {
          justify-content: center;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .relative {
          position: relative;
        }
        .absolute {
          position: absolute;
        }
        .-top-2 {
          top: -0.5rem;
        }
        .-right-2 {
          right: -0.5rem;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .cursor-not-allowed {
          cursor: not-allowed;
        }
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .underline {
          text-decoration: underline;
        }
        .hidden {
          display: none;
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
        .hover\\:bg-red-600:hover {
          background-color: #dc2626;
        }
        .hover\\:text-white:hover {
          color: white;
        }
        .hover\\:text-pink-200:hover {
          color: #fbcfe8;
        }
        .hover\\:transform:hover {
          transform: var(--tw-transform);
        }
        .hover\\:scale-105:hover {
          --tw-scale-x: 1.05;
          --tw-scale-y: 1.05;
          transform: scale(1.05);
        }
        .focus\\:ring-2:focus {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
        }
        .checked\\:bg-gradient-to-r:checked {
          background-image: linear-gradient(to right, #8b5cf6, #ec4899);
        }
        .group:hover .group-hover\\:text-white {
          color: white;
        }
      `}</style>
    </div>
  );
};