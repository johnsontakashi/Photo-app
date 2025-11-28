export interface PhotoData {
  id: string;
  customerEmail: string;
  photoUrl: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  isVirtualFittingPhoto?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SizeRecommendation {
  productType: string;
  recommendedSize: string;
  confidence: number;
}

export interface CustomerData {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  age?: number;
  hobbies?: string;
  occupation?: string;
  usualSize?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BodyMeasurementsData {
  customerEmail: string;
  chestWidth?: number;
  overallWidth?: number;
  sleeveWidth?: number;
  topLength?: number;
  waist?: number;
  hip?: number;
  rise?: number;
  thighWidth?: number;
  bottomLength?: number;
  createdAt: Date;
  updatedAt: Date;
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