import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Badge,
  Card,
  Image,
} from '@shopify/polaris';
import { PhotoData } from '@/types';

interface PhotoModalProps {
  photo: PhotoData | null;
  open: boolean;
  onClose: () => void;
}

const getStatusBadge = (status: PhotoData['status']) => {
  const statusConfig = {
    pending: { status: 'attention' as const, label: 'Pending' },
    processing: { status: 'info' as const, label: 'Processing' },
    done: { status: 'success' as const, label: 'Done' },
    failed: { status: 'critical' as const, label: 'Failed' },
  };
  
  const config = statusConfig[status];
  return <Badge status={config.status}>{config.label}</Badge>;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  open,
  onClose,
}) => {
  if (!photo) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Photo Details"
      primaryAction={{
        content: 'Close',
        onAction: onClose,
      }}
      large
    >
      <Modal.Section>
        <Stack vertical spacing="loose">
          {/* Photo Display */}
          <Card sectioned>
            <div style={{ 
              textAlign: 'center',
              maxHeight: '60vh',
              overflow: 'hidden',
              borderRadius: '8px',
            }}>
              <img
                src={photo.photoUrl}
                alt={`Photo from ${photo.customerEmail}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </div>
          </Card>

          {/* Photo Information */}
          <Card sectioned>
            <Stack vertical spacing="tight">
              <Stack distribution="equalSpacing" alignment="center">
                <Text variant="headingMd" as="h3">
                  Customer Information
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {photo.isVirtualFittingPhoto && (
                    <Badge status="info">Virtual Fitting</Badge>
                  )}
                  {getStatusBadge(photo.status)}
                </div>
              </Stack>

              <Stack vertical spacing="extraTight">
                <Stack distribution="fillEvenly">
                  <Stack.Item fill>
                    <Stack vertical spacing="extraTight">
                      <Text variant="bodyMd" fontWeight="semibold" as="p">
                        Email Address
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {photo.customerEmail}
                      </Text>
                    </Stack>
                  </Stack.Item>

                  <Stack.Item fill>
                    <Stack vertical spacing="extraTight">
                      <Text variant="bodyMd" fontWeight="semibold" as="p">
                        Photo ID
                      </Text>
                      <Text variant="bodyMd" as="p" color="subdued">
                        {photo.id}
                      </Text>
                    </Stack>
                  </Stack.Item>
                </Stack>

                <Stack distribution="fillEvenly">
                  <Stack.Item fill>
                    <Stack vertical spacing="extraTight">
                      <Text variant="bodyMd" fontWeight="semibold" as="p">
                        Upload Date
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {formatDate(photo.createdAt)}
                      </Text>
                    </Stack>
                  </Stack.Item>

                  <Stack.Item fill>
                    <Stack vertical spacing="extraTight">
                      <Text variant="bodyMd" fontWeight="semibold" as="p">
                        Processing Status
                      </Text>
                      <div>
                        {getStatusBadge(photo.status)}
                      </div>
                    </Stack>
                  </Stack.Item>
                </Stack>

                {photo.isVirtualFittingPhoto && (
                  <Stack>
                    <Stack.Item fill>
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#e8f5ff', 
                        borderRadius: '8px',
                        border: '1px solid #0066cc'
                      }}>
                        <Text variant="bodyMd" fontWeight="semibold" as="p" color="success">
                          ✨ Virtual Fitting Photo
                        </Text>
                        <Text variant="bodyMd" as="p" color="subdued">
                          This photo is optimized for AI-powered virtual fitting and size recommendations.
                        </Text>
                      </div>
                    </Stack.Item>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Card>

          {/* Customer Actions */}
          <Card sectioned>
            <Stack vertical spacing="tight">
              <Text variant="headingMd" as="h3">
                Customer Management
              </Text>
              <Stack vertical spacing="extraTight">
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => window.open(`/customer/profile?email=${encodeURIComponent(photo.customerEmail)}`, '_blank')}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    📋 View Customer Profile & Measurements
                  </button>
                </div>
                
                {photo.status === 'pending' && (
                  <Text variant="bodyMd" as="p">
                    This photo is pending processing. It will be automatically processed in Phase 2 of the application.
                  </Text>
                )}
                {photo.status === 'processing' && (
                  <Text variant="bodyMd" as="p">
                    This photo is currently being processed. Processing typically takes 2-5 minutes.
                  </Text>
                )}
                {photo.status === 'done' && (
                  <Text variant="bodyMd" as="p">
                    This photo has been successfully processed and the customer has been notified.
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Modal.Section>
    </Modal>
  );
};