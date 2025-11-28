import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export type PhotoData = {
  id: string
  customerEmail: string
  photoUrl: string
  originalName?: string | null
  fileSize?: number | null
  mimeType?: string | null
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  n8nWebhookSent: boolean
  n8nRetries: number
  createdAt: Date
  updatedAt: Date
}

export type CreatePhotoData = {
  customerEmail: string
  photoUrl: string
  originalName?: string
  fileSize?: number
  mimeType?: string
}

export type UpdatePhotoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export class DatabaseService {
  async createPhotoRecord(data: CreatePhotoData): Promise<PhotoData> {
    try {
      const photo = await prisma.photo.create({
        data: {
          customerEmail: data.customerEmail,
          photoUrl: data.photoUrl,
          originalName: data.originalName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          status: 'PENDING',
          n8nWebhookSent: false,
          n8nRetries: 0,
        },
      })

      return photo as PhotoData
    } catch (error) {
      console.error('Failed to create photo record:', error)
      throw new Error('Database operation failed')
    }
  }

  async getAllPhotos(limit?: number): Promise<PhotoData[]> {
    try {
      const photos = await prisma.photo.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return photos as PhotoData[]
    } catch (error) {
      console.error('Failed to get photos:', error)
      throw new Error('Database operation failed')
    }
  }

  async getPhotoById(id: string): Promise<PhotoData | null> {
    try {
      const photo = await prisma.photo.findUnique({
        where: { id },
      })

      return photo as PhotoData | null
    } catch (error) {
      console.error('Failed to get photo by id:', error)
      throw new Error('Database operation failed')
    }
  }

  async updatePhotoStatus(id: string, status: UpdatePhotoStatus): Promise<PhotoData> {
    try {
      const photo = await prisma.photo.update({
        where: { id },
        data: { 
          status,
          updatedAt: new Date(),
        },
      })

      return photo as PhotoData
    } catch (error) {
      console.error('Failed to update photo status:', error)
      throw new Error('Database operation failed')
    }
  }

  async updateWebhookStatus(id: string, sent: boolean, retries?: number): Promise<PhotoData> {
    try {
      const updateData: any = {
        n8nWebhookSent: sent,
        updatedAt: new Date(),
      }

      if (retries !== undefined) {
        updateData.n8nRetries = retries
      }

      const photo = await prisma.photo.update({
        where: { id },
        data: updateData,
      })

      return photo as PhotoData
    } catch (error) {
      console.error('Failed to update webhook status:', error)
      throw new Error('Database operation failed')
    }
  }

  async getPhotosByStatus(status: UpdatePhotoStatus): Promise<PhotoData[]> {
    try {
      const photos = await prisma.photo.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
      })

      return photos as PhotoData[]
    } catch (error) {
      console.error('Failed to get photos by status:', error)
      throw new Error('Database operation failed')
    }
  }

  async getStats(): Promise<{
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    try {
      const [total, pending, processing, completed, failed] = await Promise.all([
        prisma.photo.count(),
        prisma.photo.count({ where: { status: 'PENDING' } }),
        prisma.photo.count({ where: { status: 'PROCESSING' } }),
        prisma.photo.count({ where: { status: 'COMPLETED' } }),
        prisma.photo.count({ where: { status: 'FAILED' } }),
      ])

      return { total, pending, processing, completed, failed }
    } catch (error) {
      console.error('Failed to get stats:', error)
      throw new Error('Database operation failed')
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()