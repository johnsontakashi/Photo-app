import crypto from 'crypto'

export class SecurityService {
  // Rate limiting storage (in-memory for now - use Redis in production)
  private static rateLimits = new Map<string, { count: number; resetTime: number }>()

  /**
   * Simple rate limiting by IP address
   */
  static checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const clientData = this.rateLimits.get(ip)

    if (!clientData || now > clientData.resetTime) {
      // New window
      this.rateLimits.set(ip, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (clientData.count >= maxRequests) {
      return false
    }

    clientData.count++
    return true
  }

  /**
   * Get client IP from request
   */
  static getClientIP(req: any): string {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.headers?.['x-forwarded-for']?.split(',')[0] ||
      req.headers?.['x-real-ip'] ||
      '127.0.0.1'
    )
  }

  /**
   * Generate secure CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(provided: string, stored: string): boolean {
    if (!provided || !stored) return false
    return crypto.timingSafeEqual(
      Buffer.from(provided, 'hex'),
      Buffer.from(stored, 'hex')
    )
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') return null
    
    const sanitized = email.toLowerCase().trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!emailRegex.test(sanitized) || sanitized.length > 254) {
      return null
    }
    
    return sanitized
  }

  /**
   * Generate secure file hash for deduplication
   */
  static generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }

  /**
   * Validate file signature (magic numbers)
   */
  static validateFileSignature(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false

    const signatures: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]] // Note: WebP also has WEBP at offset 8
    }

    const fileSignatures = signatures[mimeType.toLowerCase()]
    if (!fileSignatures) return false

    return fileSignatures.some(signature => {
      return signature.every((byte, index) => buffer[index] === byte)
    })
  }

  /**
   * Validate request origin
   */
  static validateOrigin(origin: string, allowedOrigins: string[]): boolean {
    if (!origin) return false
    return allowedOrigins.includes(origin)
  }

  /**
   * Generate secure API key
   */
  static generateAPIKey(): string {
    return crypto.randomBytes(32).toString('base64url')
  }

  /**
   * Hash sensitive data
   */
  static hashSensitiveData(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHash('sha256').update(data + actualSalt).digest('hex')
    return `${actualSalt}:${hash}`
  }

  /**
   * Verify hashed data
   */
  static verifyHashedData(data: string, hashedValue: string): boolean {
    const [salt, hash] = hashedValue.split(':')
    if (!salt || !hash) return false
    
    const newHash = crypto.createHash('sha256').update(data + salt).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(newHash, 'hex'))
  }

  /**
   * Clean up old rate limit entries
   */
  static cleanupRateLimits(): void {
    const now = Date.now()
    this.rateLimits.forEach((data, ip) => {
      if (now > data.resetTime) {
        this.rateLimits.delete(ip)
      }
    })
  }
}

// Clean up rate limits every 5 minutes
setInterval(() => {
  SecurityService.cleanupRateLimits()
}, 5 * 60 * 1000)