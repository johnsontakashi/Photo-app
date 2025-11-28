export interface PhotoData {
  id: string;
  customerEmail: string;
  photoUrl: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  isVirtualFittingPhoto: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    photoUrl: string;
    status: string;
    customerEmail: string;
    createdAt: string;
  };
}