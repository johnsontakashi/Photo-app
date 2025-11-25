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
                {getStatusBadge(photo.status)}
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
              </Stack>
            </Stack>
          </Card>

          {/* Action Information */}
          <Card sectioned>
            <Stack vertical spacing="tight">
              <Text variant="headingMd" as="h3">
                Next Steps
              </Text>
              <Stack vertical spacing="extraTight">
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