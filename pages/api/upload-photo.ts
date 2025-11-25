import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { StorageService } from '@/lib/storage';
import { UploadResponse } from '@/types';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP files are allowed.'));
    }
  },
});

// Disable Next.js body parsing to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple CSRF token generation/validation
const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Promisify multer middleware
const runMiddleware = (
  req: NextApiRequest & { file?: Express.Multer.File }, 
  res: NextApiResponse, 
  fn: Function
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(
  req: NextApiRequest & { file?: Express.Multer.File },
  res: NextApiResponse<UploadResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Parse the multipart form data
    await runMiddleware(req, res, upload.single('photo'));

    // Validate required fields
    const { customerEmail } = req.body;

    if (!customerEmail || typeof customerEmail !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required',
      });
    }

    if (!validateEmail(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required',
      });
    }

    // Additional file validation
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 10MB',
      });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, and WebP files are allowed.',
      });
    }

    // Save the file to disk
    const filename = await StorageService.saveFile(
      req.file.buffer, 
      req.file.originalname
    );

    // Save metadata
    const photoData = await StorageService.savePhoto(
      customerEmail,
      filename,
      req.file.originalname
    );

    console.log(`Photo uploaded: ${photoData.id} by ${customerEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: photoData,
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size must be less than 10MB',
        });
      }
    }

    if (error instanceof Error && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
}