import type { NextApiRequest, NextApiResponse } from 'next';
import { StorageService } from '@/lib/storage';
import * as fs from 'fs';
import * as path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Filename is required',
      });
    }

    // Security: prevent path traversal attacks
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
      });
    }

    // Check if file exists
    if (!StorageService.fileExists(sanitizedFilename)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Get file path
    const filepath = StorageService.getFilePath(sanitizedFilename);

    // Read file
    const fileBuffer = await fs.promises.readFile(filepath);

    // Determine content type based on file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Send file
    return res.status(200).send(fileBuffer);

  } catch (error) {
    console.error('Error serving file:', error);

    if (error instanceof Error && error.message.includes('ENOENT')) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}