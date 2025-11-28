import { db, CreateShopifyOrderData } from './db'

export interface ShopifyConfig {
  shopDomain: string
  accessToken: string
  apiVersion?: string
}

export interface ShopifyCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
  orders_count: number
  total_spent: string
  admin_graphql_api_id: string
}

export interface ShopifyOrderItem {
  id: string
  variant_id: string
  title: string
  quantity: number
  price: string
  vendor: string
  product_id: string
  variant_title?: string
  sku?: string
}

export interface ShopifyOrder {
  id: string
  order_number: number
  email: string
  created_at: string
  updated_at: string
  total_price: string
  currency: string
  financial_status: string
  fulfillment_status?: string
  line_items: ShopifyOrderItem[]
  customer?: ShopifyCustomer
  admin_graphql_api_id: string
}

export class ShopifyService {
  private config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = {
      ...config,
      apiVersion: config.apiVersion || '2024-01',
    }
  }

  private getApiUrl(endpoint: string): string {
    return `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion}/${endpoint}`
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getApiUrl(endpoint)
    
    const headers = {
      'X-Shopify-Access-Token': this.config.accessToken,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Customer methods
  async getCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    try {
      const response = await this.makeRequest<{ customers: ShopifyCustomer[] }>(
        `customers/search.json?query=email:${encodeURIComponent(email)}`
      )

      return response.customers[0] || null
    } catch (error) {
      console.error('Error fetching Shopify customer:', error)
      throw error
    }
  }

  async getCustomerById(customerId: string): Promise<ShopifyCustomer | null> {
    try {
      const response = await this.makeRequest<{ customer: ShopifyCustomer }>(
        `customers/${customerId}.json`
      )

      return response.customer
    } catch (error) {
      console.error('Error fetching Shopify customer by ID:', error)
      throw error
    }
  }

  // Order methods
  async getOrdersByCustomerEmail(email: string, limit = 10): Promise<ShopifyOrder[]> {
    try {
      const response = await this.makeRequest<{ orders: ShopifyOrder[] }>(
        `orders.json?status=any&limit=${limit}&fields=id,order_number,email,created_at,updated_at,total_price,currency,financial_status,fulfillment_status,line_items,customer,admin_graphql_api_id&email=${encodeURIComponent(email)}`
      )

      return response.orders
    } catch (error) {
      console.error('Error fetching Shopify orders:', error)
      throw error
    }
  }

  async getOrderById(orderId: string): Promise<ShopifyOrder | null> {
    try {
      const response = await this.makeRequest<{ order: ShopifyOrder }>(
        `orders/${orderId}.json?fields=id,order_number,email,created_at,updated_at,total_price,currency,financial_status,fulfillment_status,line_items,customer,admin_graphql_api_id`
      )

      return response.order
    } catch (error) {
      console.error('Error fetching Shopify order by ID:', error)
      throw error
    }
  }

  // Sync methods
  async syncCustomerOrders(email: string): Promise<void> {
    try {
      const orders = await this.getOrdersByCustomerEmail(email)
      
      for (const order of orders) {
        const orderData: CreateShopifyOrderData = {
          shopifyOrderId: order.id,
          customerEmail: order.email,
          orderNumber: order.order_number.toString(),
          totalPrice: parseFloat(order.total_price),
          currency: order.currency,
          orderStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          orderDate: new Date(order.created_at),
          orderData: order,
        }

        // Create or update order in database
        await db.createShopifyOrder(orderData).catch(error => {
          // If order already exists, that's fine
          if (!error.message.includes('unique constraint')) {
            throw error
          }
        })
      }

      // Update customer record with Shopify ID if available
      if (orders.length > 0 && orders[0].customer) {
        await db.updateCustomer(email, {
          firstName: orders[0].customer.first_name,
          lastName: orders[0].customer.last_name,
          phoneNumber: orders[0].customer.phone,
        })
      }
    } catch (error) {
      console.error('Error syncing customer orders:', error)
      throw error
    }
  }

  // URL helpers
  getCustomerAdminUrl(customerId: string): string {
    return `https://${this.config.shopDomain}/admin/customers/${customerId}`
  }

  getOrderAdminUrl(orderId: string): string {
    return `https://${this.config.shopDomain}/admin/orders/${orderId}`
  }

  // Validation
  async validateConnection(): Promise<boolean> {
    try {
      await this.makeRequest<{ shop: any }>('shop.json')
      return true
    } catch (error) {
      console.error('Shopify connection validation failed:', error)
      return false
    }
  }
}

// Factory function to create Shopify service instance
export function createShopifyService(): ShopifyService | null {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN
  const apiVersion = process.env.SHOPIFY_API_VERSION

  if (!shopDomain || !accessToken) {
    console.warn('Shopify integration not configured. Missing SHOPIFY_SHOP_DOMAIN or SHOPIFY_ACCESS_TOKEN')
    return null
  }

  return new ShopifyService({
    shopDomain,
    accessToken,
    apiVersion,
  })
}

// Export singleton instance
export const shopifyService = createShopifyService()