import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

const RegisterPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Auth
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Profile Info
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    
    // Step 3: Style Preferences
    age: '',
    occupation: '',
    hobbies: '',
    usualSize: '',
  });

  useEffect(() => {
    setMounted(true);
    
    // Check if already authenticated
    const isAuthenticated = localStorage.getItem('userAuthenticated');
    if (isAuthenticated === 'true') {
      router.replace('/');
    }
  }, [router]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          return 'Please fill in all required fields';
        }
        if (formData.password !== formData.confirmPassword) {
          return 'Passwords do not match';
        }
        if (formData.password.length < 6) {
          return 'Password must be at least 6 characters';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          return 'Please enter a valid email address';
        }
        return null;
      case 2:
        if (!formData.firstName || !formData.lastName) {
          return 'First name and last name are required';
        }
        return null;
      case 3:
        // Style preferences are optional
        return null;
      default:
        return null;
    }
  };

  const handleNextStep = () => {
    const validation = validateStep(currentStep);
    if (validation) {
      setError(validation);
      return;
    }
    
    setError('');
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    const validation = validateStep(3);
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store authentication
        localStorage.setItem('userAuthenticated', 'true');
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('customerEmail', formData.email);
        
        // Redirect to main app
        router.replace('/');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Register - PhotoAI Pro</title>
        <meta name="description" content="Create your PhotoAI Pro account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg mx-auto">
          {/* Clean Header */}
          <div className="text-center mb-8 fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
              <svg width="32" height="32" fill="#3b82f6" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
              </svg>
            </div>
            <h1 className="heading-2 mb-2">Create your account</h1>
            <p className="text-secondary">Join PhotoAI Pro and transform your photos</p>
          </div>

          {/* Clean Registration Card */}
          <div className="card">

            {/* Progress Steps */}
            <div className="progress-steps mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`step ${currentStep >= step ? 'active' : ''}`}>
                      <div className="step-number">
                        {currentStep > step ? (
                          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      <div className="step-label">
                        {step === 1 && 'Account'}
                        {step === 2 && 'Profile'}
                        {step === 3 && 'Preferences'}
                      </div>
                    </div>
                    {step < 3 && <div className={`step-line ${currentStep > step ? 'active' : ''}`}></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-danger text-small font-medium">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <div className="space-y-6">
              {/* Step 1: Account Setup */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Account Information</h3>
                  
                  <div>
                    <label htmlFor="email" className="block text-primary font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="input w-full"
                      placeholder="your.email@example.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-primary font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className="input w-full"
                      placeholder="Create a strong password"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-primary font-medium mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className="input w-full"
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Profile Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-primary font-medium mb-2">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className="input w-full"
                        placeholder="John"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-primary font-medium mb-2">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className="input w-full"
                        placeholder="Doe"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-primary font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                      className="input w-full"
                      placeholder="+1 (555) 123-4567"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-primary font-medium mb-2">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      className="input w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Style Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Style Preferences</h3>
                  <p className="text-secondary text-small mb-6">Help us provide better AI recommendations (optional)</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="block text-primary font-medium mb-2">Age</label>
                      <input
                        type="number"
                        id="age"
                        value={formData.age}
                        onChange={(e) => updateFormData('age', e.target.value)}
                        className="input w-full"
                        placeholder="25"
                        min="18"
                        max="100"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="usualSize" className="block text-primary font-medium mb-2">Usual Size</label>
                      <select
                        id="usualSize"
                        value={formData.usualSize}
                        onChange={(e) => updateFormData('usualSize', e.target.value)}
                        className="input w-full"
                        disabled={loading}
                      >
                        <option value="">Select size</option>
                        <option value="XXS">XXS</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="occupation" className="block text-primary font-medium mb-2">Occupation</label>
                    <input
                      type="text"
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => updateFormData('occupation', e.target.value)}
                      className="input w-full"
                      placeholder="Software Engineer, Teacher, etc."
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="hobbies" className="block text-primary font-medium mb-2">Hobbies & Interests</label>
                    <textarea
                      id="hobbies"
                      value={formData.hobbies}
                      onChange={(e) => updateFormData('hobbies', e.target.value)}
                      className="input w-full"
                      rows={3}
                      placeholder="Sports, reading, music, travel, etc."
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1 || loading}
                  className="btn btn-outline"
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="loading-spinner" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-secondary mb-4">
                  Already have an account?
                </p>
                <Link href="/auth/login" className="btn btn-outline w-full">
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
          background: linear-gradient(135deg, 
            rgba(102, 126, 234, 0.1) 0%, 
            rgba(118, 75, 162, 0.1) 100%);
        }

        .progress-steps {
          width: 100%;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .step-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .step.active .step-label {
          color: #1e293b;
        }

        .step-line {
          height: 2px;
          flex: 1;
          background: #e2e8f0;
          margin: 0 1rem;
          transition: all 0.3s ease;
        }

        .step-line.active {
          background: #3b82f6;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .step-number {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }
          
          .step-label {
            font-size: 0.75rem;
          }
          
          .grid-cols-2 {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default RegisterPage;