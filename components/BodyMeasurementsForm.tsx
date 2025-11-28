import React, { useState, useEffect } from 'react';
import { BodyMeasurementsData, CreateBodyMeasurementsData } from '@/lib/db';
import { VideoModal, FloatingVideoButton } from './VideoModal';

interface BodyMeasurementsFormProps {
  customerEmail: string;
  onSave?: (measurements: CreateBodyMeasurementsData) => void;
  existingData?: BodyMeasurementsData | null;
}

export const BodyMeasurementsForm: React.FC<BodyMeasurementsFormProps> = ({
  customerEmail,
  onSave,
  existingData,
}) => {
  const [measurements, setMeasurements] = useState<CreateBodyMeasurementsData>({
    customerEmail,
    chestWidth: undefined,
    overallWidth: undefined,
    sleeveWidth: undefined,
    topLength: undefined,
    waist: undefined,
    hip: undefined,
    rise: undefined,
    thighWidth: undefined,
    bottomLength: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    content: string;
  } | null>(null);

  useEffect(() => {
    if (existingData) {
      setMeasurements({
        customerEmail: existingData.customerEmail,
        chestWidth: existingData.chestWidth || undefined,
        overallWidth: existingData.overallWidth || undefined,
        sleeveWidth: existingData.sleeveWidth || undefined,
        topLength: existingData.topLength || undefined,
        waist: existingData.waist || undefined,
        hip: existingData.hip || undefined,
        rise: existingData.rise || undefined,
        thighWidth: existingData.thighWidth || undefined,
        bottomLength: existingData.bottomLength || undefined,
      });
    }
  }, [existingData]);

  const handleMeasurementChange = (
    field: keyof CreateBodyMeasurementsData,
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setMeasurements(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/customer/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurements),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          content: 'Measurements saved successfully!',
        });
        onSave?.(measurements);
      } else {
        setMessage({
          type: 'error',
          content: result.message || 'Failed to save measurements',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'An error occurred while saving your measurements',
      });
    } finally {
      setLoading(false);
    }
  };

  const videoUrl = process.env.NEXT_PUBLIC_MEASUREMENTS_VIDEO_URL || undefined;

  return (
    <div className="measurements-form">
      <div className="measurements-header">
        <h2 className="measurements-title">Body Measurements</h2>
        <p className="measurements-subtitle">
          Enter your measurements in centimeters for accurate size recommendations
        </p>
        
        <FloatingVideoButton
          onClick={() => setShowVideoModal(true)}
          label="How to measure yourself"
          icon={
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
          }
          position="inline"
        />
      </div>

      {message && (
        <div className={`measurements-alert ${message.type === 'success' ? 'measurements-alert-success' : 'measurements-alert-error'}`}>
          <div className="measurements-alert-icon">
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
          <span>{message.content}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="measurements-form-content">
        {/* Top Measurements */}
        <div className="measurements-section">
          <h3 className="section-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="section-icon">
              <path d="M12,2A2,2 0 0,1 14,4C14,5.5 13,6.19 13,7H16V10H13V13H16V16H13C13,16.81 14,17.5 14,19A2,2 0 0,1 12,21A2,2 0 0,1 10,19C10,17.5 11,16.81 11,16H8V13H11V10H8V7H11C11,6.19 10,5.5 10,4A2,2 0 0,1 12,2Z"/>
            </svg>
            Top Measurements
          </h3>
          <p className="section-description">Measurements for shirts, blouses, jackets (in cm)</p>

          <div className="measurements-grid">
            <div className="measurement-field">
              <label className="measurement-label">
                Chest Width
                <span className="measurement-info">Armpit to armpit</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={measurements.chestWidth || ''}
                  onChange={(e) => handleMeasurementChange('chestWidth', e.target.value)}
                  className="measurement-input"
                  placeholder="50.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field">
              <label className="measurement-label">
                Overall Width
                <span className="measurement-info">Full width across</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={measurements.overallWidth || ''}
                  onChange={(e) => handleMeasurementChange('overallWidth', e.target.value)}
                  className="measurement-input"
                  placeholder="55.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field">
              <label className="measurement-label">
                Sleeve Width
                <span className="measurement-info">Shoulder to cuff</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={measurements.sleeveWidth || ''}
                  onChange={(e) => handleMeasurementChange('sleeveWidth', e.target.value)}
                  className="measurement-input"
                  placeholder="60.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field">
              <label className="measurement-label">
                Length
                <span className="measurement-info">Shoulder to hem</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="150"
                  value={measurements.topLength || ''}
                  onChange={(e) => handleMeasurementChange('topLength', e.target.value)}
                  className="measurement-input"
                  placeholder="65.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Measurements */}
        <div className="measurements-section">
          <h3 className="section-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="section-icon">
              <path d="M12,2A2,2 0 0,1 14,4C14,5.5 13,6.19 13,7H16V10H13V13H16V16H13C13,16.81 14,17.5 14,19A2,2 0 0,1 12,21A2,2 0 0,1 10,19C10,17.5 11,16.81 11,16H8V13H11V10H8V7H11C11,6.19 10,5.5 10,4A2,2 0 0,1 12,2Z"/>
            </svg>
            Bottom Measurements
          </h3>
          <p className="section-description">Measurements for pants, jeans, skirts (in cm)</p>

          <div className="measurements-grid">
            <div className="measurement-field">
              <label className="measurement-label">
                Waist
                <span className="measurement-info">Natural waistline</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={measurements.waist || ''}
                  onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                  className="measurement-input"
                  placeholder="75.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field">
              <label className="measurement-label">
                Hip
                <span className="measurement-info">Widest part of hips</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={measurements.hip || ''}
                  onChange={(e) => handleMeasurementChange('hip', e.target.value)}
                  className="measurement-input"
                  placeholder="95.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field">
              <label className="measurement-label">
                Rise
                <span className="measurement-info">Waist to crotch</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={measurements.rise || ''}
                  onChange={(e) => handleMeasurementChange('rise', e.target.value)}
                  className="measurement-input"
                  placeholder="25.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field">
              <label className="measurement-label">
                Thigh Width
                <span className="measurement-info">Widest part of thigh</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={measurements.thighWidth || ''}
                  onChange={(e) => handleMeasurementChange('thighWidth', e.target.value)}
                  className="measurement-input"
                  placeholder="30.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>

            <div className="measurement-field measurement-field-full">
              <label className="measurement-label">
                Length
                <span className="measurement-info">Waist to ankle</span>
              </label>
              <div className="measurement-input-group">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="150"
                  value={measurements.bottomLength || ''}
                  onChange={(e) => handleMeasurementChange('bottomLength', e.target.value)}
                  className="measurement-input"
                  placeholder="105.0"
                />
                <span className="measurement-unit">cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="measurements-actions">
          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
                <span>Save Measurements</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl={videoUrl}
        title="How to Measure Yourself"
        description="Follow this guide to accurately measure yourself for the best size recommendations."
      />

      <style jsx>{`
        .measurements-form {
          max-width: 700px;
          margin: 0 auto;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .measurements-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .measurements-title {
          color: white;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .measurements-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
        }

        .measurements-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .measurements-alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: rgb(16, 185, 129);
        }

        .measurements-alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
        }

        .measurements-section {
          margin-bottom: 2.5rem;
        }

        .section-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon {
          color: rgba(102, 126, 234, 0.8);
        }

        .section-description {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin: 0 0 1.5rem 0;
        }

        .measurements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .measurement-field-full {
          grid-column: 1 / -1;
          max-width: 300px;
        }

        .measurement-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .measurement-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .measurement-info {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: normal;
        }

        .measurement-input-group {
          display: flex;
          align-items: center;
          position: relative;
        }

        .measurement-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 45px 12px 16px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          flex: 1;
        }

        .measurement-input:focus {
          outline: none;
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .measurement-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .measurement-unit {
          position: absolute;
          right: 16px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-weight: 500;
          pointer-events: none;
        }

        .measurements-actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn {
          padding: 12px 32px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          text-decoration: none;
          min-width: 160px;
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .measurements-form {
            padding: 1.5rem;
          }

          .measurements-grid {
            grid-template-columns: 1fr;
          }

          .measurement-field-full {
            grid-column: 1;
          }

          .measurements-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};