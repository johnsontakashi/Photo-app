import type { NextApiRequest, NextApiResponse } from 'next';
import { StorageService } from '@/lib/storage';
import { PhotoData } from '@/types';

interface PhotoListResponse {
  success: boolean;
  message: string;
  photos?: PhotoData[];
  stats?: {
    total: number;
    pending: number;
    processing: number;
    done: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhotoListResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Get query parameters for filtering
    const { status, limit, offset, email } = req.query;

    // Get all photos
    let photos = StorageService.getAllPhotos();

    // Apply filters
    if (status && typeof status === 'string') {
      const statusFilter = status.toLowerCase();
      if (['pending', 'processing', 'done'].includes(statusFilter)) {
        photos = photos.filter(photo => 
          photo.status === statusFilter as PhotoData['status']
        );
      }
    }

    if (email && typeof email === 'string') {
      photos = photos.filter(photo => 
        photo.customerEmail.toLowerCase().includes(email.toLowerCase())
      );
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;
    const offsetNum = offset ? parseInt(offset as string, 10) : 0;

    if (limitNum && limitNum > 0) {
      photos = photos.slice(offsetNum, offsetNum + limitNum);
    } else if (offsetNum > 0) {
      photos = photos.slice(offsetNum);
    }

    // Get storage statistics
    const stats = StorageService.getStats();

    console.log(`Photos list requested: ${photos.length} photos returned`);

    return res.status(200).json({
      success: true,
      message: 'Photos retrieved successfully',
      photos,
      stats,
    });

  } catch (error) {
    console.error('Error fetching photos:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
}