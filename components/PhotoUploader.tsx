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
    <div className="pro-uploader-container">
      {/* Professional Header */}
      <div className="pro-header">
        <div className="pro-icon">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M12,12L15,15H13V19H11V15H9L12,12Z"/>
          </svg>
        </div>
        <h1 className="pro-title">Upload Your Photo</h1>
        <p className="pro-subtitle">
          Transform your images with professional AI-powered processing
        </p>
      </div>

      {/* Professional Message Banner */}
      {message && (
        <div className={`pro-alert ${message.type === 'success' ? 'pro-alert-success' : 'pro-alert-error'}`}>
          <div className="pro-alert-icon">
            {message.type === 'success' ? (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
              </svg>
            ) : (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
              </svg>
            )}
          </div>
          <div className="pro-alert-content">
            <p className="pro-alert-text">{message.content}</p>
          </div>
        </div>
      )}

      <div className="pro-form">
        {/* Professional Email Input */}
        <div className="pro-field">
          <label className="pro-label">
            Email Address
            <span className="pro-required">*</span>
          </label>
          <div className="pro-input-group">
            <div className="pro-input-icon">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
              </svg>
            </div>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="pro-input"
              placeholder="your.email@example.com"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Professional Upload Card */}
        <div className="pro-field">
          <label className="pro-label">
            Photo Upload
            <span className="pro-required">*</span>
          </label>
          <div
            className={`pro-upload-card ${isDragging ? 'pro-upload-dragging' : ''} ${preview ? 'pro-upload-has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {preview ? (
              <div className="pro-preview">
                <div className="pro-preview-image">
                  <img
                    src={preview}
                    alt="Preview"
                    className="pro-image"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="pro-remove-btn"
                    aria-label="Remove image"
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                    </svg>
                  </button>
                </div>
                <div className="pro-preview-info">
                  <h4 className="pro-filename">{file?.name}</h4>
                  <p className="pro-filesize">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} • Ready to upload
                  </p>
                </div>
              </div>
            ) : (
              <div className="pro-upload-empty">
                <div className="pro-upload-icon">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                    {isDragging ? (
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    ) : (
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z M12,12L15,15H13V19H11V15H9L12,12Z"/>
                    )}
                  </svg>
                </div>
                <div className="pro-upload-content">
                  <h3 className="pro-upload-title">
                    {isDragging ? 'Drop your photo here' : 'Click to upload or drag and drop'}
                  </h3>
                  <p className="pro-upload-subtitle">
                    JPEG, PNG, or WebP (max 10MB)
                  </p>
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

        {/* Professional Progress Bar */}
        {loading && (
          <div className="pro-progress">
            <div className="pro-progress-header">
              <span className="pro-progress-label">Uploading your photo</span>
              <span className="pro-progress-percent">{uploadProgress}%</span>
            </div>
            <div className="pro-progress-bar">
              <div 
                className="pro-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Professional Consent */}
        <div className="pro-consent">
          <label className="pro-checkbox-group">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              disabled={loading}
              className="pro-checkbox-input"
            />
            <div className="pro-checkbox">
              {gdprConsent && (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              )}
            </div>
            <div className="pro-consent-content">
              <span className="pro-consent-text">
                I agree to the{' '}
                <button type="button" className="pro-link">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="pro-link">
                  Privacy Policy
                </button>
                , and consent to email notifications about my photo processing.
              </span>
            </div>
          </label>
        </div>

        {/* Professional CTA Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || !customerEmail || !gdprConsent || loading}
          className={`pro-button ${(!file || !customerEmail || !gdprConsent || loading) ? 'pro-button-disabled' : 'pro-button-primary'}`}
        >
          {loading ? (
            <div className="pro-button-content">
              <div className="pro-spinner"></div>
              <span>Processing Your Photo...</span>
            </div>
          ) : (
            <div className="pro-button-content">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
              <span>Upload & Process Photo</span>
            </div>
          )}
        </button>
1      </div>
    </div>
  );
};