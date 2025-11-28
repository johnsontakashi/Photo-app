import type { NextApiRequest, NextApiResponse } from 'next'
import { shopifyService } from '@/lib/shopify'
import { db } from '@/lib/db'
import { SecurityService } from '@/lib/security'

interface ShopifyOrdersResponse {
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
  res: NextApiResponse<ShopifyOrdersResponse>
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

    // Check if Shopify is configured
    if (!shopifyService) {
      return res.status(503).json({
        success: false,
        message: 'Shopify integration not configured',
      })
    }

    const { customerEmail, sync } = req.query

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

    if (sync === 'true') {
      // Sync orders from Shopify to database
      try {
        await shopifyService.syncCustomerOrders(sanitizedEmail)
        
        // Get synced orders from database
        const orders = await db.getShopifyOrdersByEmail(sanitizedEmail)

        return res.status(200).json({
          success: true,
          message: 'Orders synced successfully',
          data: {
            orders,
            syncedAt: new Date().toISOString(),
          },
        })
      } catch (error) {
        console.error('Shopify sync error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to sync orders from Shopify',
        })
      }
    } else {
      // Get orders from database
      const orders = await db.getShopifyOrdersByEmail(sanitizedEmail)

      // Get Shopify customer info if available
      let shopifyCustomer = null
      try {
        shopifyCustomer = await shopifyService.getCustomerByEmail(sanitizedEmail)
      } catch (error) {
        console.warn('Could not fetch Shopify customer:', error)
      }

      const response: any = {
        orders,
        shopifyCustomer: shopifyCustomer ? {
          id: shopifyCustomer.id,
          email: shopifyCustomer.email,
          firstName: shopifyCustomer.first_name,
          lastName: shopifyCustomer.last_name,
          phone: shopifyCustomer.phone,
          ordersCount: shopifyCustomer.orders_count,
          totalSpent: shopifyCustomer.total_spent,
          adminUrl: shopifyService.getCustomerAdminUrl(shopifyCustomer.id),
        } : null,
      }

      return res.status(200).json({
        success: true,
        data: response,
      })
    }
  } catch (error) {
    console.error('Shopify orders error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    })
  }
}