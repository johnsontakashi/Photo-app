import type { NextApiRequest, NextApiResponse } from 'next'
import { db, CreateBodyMeasurementsData } from '@/lib/db'
import { SecurityService } from '@/lib/security'

interface MeasurementsResponse {
  success: boolean
  message?: string
  data?: any
}

const validateApiSecret = (req: NextApiRequest): boolean => {
  const apiSecret = process.env.API_SECRET
  if (!apiSecret) return true // Skip validation if no secret is set
  
  const providedSecret = req.headers['x-api-secret'] || req.body?.apiSecret
  return apiSecret === providedSecret
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeasurementsResponse>
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
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

    if (req.method === 'POST') {
      // Create or update body measurements
      const {
        customerEmail,
        chestWidth,
        overallWidth,
        sleeveWidth,
        topLength,
        waist,
        hip,
        rise,
        thighWidth,
        bottomLength,
      } = req.body

      // Validate required fields
      if (!customerEmail || typeof customerEmail !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Customer email is required',
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

      // Validate measurements (must be positive numbers if provided)
      const measurements = {
        chestWidth,
        overallWidth,
        sleeveWidth,
        topLength,
        waist,
        hip,
        rise,
        thighWidth,
        bottomLength,
      }

      for (const [key, value] of Object.entries(measurements)) {
        if (value !== undefined && value !== null) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value
          if (isNaN(numValue) || numValue < 0 || numValue > 500) {
            return res.status(400).json({
              success: false,
              message: `Invalid measurement for ${key}. Must be a positive number less than 500cm.`,
            })
          }
          measurements[key as keyof typeof measurements] = numValue
        }
      }

      // Prepare measurements data
      const measurementsData: CreateBodyMeasurementsData = {
        customerEmail: sanitizedEmail,
        ...measurements,
      }

      // Create or update measurements
      const savedMeasurements = await db.createOrUpdateBodyMeasurements(measurementsData)

      console.log(`Body measurements updated for: ${sanitizedEmail}`)

      return res.status(200).json({
        success: true,
        message: 'Body measurements updated successfully',
        data: {
          id: savedMeasurements.id,
          customerEmail: savedMeasurements.customerEmail,
          chestWidth: savedMeasurements.chestWidth,
          overallWidth: savedMeasurements.overallWidth,
          sleeveWidth: savedMeasurements.sleeveWidth,
          topLength: savedMeasurements.topLength,
          waist: savedMeasurements.waist,
          hip: savedMeasurements.hip,
          rise: savedMeasurements.rise,
          thighWidth: savedMeasurements.thighWidth,
          bottomLength: savedMeasurements.bottomLength,
          updatedAt: savedMeasurements.updatedAt,
        },
      })
    } else if (req.method === 'GET') {
      // Get body measurements
      const { customerEmail } = req.query

      if (!customerEmail || typeof customerEmail !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Customer email is required',
        })
      }

      const sanitizedEmail = SecurityService.sanitizeEmail(customerEmail)
      if (!sanitizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        })
      }

      const measurements = await db.getBodyMeasurements(sanitizedEmail)

      if (!measurements) {
        return res.status(404).json({
          success: false,
          message: 'Measurements not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: measurements,
      })
    }
  } catch (error) {
    console.error('Body measurements error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    })
  }
}