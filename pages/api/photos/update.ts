import type { NextApiRequest, NextApiResponse } from 'next'
import { db, UpdatePhotoStatus } from '@/lib/db'

interface PhotoUpdateResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    status: string
    updatedAt: string
  }
}

const validateApiSecret = (req: NextApiRequest): boolean => {
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) return true // Skip validation if no secret is set
  
  const providedSecret = req.headers['x-api-secret'] || req.body?.apiSecret
  return apiSecret === providedSecret
}

const isValidStatus = (status: string): status is UpdatePhotoStatus => {
  return ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status.toUpperCase())
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PhotoUpdateResponse>
) {
  // Only allow PUT/PATCH requests
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
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

    const { id, status } = req.body

    // Validate required fields
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Photo ID is required',
      })
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      })
    }

    // Validate status value
    if (!isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: pending, processing, completed, failed',
      })
    }

    // Check if photo exists
    const existingPhoto = await db.getPhotoById(id)
    if (!existingPhoto) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      })
    }

    // Update photo status
    const updatedPhoto = await db.updatePhotoStatus(id, status.toUpperCase() as UpdatePhotoStatus)

    console.log(`Photo status updated: ${id} -> ${status}`)

    return res.status(200).json({
      success: true,
      message: 'Photo status updated successfully',
      data: {
        id: updatedPhoto.id,
        status: updatedPhoto.status.toLowerCase(),
        updatedAt: updatedPhoto.updatedAt.toISOString(),
      },
    })

  } catch (error) {
    console.error('Update photo error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    })
  }
}