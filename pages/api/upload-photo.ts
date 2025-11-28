import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { db, CreatePhotoData } from '@/lib/db';
import { fileService } from '@/lib/file';
import { n8nService } from '@/lib/n8n';
import { SecurityService } from '@/lib/security';
import { UploadResponse } from '@/types';

// Disable Next.js body parsing to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const validateEmail = (email: string): string | null => {
  return SecurityService.sanitizeEmail(email);
};

const validateApiSecret = (req: NextApiRequest): boolean => {
  const apiSecret = process.env.API_SECRET;
  if (!apiSecret) return true; // Skip validation if no secret is set
  
  const providedSecret = req.headers['x-api-secret'] || req.body?.apiSecret;
  return apiSecret === providedSecret;
};

const parseFormData = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: fileService.getMaxFileSize(),
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest,
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
    // Rate limiting
    const clientIP = SecurityService.getClientIP(req);
    if (!SecurityService.checkRateLimit(clientIP, 5, 60000)) { // 5 uploads per minute
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    // Validate API secret (if configured)
    if (!validateApiSecret(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Parse the multipart form data
    const { fields, files } = await parseFormData(req);

    // Extract and validate customer email
    const customerEmailRaw = Array.isArray(fields.customerEmail) 
      ? fields.customerEmail[0] 
      : fields.customerEmail;

    if (!customerEmailRaw || typeof customerEmailRaw !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required',
      });
    }

    const customerEmail = validateEmail(customerEmailRaw);
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Extract virtual fitting flag
    const isVirtualFittingPhotoRaw = Array.isArray(fields.isVirtualFittingPhoto) 
      ? fields.isVirtualFittingPhoto[0] 
      : fields.isVirtualFittingPhoto;
    
    const isVirtualFittingPhoto = isVirtualFittingPhotoRaw === 'true';

    // Extract and validate file
    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

    if (!photoFile) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required',
      });
    }

    // Validate file using our service
    const validation = fileService.validateFile({
      size: photoFile.size,
      mimetype: photoFile.mimetype || undefined,
      originalFilename: photoFile.originalFilename || undefined,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error || 'Invalid file',
      });
    }

    // Additional security: validate file signature
    if (photoFile.mimetype) {
      const fs = await import('fs');
      const fileBuffer = await fs.promises.readFile(photoFile.filepath);
      
      if (!SecurityService.validateFileSignature(fileBuffer, photoFile.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'File type does not match content. Security check failed.',
        });
      }
    }

    // Save file to disk
    const savedFile = await fileService.saveFile({
      filepath: photoFile.filepath,
      originalFilename: photoFile.originalFilename || undefined,
      mimetype: photoFile.mimetype || undefined,
      size: photoFile.size,
    });

    // Create database record
    const photoData: CreatePhotoData = {
      customerEmail,
      photoUrl: savedFile.url,
      originalName: photoFile.originalFilename || undefined,
      fileSize: photoFile.size,
      mimeType: photoFile.mimetype || undefined,
      isVirtualFittingPhoto,
    };

    const savedPhoto = await db.createPhotoRecord(photoData);

    console.log(`Photo uploaded: ${savedPhoto.id} by ${customerEmail}`);

    // Send webhook to n8n (non-blocking)
    n8nService.sendWebhook(savedPhoto).catch(error => {
      console.error('Webhook failed (non-blocking):', error);
    });

    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        id: savedPhoto.id,
        photoUrl: savedPhoto.photoUrl,
        status: savedPhoto.status.toLowerCase(),
        customerEmail: savedPhoto.customerEmail,
        createdAt: savedPhoto.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof Error) {
      // Handle specific formidable errors
      if (error.message.includes('maxFileSize')) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${fileService.getMaxFileSize() / 1024 / 1024}MB`,
        });
      }

      if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
}