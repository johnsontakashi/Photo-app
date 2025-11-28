import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { CustomerProfileForm } from '@/components/CustomerProfileForm';
import { BodyMeasurementsForm } from '@/components/BodyMeasurementsForm';
import { useRouter } from 'next/router';

const CustomerProfilePage: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'measurements' | 'recommendations'>('profile');
  const [customerData, setCustomerData] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get email from URL params or localStorage
    const email = router.query.email as string || localStorage.getItem('customerEmail') || '';
    setCustomerEmail(email);
    
    // Set active tab from URL params
    const tab = router.query.tab as string;
    if (tab === 'measurements' || tab === 'recommendations') {
      setActiveTab(tab);
    }
    
    if (email) {
      fetchCustomerData(email);
    }
  }, [router.query.email, router.query.tab]);

  const fetchCustomerData = async (email: string) => {
    setLoading(true);
    try {
      // Fetch customer profile
      const profileResponse = await fetch(`/api/customer/profile?email=${encodeURIComponent(email)}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setCustomerData(profileData.data);
        }
      }

      // Fetch measurements
      const measurementsResponse = await fetch(`/api/customer/measurements?customerEmail=${encodeURIComponent(email)}`);
      if (measurementsResponse.ok) {
        const measurementsResult = await measurementsResponse.json();
        if (measurementsResult.success) {
          setMeasurementsData(measurementsResult.data);
        }
      }

      // Fetch recommendations
      const recommendationsResponse = await fetch(`/api/size-recommendations?customerEmail=${encodeURIComponent(email)}&history=true`);
      if (recommendationsResponse.ok) {
        const recommendationsResult = await recommendationsResponse.json();
        if (recommendationsResult.success) {
          setRecommendations(recommendationsResult.data);
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!customerEmail) {
    return (
      <>
        <Head>
          <title>Customer Profile - PhotoAI Pro</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="heading-2 text-white mb-lg">Customer Profile</h1>
            <p className="text-secondary mb-xl">Please provide your email address to access your profile</p>
            <div className="max-w-md mx-auto">
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="form-input w-full mb-lg"
              />
              <button
                onClick={() => {
                  if (customerEmail) {
                    localStorage.setItem('customerEmail', customerEmail);
                    fetchCustomerData(customerEmail);
                  }
                }}
                className="btn btn-primary w-full"
              >
                Access Profile
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Customer Profile - PhotoAI Pro</title>
        <meta name="description" content="Manage your profile, measurements, and size recommendations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-layout">
        {/* Header */}
        <header className="page-header">
          <div className="container">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-lg">
                <div className="flex items-center gap-md">
                  <img 
                    src="/logos/photoai-icon.svg" 
                    alt="PhotoAI Pro" 
                    width="40" 
                    height="40" 
                    style={{ height: 'auto' }}
                  />
                  <div>
                    <div className="heading-6 text-primary">PhotoAI Pro</div>
                    <div className="text-xs text-muted font-medium">Customer Profile</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-md">
                <button 
                  onClick={() => router.push('/')}
                  className="btn btn-secondary btn-sm"
                >
                  Upload Photos
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="page-main">
          <div className="container max-w-4xl mx-auto">
            
            {/* Profile Header */}
            <div className="text-center mb-4xl">
              <h1 className="heading-2 text-primary mb-md">Your Profile</h1>
              <p className="text-secondary text-lg">{customerEmail}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-tabs mb-4xl">
              <div className="tab-list">
                <button
                  className={`tab-button ${activeTab === 'profile' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                  </svg>
                  Profile
                </button>
                
                <button
                  className={`tab-button ${activeTab === 'measurements' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('measurements')}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A2,2 0 0,1 14,4C14,5.5 13,6.19 13,7H16V10H13V13H16V16H13C13,16.81 14,17.5 14,19A2,2 0 0,1 12,21A2,2 0 0,1 10,19C10,17.5 11,16.81 11,16H8V13H11V10H8V7H11C11,6.19 10,5.5 10,4A2,2 0 0,1 12,2Z"/>
                  </svg>
                  Measurements
                </button>
                
                <button
                  className={`tab-button ${activeTab === 'recommendations' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('recommendations')}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                  Size Recommendations
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'profile' && (
                <CustomerProfileForm
                  customerEmail={customerEmail}
                  existingData={customerData}
                  onSave={(data) => {
                    setCustomerData(data);
                    fetchCustomerData(customerEmail);
                  }}
                />
              )}

              {activeTab === 'measurements' && (
                <BodyMeasurementsForm
                  customerEmail={customerEmail}
                  existingData={measurementsData}
                  onSave={(data) => {
                    setMeasurementsData(data);
                    fetchCustomerData(customerEmail);
                  }}
                />
              )}

              {activeTab === 'recommendations' && (
                <div className="recommendations-section">
                  <div className="recommendations-header">
                    <h2 className="recommendations-title">Size Recommendations</h2>
                    <p className="recommendations-subtitle">
                      Get AI-powered size recommendations based on your measurements
                    </p>
                  </div>

                  {!measurementsData ? (
                    <div className="recommendations-empty">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl flex items-center justify-center mx-auto mb-xl">
                        <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                          <path d="M12,2A2,2 0 0,1 14,4C14,5.5 13,6.19 13,7H16V10H13V13H16V16H13C13,16.81 14,17.5 14,19A2,2 0 0,1 12,21A2,2 0 0,1 10,19C10,17.5 11,16.81 11,16H8V13H11V10H8V7H11C11,6.19 10,5.5 10,4A2,2 0 0,1 12,2Z"/>
                        </svg>
                      </div>
                      <h3 className="heading-3 text-primary mb-md">Measurements Required</h3>
                      <p className="text-secondary mb-xl max-w-md mx-auto leading-relaxed">
                        To get personalized size recommendations, please add your body measurements first.
                      </p>
                      <button 
                        onClick={() => setActiveTab('measurements')}
                        className="btn btn-primary"
                      >
                        Add Measurements
                      </button>
                    </div>
                  ) : (
                    <div className="recommendations-content">
                      {recommendations.length === 0 ? (
                        <div className="text-center py-xl">
                          <p className="text-secondary">No size recommendations yet. Upload photos to get started!</p>
                        </div>
                      ) : (
                        <div className="recommendations-list">
                          {recommendations.map((recommendation, index) => (
                            <div key={index} className="recommendation-card">
                              <div className="recommendation-header">
                                <h4 className="recommendation-type">{recommendation.productType}</h4>
                                <div className="recommendation-size">{recommendation.recommendedSize}</div>
                              </div>
                              <p className="recommendation-confidence">
                                {Math.round(recommendation.confidence * 100)}% confidence
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .profile-tabs {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-list {
          display: flex;
          gap: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .tab-button {
          flex: 1;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-bottom: 2px solid transparent;
        }

        .tab-button:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-active {
          color: white !important;
          border-bottom-color: #667eea !important;
          background: rgba(102, 126, 234, 0.1) !important;
        }

        .recommendations-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .recommendations-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .recommendations-title {
          color: white;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .recommendations-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .recommendations-empty {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(20px);
        }

        .recommendations-list {
          display: grid;
          gap: 1rem;
        }

        .recommendation-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .recommendation-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .recommendation-type {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          text-transform: capitalize;
        }

        .recommendation-size {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .recommendation-confidence {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          margin: 0;
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
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
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

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .tab-list {
            flex-direction: column;
          }

          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerProfilePage;