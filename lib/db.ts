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

// Customer Types
export type CustomerData = {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  dateOfBirth?: Date | null
  shopifyCustomerId?: string | null
  age?: number | null
  hobbies?: string | null
  occupation?: string | null
  usualSize?: string | null
  customFields?: any | null
  createdAt: Date
  updatedAt: Date
}

export type CreateCustomerData = {
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  dateOfBirth?: Date
  age?: number
  hobbies?: string
  occupation?: string
  usualSize?: string
  customFields?: any
}

export type UpdateCustomerData = Partial<CreateCustomerData>

// Body Measurements Types
export type BodyMeasurementsData = {
  id: string
  customerEmail: string
  chestWidth?: number | null
  overallWidth?: number | null
  sleeveWidth?: number | null
  topLength?: number | null
  waist?: number | null
  hip?: number | null
  rise?: number | null
  thighWidth?: number | null
  bottomLength?: number | null
  createdAt: Date
  updatedAt: Date
}

export type CreateBodyMeasurementsData = {
  customerEmail: string
  chestWidth?: number
  overallWidth?: number
  sleeveWidth?: number
  topLength?: number
  waist?: number
  hip?: number
  rise?: number
  thighWidth?: number
  bottomLength?: number
}

// Photo Types (updated)
export type PhotoData = {
  id: string
  customerEmail: string
  photoUrl: string
  originalName?: string | null
  fileSize?: number | null
  mimeType?: string | null
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  isVirtualFittingPhoto: boolean
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
  isVirtualFittingPhoto?: boolean
}

export type UpdatePhotoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

// Shopify Order Types
export type ShopifyOrderData = {
  id: string
  shopifyOrderId: string
  customerEmail: string
  orderNumber: string
  totalPrice: number
  currency: string
  orderStatus: string
  fulfillmentStatus?: string | null
  orderDate: Date
  orderData: any
  createdAt: Date
  updatedAt: Date
}

export type CreateShopifyOrderData = {
  shopifyOrderId: string
  customerEmail: string
  orderNumber: string
  totalPrice: number
  currency: string
  orderStatus: string
  fulfillmentStatus?: string
  orderDate: Date
  orderData: any
}

