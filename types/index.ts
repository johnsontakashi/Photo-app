export interface PhotoData {
  id: string;
  customerEmail: string;
  photoUrl: string;
  status: 'pending' | 'processing' | 'done';
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: PhotoData;
}