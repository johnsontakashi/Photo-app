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
    <div className="photo-uploader-container">
      {/* Clean Header */}
      <div className="uploader-header">
        <div className="header-icon">
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M12,12L15,15H13V19H11V15H9L12,12Z"/>
          </svg>
        </div>
        <h1 className="header-title">Upload Your Photo</h1>
        <p className="header-subtitle">
          Transform your images with AI-powered processing
        </p>
      </div>

      {/* Clean Message Banner */}
      {message && (
        <div className={`message-banner ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
          <div className="message-icon">
            {message.type === 'success' ? (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
              </svg>
            ) : (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
              </svg>
            )}
          </div>
          <p className="message-text">{message.content}</p>
        </div>
      )}

      <div className="uploader-form">
        {/* Clean Email Input */}
        <div className="form-section">
          <label className="form-label">
            Email Address
          </label>
          <div className="input-wrapper">
            <div className="input-icon">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
              </svg>
            </div>
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
        </div>

        {/* Clean File Upload Zone */}
        <div className="form-section">
          <label className="form-label">
            Photo Upload
          </label>
          <div
            className={`upload-zone ${isDragging ? 'upload-zone-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {preview ? (
              <div className="upload-preview">
                <div className="preview-image-container">
                  <img
                    src={preview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="preview-remove-btn"
                    aria-label="Remove image"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                    </svg>
                  </button>
                </div>
                <div className="preview-info">
                  <p className="preview-filename">{file?.name}</p>
                  <p className="preview-filesize">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                  <div className="preview-status">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                    </svg>
                    <span>Ready to upload</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="upload-empty">
                <div className="upload-icon">
                  <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
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
                
                <div className="upload-text">
                  <h3 className="upload-title">
                    {isDragging ? 'Drop your photo here!' : 'Choose or drag your photo'}
                  </h3>
                  <p className="upload-subtitle">
                    JPG, PNG, WebP • Max 10MB
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

        {/* Clean Progress Bar */}
        {loading && (
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="progress-text">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Clean GDPR Consent */}
        <div className="consent-section">
          <label className="consent-wrapper">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              disabled={loading}
              className="consent-checkbox"
            />
            <div className="consent-checkmark">
              {gdprConsent && (
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              )}
            </div>
            <span className="consent-text">
              I consent to the processing of my personal data according to the{' '}
              <button className="consent-link">
                privacy policy
              </button>
              {' '}and agree to receive email notifications about my photo processing.
            </span>
          </label>
        </div>

        {/* Clean Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || !customerEmail || !gdprConsent || loading}
          className={`submit-button ${(!file || !customerEmail || !gdprConsent || loading) ? 'submit-button-disabled' : 'submit-button-enabled'}`}
        >
          {loading ? (
            <div className="submit-loading">
              <div className="submit-spinner"></div>
              <span>Processing Your Photo...</span>
            </div>
          ) : (
            <div className="submit-content">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
              <span>Upload & Process</span>
            </div>
          )}
        </button>

        {/* Feature Highlights */}
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon feature-icon-speed">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,13L8,8L7,9L13,15L21,7L20,6L13,13Z"/>
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20Z"/>
              </svg>
            </div>
            <h5 className="feature-title">Lightning Fast</h5>
            <p className="feature-text">Instant processing</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon feature-icon-ai">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z"/>
              </svg>
            </div>
            <h5 className="feature-title">AI Enhanced</h5>
            <p className="feature-text">Smart optimization</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon feature-icon-security">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
              </svg>
            </div>
            <h5 className="feature-title">Secure & Private</h5>
            <p className="feature-text">Encrypted uploads</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon feature-icon-support">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
              </svg>
            </div>
            <h5 className="feature-title">24/7 Support</h5>
            <p className="feature-text">Always available</p>
          </div>
        </div>
1      </div>
    </div>
  );
};