// Size Chart Types
export type SizeChartData = {
  id: string
  brand: string
  collection?: string | null
  productType: string
  sizes: any // JSON structure
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateSizeChartData = {
  brand: string
  collection?: string
  productType: string
  sizes: any
  isActive?: boolean
}

// Size Recommendation Types
export type SizeRecommendationData = {
  id: string
  customerEmail: string
  sizeChartId: string
  recommendedSize: string
  confidence: number
  productType: string
  measurementData: any
  createdAt: Date
}

export type CreateSizeRecommendationData = {
  customerEmail: string
  sizeChartId: string
  recommendedSize: string
  confidence: number
  productType: string
  measurementData: any
}

export class DatabaseService {
  // Customer methods
  async createOrUpdateCustomer(data: CreateCustomerData): Promise<CustomerData> {
    try {
      const customer = await prisma.customer.upsert({
        where: { email: data.email },
        create: data,
        update: data,
      })
      return customer as CustomerData
    } catch (error) {
      console.error('Failed to create/update customer:', error)
      throw new Error('Database operation failed')
    }
  }

  async getCustomerByEmail(email: string): Promise<CustomerData | null> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { email },
        include: {
          bodyMeasurements: true,
          photos: { take: 5, orderBy: { createdAt: 'desc' } },
          shopifyOrders: { take: 5, orderBy: { orderDate: 'desc' } },
        }
      })
      return customer as CustomerData | null
    } catch (error) {
      console.error('Failed to get customer by email:', error)
      throw new Error('Database operation failed')
    }
  }

  async updateCustomer(email: string, data: UpdateCustomerData): Promise<CustomerData> {
    try {
      const customer = await prisma.customer.update({
        where: { email },
        data,
      })
      return customer as CustomerData
    } catch (error) {
      console.error('Failed to update customer:', error)
      throw new Error('Database operation failed')
    }
  }

  // Body Measurements methods
  async createOrUpdateBodyMeasurements(data: CreateBodyMeasurementsData): Promise<BodyMeasurementsData> {
    try {
      const measurements = await prisma.bodyMeasurements.upsert({
        where: { customerEmail: data.customerEmail },
        create: data,
        update: {
          ...data,
          updatedAt: new Date(),
        },
      })
      return measurements as BodyMeasurementsData
    } catch (error) {
      console.error('Failed to create/update body measurements:', error)
      throw new Error('Database operation failed')
    }
  }

  async getBodyMeasurements(customerEmail: string): Promise<BodyMeasurementsData | null> {
    try {
      const measurements = await prisma.bodyMeasurements.findUnique({
        where: { customerEmail },
      })
      return measurements as BodyMeasurementsData | null
    } catch (error) {
      console.error('Failed to get body measurements:', error)
      throw new Error('Database operation failed')
    }
  }

  // Photo methods (updated)
  async createPhotoRecord(data: CreatePhotoData): Promise<PhotoData> {
    try {
      // Ensure customer exists
      await this.createOrUpdateCustomer({ email: data.customerEmail })
      
      const photo = await prisma.photo.create({
        data: {
          customerEmail: data.customerEmail,
          photoUrl: data.photoUrl,
          originalName: data.originalName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          isVirtualFittingPhoto: data.isVirtualFittingPhoto || false,
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
    virtualFittingPhotos: number
  }> {
    try {
      const [total, pending, processing, completed, failed, virtualFittingPhotos] = await Promise.all([
        prisma.photo.count(),
        prisma.photo.count({ where: { status: 'PENDING' } }),
        prisma.photo.count({ where: { status: 'PROCESSING' } }),
        prisma.photo.count({ where: { status: 'COMPLETED' } }),
        prisma.photo.count({ where: { status: 'FAILED' } }),
        prisma.photo.count({ where: { isVirtualFittingPhoto: true } }),
      ])

      return { total, pending, processing, completed, failed, virtualFittingPhotos }
    } catch (error) {
      console.error('Failed to get stats:', error)
      throw new Error('Database operation failed')
    }
  }

  // Shopify Order methods
  async createShopifyOrder(data: CreateShopifyOrderData): Promise<ShopifyOrderData> {
    try {
      // Ensure customer exists
      await this.createOrUpdateCustomer({ email: data.customerEmail })
      
      const order = await prisma.shopifyOrder.create({
        data,
      })
      return order as ShopifyOrderData
    } catch (error) {
      console.error('Failed to create Shopify order:', error)
      throw new Error('Database operation failed')
    }
  }

  async getShopifyOrdersByEmail(customerEmail: string, limit = 10): Promise<ShopifyOrderData[]> {
    try {
      const orders = await prisma.shopifyOrder.findMany({
        where: { customerEmail },
        orderBy: { orderDate: 'desc' },
        take: limit,
      })
      return orders as ShopifyOrderData[]
    } catch (error) {
      console.error('Failed to get Shopify orders:', error)
      throw new Error('Database operation failed')
    }
  }

  // Size Chart methods
  async createSizeChart(data: CreateSizeChartData): Promise<SizeChartData> {
    try {
      const sizeChart = await prisma.sizeChart.create({
        data: {
          ...data,
          isActive: data.isActive ?? true,
        },
      })
      return sizeChart as SizeChartData
    } catch (error) {
      console.error('Failed to create size chart:', error)
      throw new Error('Database operation failed')
    }
  }

  async getSizeCharts(productType?: string): Promise<SizeChartData[]> {
    try {
      const where = productType ? { productType, isActive: true } : { isActive: true }
      const sizeCharts = await prisma.sizeChart.findMany({
        where,
        orderBy: { brand: 'asc' },
      })
      return sizeCharts as SizeChartData[]
    } catch (error) {
      console.error('Failed to get size charts:', error)
      throw new Error('Database operation failed')
    }
  }

  // Size Recommendation methods
  async createSizeRecommendation(data: CreateSizeRecommendationData): Promise<SizeRecommendationData> {
    try {
      const recommendation = await prisma.sizeRecommendation.create({
        data,
      })
      return recommendation as SizeRecommendationData
    } catch (error) {
      console.error('Failed to create size recommendation:', error)
      throw new Error('Database operation failed')
    }
  }

  async getSizeRecommendations(customerEmail: string, productType?: string): Promise<SizeRecommendationData[]> {
    try {
      const where = productType 
        ? { customerEmail, productType }
        : { customerEmail }
      
      const recommendations = await prisma.sizeRecommendation.findMany({
        where,
        include: {
          sizeChart: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return recommendations as SizeRecommendationData[]
    } catch (error) {
      console.error('Failed to get size recommendations:', error)
      throw new Error('Database operation failed')
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()