import { PhotoData, db } from './db'

export interface N8nWebhookPayload {
  id: string
  email: string
  photoUrl: string
  status: string
  timestamp: string
  originalName?: string
  fileSize?: number
  mimeType?: string
}

export class N8nWebhookService {
  private maxRetries = 3
  private retryDelay = 1000 // 1 second

  async sendWebhook(photo: PhotoData): Promise<boolean> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL not configured, skipping webhook')
      return false
    }

    const payload: N8nWebhookPayload = {
      id: photo.id,
      email: photo.customerEmail,
      photoUrl: photo.photoUrl,
      status: photo.status,
      timestamp: new Date().toISOString(),
      originalName: photo.originalName || undefined,
      fileSize: photo.fileSize || undefined,
      mimeType: photo.mimeType || undefined,
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`Sending webhook to n8n (attempt ${attempt + 1}/${this.maxRetries})`)
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.N8N_WEBHOOK_SECRET && {
              'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
            }),
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('Webhook sent successfully:', result)

        // Update webhook status in database
        await db.updateWebhookStatus(photo.id, true, attempt)
        
        return true
      } catch (error) {
        lastError = error as Error
        console.error(`Webhook attempt ${attempt + 1} failed:`, error)

        // Update retry count in database
        await db.updateWebhookStatus(photo.id, false, attempt + 1)

        if (attempt < this.maxRetries - 1) {
          // Wait before retrying
          await this.sleep(this.retryDelay * Math.pow(2, attempt)) // Exponential backoff
        }
      }
    }

    console.error(`All webhook attempts failed for photo ${photo.id}:`, lastError)
    return false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async retryFailedWebhooks(): Promise<void> {
    try {
      // Find photos that haven't had their webhook sent successfully
      const { prisma } = await import('./db')
      const failedPhotos = await prisma.photo.findMany({
        where: {
          n8nWebhookSent: false,
          n8nRetries: { lt: this.maxRetries },
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // Process 10 at a time
      })

      for (const photo of failedPhotos) {
        console.log(`Retrying webhook for photo ${photo.id}`)
        await this.sendWebhook(photo as PhotoData)
      }
    } catch (error) {
      console.error('Error retrying failed webhooks:', error)
    }
  }
}

// Export singleton instance
export const n8nService = new N8nWebhookService()