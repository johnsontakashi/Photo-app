import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

interface PhotoListResponse {
  success: boolean
  message?: string
  data?: Array<{
    id: string
    customerEmail: string
    photoUrl: string
    originalName?: string | null
    fileSize?: number | null
    mimeType?: string | null
    status: string
    createdAt: string
    updatedAt: string
  }>
  stats?: {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  }
}

const validateApiSecret = (req: NextApiRequest): boolean => {
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) return true // Skip validation if no secret is set
  
  const providedSecret = req.headers['x-api-secret'] || req.query?.apiSecret
  return apiSecret === providedSecret
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
    })
  }

  try {
    // Validate API secret (if configured)
    if (!validateApiSecret(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
    }

    // Get query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
    const includeStats = req.query.stats === 'true'
    const status = req.query.status as string
    const email = req.query.email as string

    let photos
    let stats

    // Get photos based on filters
    if (status) {
      photos = await db.getPhotosByStatus(status.toUpperCase() as any)
    } else {
      photos = await db.getAllPhotos(limit)
    }

    // Filter by email if provided
    if (email) {
      photos = photos.filter(photo => 
        photo.customerEmail.toLowerCase().includes(email.toLowerCase())
      )
    }

    // Get stats if requested
    if (includeStats) {
      stats = await db.getStats()
    }

    // Format response data
    const formattedPhotos = photos.map(photo => ({
      id: photo.id,
      customerEmail: photo.customerEmail,
      photoUrl: photo.photoUrl,
      originalName: photo.originalName,
      fileSize: photo.fileSize,
      mimeType: photo.mimeType,
      status: photo.status.toLowerCase(),
      createdAt: photo.createdAt.toISOString(),
      updatedAt: photo.updatedAt.toISOString(),
    }))

    const response: PhotoListResponse = {
      success: true,
      data: formattedPhotos,
    }

    if (stats) {
      response.stats = stats
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('List photos error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    })
  }
}