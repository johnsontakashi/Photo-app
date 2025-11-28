import React, { useState, useEffect } from 'react';
import { CustomerData, CreateCustomerData } from '@/lib/db';

interface CustomerProfileFormProps {
  customerEmail: string;
  onSave?: (customerData: CreateCustomerData) => void;
  onCancel?: () => void;
  existingData?: CustomerData | null;
}

export const CustomerProfileForm: React.FC<CustomerProfileFormProps> = ({
  customerEmail,
  onSave,
  onCancel,
  existingData,
}) => {
  const [formData, setFormData] = useState<CreateCustomerData>({
    email: customerEmail,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: undefined,
    age: undefined,
    hobbies: '',
    occupation: '',
    usualSize: '',
    customFields: {},
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    content: string;
  } | null>(null);

  useEffect(() => {
    if (existingData) {
      setFormData({
        email: existingData.email,
        firstName: existingData.firstName || '',
        lastName: existingData.lastName || '',
        phoneNumber: existingData.phoneNumber || '',
        dateOfBirth: existingData.dateOfBirth || undefined,
        age: existingData.age || undefined,
        hobbies: existingData.hobbies || '',
        occupation: existingData.occupation || '',
        usualSize: existingData.usualSize || '',
        customFields: existingData.customFields || {},
      });
    }
  }, [existingData]);

  const handleInputChange = (
    field: keyof CreateCustomerData,
    value: string | number | Date
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          content: 'Profile updated successfully!',
        });
        onSave?.(formData);
      } else {
        setMessage({
          type: 'error',
          content: result.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'An error occurred while updating your profile',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-profile-form">
      <div className="profile-form-header">
        <h2 className="profile-form-title">Complete Your Profile</h2>
        <p className="profile-form-subtitle">
          Help us personalize your experience and provide better recommendations
        </p>
      </div>

      {message && (
        <div className={`profile-alert ${message.type === 'success' ? 'profile-alert-success' : 'profile-alert-error'}`}>
          <div className="profile-alert-icon">
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

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information */}
        <div className="profile-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="form-input"
                placeholder="Your first name"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="form-input"
                placeholder="Your last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="form-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Personal Profile for Style Recommendations */}
        <div className="profile-section">
          <h3 className="section-title">Style Preferences</h3>
          <p className="section-subtitle">Help us get to know you better for personalized looks</p>
          
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Age</label>
              <input
                type="number"
                min="13"
                max="120"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                className="form-input"
                placeholder="25"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Usual Clothing Size</label>
              <select
                value={formData.usualSize}
                onChange={(e) => handleInputChange('usualSize', e.target.value)}
                className="form-input form-select"
              >
                <option value="">Select your usual size</option>
                <option value="XXS">XXS</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
                <option value="varies">It varies</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="form-input"
              placeholder="Software Developer, Teacher, Student, etc."
            />
          </div>

          <div className="form-field">
            <label className="form-label">Hobbies & Interests</label>
            <textarea
              value={formData.hobbies}
              onChange={(e) => handleInputChange('hobbies', e.target.value)}
              className="form-input form-textarea"
              placeholder="Photography, hiking, reading, cooking, sports..."
              rows={3}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="profile-form-actions">
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
                <span>Save Profile</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .customer-profile-form {
          max-width: 600px;
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

        .profile-form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .profile-form-title {
          color: white;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .profile-form-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .profile-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .profile-alert-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: rgb(16, 185, 129);
        }

        .profile-alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: rgb(239, 68, 68);
        }

        .profile-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .section-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin: 0 0 1.5rem 0;
          line-height: 1.4;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .form-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          line-height: 1.5;
        }

        .form-select {
          cursor: pointer;
        }

        .form-select option {
          background: #1a1a1a;
          color: white;
        }

        .profile-form-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn {
          padding: 12px 24px;
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
          min-width: 140px;
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

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
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
          .customer-profile-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .profile-form-title {
            font-size: 1.5rem;
          }

          .profile-form-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};