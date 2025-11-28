import { PhotoData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// In-memory storage for Phase 1 (will be replaced with database in Phase 2)
let photoMetadata: PhotoData[] = [];

// Ensure uploads directory exists
const UPLOADS_DIR = '/tmp/uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const StorageService = {
  // Save photo metadata and return the data
  savePhoto: async (
    customerEmail: string,
    filename: string,
    originalName: string,
    isVirtualFittingPhoto: boolean = false
  ): Promise<PhotoData> => {
    const id = uuidv4();
    const photoUrl = `/api/photos/serve/${filename}`;
    const createdAt = new Date().toISOString();

    const photoData: PhotoData = {
      id,
      customerEmail,
      photoUrl,
      status: 'pending',
      isVirtualFittingPhoto,
      createdAt,
    };

    photoMetadata.push(photoData);
    return photoData;
  },

  // Get all photos
  getAllPhotos: (): PhotoData[] => {
    return [...photoMetadata].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get photo by ID
  getPhotoById: (id: string): PhotoData | null => {
    return photoMetadata.find(photo => photo.id === id) || null;
  },

  // Update photo status
  updatePhotoStatus: (
    id: string, 
    status: PhotoData['status']
  ): PhotoData | null => {
    const photoIndex = photoMetadata.findIndex(photo => photo.id === id);
    if (photoIndex === -1) return null;

    photoMetadata[photoIndex].status = status;
    return photoMetadata[photoIndex];
  },

  // Save file to disk
  saveFile: async (
    buffer: Buffer, 
    originalName: string
  ): Promise<string> => {
    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    await fs.promises.writeFile(filepath, buffer);
    return filename;
  },

  // Get file path
  getFilePath: (filename: string): string => {
    return path.join(UPLOADS_DIR, filename);
  },

  // Check if file exists
  fileExists: (filename: string): boolean => {
    return fs.existsSync(path.join(UPLOADS_DIR, filename));
  },

  // Get storage stats
  getStats: () => {
    const stats = photoMetadata.reduce((acc, photo) => {
      acc[photo.status] = (acc[photo.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: photoMetadata.length,
      pending: stats.pending || 0,
      processing: stats.processing || 0,
      done: stats.done || 0,
    };
  },
};