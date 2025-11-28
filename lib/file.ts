import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface SaveFileResult {
  filename: string
  filepath: string
  url: string
  size: number
}

export class FileService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]

  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  private readonly maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads'

  async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
    }
  }

  validateFile(file: { size: number; mimetype?: string; originalFilename?: string }): FileValidationResult {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`
      }
    }

    // Check mime type
    if (file.mimetype && !this.allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      }
    }

    // Check file extension
    if (file.originalFilename) {
      const ext = path.extname(file.originalFilename).toLowerCase()
      if (!this.allowedExtensions.includes(ext)) {
        return {
          isValid: false,
          error: `File extension ${ext} is not allowed. Allowed extensions: ${this.allowedExtensions.join(', ')}`
        }
      }
    }

    return { isValid: true }
  }

  async saveFile(file: {
    filepath: string
    originalFilename?: string
    mimetype?: string
    size: number
  }): Promise<SaveFileResult> {
    await this.ensureUploadDir()

    // Generate unique filename
    const ext = file.originalFilename 
      ? path.extname(file.originalFilename).toLowerCase() 
      : this.getExtensionFromMimeType(file.mimetype || '')

    const filename = `${uuidv4()}${ext}`
    const targetPath = path.join(this.uploadDir, filename)

    try {
      // Move file to uploads directory
      await fs.copyFile(file.filepath, targetPath)
      
      // Clean up temporary file
      try {
        await fs.unlink(file.filepath)
      } catch (error) {
        console.warn('Failed to delete temporary file:', error)
      }

      return {
        filename,
        filepath: targetPath,
        url: `/api/photos/serve/${filename}`,
        size: file.size
      }
    } catch (error) {
      console.error('Error saving file:', error)
      throw new Error('Failed to save file')
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType.toLowerCase()) {
      case 'image/jpeg':
      case 'image/jpg':
        return '.jpg'
      case 'image/png':
        return '.png'
      case 'image/webp':
        return '.webp'
      default:
        return '.jpg'
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filepath = path.join(this.uploadDir, filename)
      await fs.unlink(filepath)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  async getFileStats(filename: string): Promise<{ size: number; exists: boolean }> {
    try {
      const filepath = path.join(this.uploadDir, filename)
      const stats = await fs.stat(filepath)
      return { size: stats.size, exists: true }
    } catch {
      return { size: 0, exists: false }
    }
  }

  sanitizeFilename(filename: string): string {
    // Remove path traversal attempts and dangerous characters
    return path.basename(filename)
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.+/g, '.')
      .substring(0, 255)
  }

  getUploadPath(): string {
    return this.uploadDir
  }

  getMaxFileSize(): number {
    return this.maxFileSize
  }

  getAllowedMimeTypes(): string[] {
    return [...this.allowedMimeTypes]
  }
}

// Export singleton instance
export const fileService = new FileService()