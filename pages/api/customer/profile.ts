import type { NextApiRequest, NextApiResponse } from 'next'
import { db, CreateCustomerData } from '@/lib/db'
import { SecurityService } from '@/lib/security'

interface CustomerProfileResponse {
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
  res: NextApiResponse<CustomerProfileResponse>
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
      // Create or update customer profile
      const {
        email,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        age,
        hobbies,
        occupation,
        usualSize,
        customFields,
      } = req.body

      // Validate required fields
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        })
      }

      // Sanitize email
      const sanitizedEmail = SecurityService.sanitizeEmail(email)
      if (!sanitizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        })
      }

      // Prepare customer data
      const customerData: CreateCustomerData = {
        email: sanitizedEmail,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber: phoneNumber || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        age: age || undefined,
        hobbies: hobbies || undefined,
        occupation: occupation || undefined,
        usualSize: usualSize || undefined,
        customFields: customFields || undefined,
      }

      // Create or update customer
      const savedCustomer = await db.createOrUpdateCustomer(customerData)

      console.log(`Customer profile updated: ${savedCustomer.email}`)

      return res.status(200).json({
        success: true,
        message: 'Customer profile updated successfully',
        data: {
          id: savedCustomer.id,
          email: savedCustomer.email,
          firstName: savedCustomer.firstName,
          lastName: savedCustomer.lastName,
          phoneNumber: savedCustomer.phoneNumber,
          age: savedCustomer.age,
          occupation: savedCustomer.occupation,
          usualSize: savedCustomer.usualSize,
        },
      })
    } else if (req.method === 'GET') {
      // Get customer profile
      const { email } = req.query

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        })
      }

      const sanitizedEmail = SecurityService.sanitizeEmail(email)
      if (!sanitizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        })
      }

      const customer = await db.getCustomerByEmail(sanitizedEmail)

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: customer,
      })
    }
  } catch (error) {
    console.error('Customer profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    })
  }
}