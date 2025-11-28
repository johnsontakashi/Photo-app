import type { NextApiRequest, NextApiResponse } from 'next'
import { sizeRecommendationService } from '@/lib/sizeRecommendation'
import { SecurityService } from '@/lib/security'

interface SizeRecommendationResponse {
  success: boolean
  message?: string
  data?: any
}

const validateApiSecret = (req: NextApiRequest): boolean => {
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) return true // Skip validation if no secret is set
  
  const providedSecret = req.headers['x-api-secret'] || req.query?.apiSecret
  return apiSecret === providedSecret
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SizeRecommendationResponse>
) {
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

    const { 
      customerEmail, 
      productType, 
      brand, 
      collection,
      history 
    } = req.query

    // Validate required fields
    if (!customerEmail || typeof customerEmail !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required',
      })
    }

    if (!productType || typeof productType !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product type is required',
      })
    }

    // Sanitize email
    const sanitizedEmail = SecurityService.sanitizeEmail(customerEmail)
    if (!sanitizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      })
    }

    if (history === 'true') {
      // Get recommendation history
      const recommendationHistory = await sizeRecommendationService.getRecommendationHistory(
        sanitizedEmail,
        productType
      )

      return res.status(200).json({
        success: true,
        data: recommendationHistory,
      })
    } else {
      // Get new recommendation
      const recommendation = await sizeRecommendationService.getRecommendation(
        sanitizedEmail,
        productType,
        brand as string | undefined,
        collection as string | undefined
      )

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'No recommendation available. Please ensure you have body measurements on file and that size charts are available for the requested product type.',
        })
      }

      return res.status(200).json({
        success: true,
        data: recommendation,
      })
    }
  } catch (error) {
    console.error('Size recommendation error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    })
  }
}