import { db, BodyMeasurementsData, SizeChartData, CreateSizeRecommendationData } from './db'

export interface SizeMatch {
  size: string
  confidence: number
  matchDetails: {
    measurements: Record<string, { 
      userValue: number
      sizeRange: [number, number]
      score: number
    }>
    overallScore: number
  }
}

export interface SizeRecommendation {
  productType: string
  recommendedSize: string
  confidence: number
  alternativeSizes: string[]
  brand: string
  collection?: string
  reasoning: string
}

export class SizeRecommendationService {
  
  /**
   * Get size recommendation for a customer based on their measurements
   */
  async getRecommendation(
    customerEmail: string, 
    productType: string,
    brand?: string,
    collection?: string
  ): Promise<SizeRecommendation | null> {
    try {
      // Get customer measurements
      const measurements = await db.getBodyMeasurements(customerEmail)
      if (!measurements) {
        console.log('No measurements found for customer')
        return null
      }

      // Get applicable size charts
      let sizeCharts = await db.getSizeCharts(productType)
      
      if (brand) {
        sizeCharts = sizeCharts.filter(chart => 
          chart.brand.toLowerCase() === brand.toLowerCase() &&
          (!collection || chart.collection?.toLowerCase() === collection?.toLowerCase())
        )
      }

      if (sizeCharts.length === 0) {
        console.log('No size charts found for criteria')
        return null
      }

      // Find best match from all charts
      let bestMatch: { chart: SizeChartData, match: SizeMatch } | null = null

      for (const chart of sizeCharts) {
        const match = this.findBestSizeMatch(measurements, chart, productType)
        if (match && (!bestMatch || match.confidence > bestMatch.match.confidence)) {
          bestMatch = { chart, match }
        }
      }

      if (!bestMatch) {
        return null
      }

      // Create recommendation record
      const recommendationData: CreateSizeRecommendationData = {
        customerEmail,
        sizeChartId: bestMatch.chart.id,
        recommendedSize: bestMatch.match.size,
        confidence: bestMatch.match.confidence,
        productType,
        measurementData: bestMatch.match.matchDetails,
      }

      await db.createSizeRecommendation(recommendationData)

      // Generate alternative sizes
      const alternativeSizes = this.getAlternativeSizes(
        bestMatch.chart.sizes,
        bestMatch.match.size,
        measurements,
        productType
      )

      return {
        productType,
        recommendedSize: bestMatch.match.size,
        confidence: bestMatch.match.confidence,
        alternativeSizes,
        brand: bestMatch.chart.brand,
        collection: bestMatch.chart.collection || undefined,
        reasoning: this.generateReasoning(bestMatch.match),
      }

    } catch (error) {
      console.error('Error getting size recommendation:', error)
      throw error
    }
  }

  /**
   * Find the best size match for given measurements against a size chart
   */
  private findBestSizeMatch(
    measurements: BodyMeasurementsData,
    sizeChart: SizeChartData,
    productType: string
  ): SizeMatch | null {
    const sizesData = sizeChart.sizes as Record<string, Record<string, [number, number]>>
    
    if (!sizesData || typeof sizesData !== 'object') {
      return null
    }

    const relevantMeasurements = this.getRelevantMeasurements(measurements, productType)
    if (Object.keys(relevantMeasurements).length === 0) {
      return null
    }

    let bestMatch: SizeMatch | null = null

    for (const [sizeName, sizeRanges] of Object.entries(sizesData)) {
      const match = this.calculateSizeMatch(relevantMeasurements, sizeRanges, sizeName)
      
      if (!bestMatch || match.confidence > bestMatch.confidence) {
        bestMatch = match
      }
    }

    return bestMatch
  }

  /**
   * Get relevant measurements based on product type
   */
  private getRelevantMeasurements(
    measurements: BodyMeasurementsData,
    productType: string
  ): Record<string, number> {
    const relevant: Record<string, number> = {}

    switch (productType.toLowerCase()) {
      case 'top':
      case 'shirt':
      case 'blouse':
        if (measurements.chestWidth) relevant.chestWidth = measurements.chestWidth
        if (measurements.overallWidth) relevant.overallWidth = measurements.overallWidth
        if (measurements.sleeveWidth) relevant.sleeveWidth = measurements.sleeveWidth
        if (measurements.topLength) relevant.topLength = measurements.topLength
        break

      case 'bottom':
      case 'pants':
      case 'jeans':
        if (measurements.waist) relevant.waist = measurements.waist
        if (measurements.hip) relevant.hip = measurements.hip
        if (measurements.rise) relevant.rise = measurements.rise
        if (measurements.thighWidth) relevant.thighWidth = measurements.thighWidth
        if (measurements.bottomLength) relevant.bottomLength = measurements.bottomLength
        break

      case 'dress':
        if (measurements.chestWidth) relevant.chestWidth = measurements.chestWidth
        if (measurements.waist) relevant.waist = measurements.waist
        if (measurements.hip) relevant.hip = measurements.hip
        if (measurements.topLength) relevant.topLength = measurements.topLength
        break

      default:
        // Use all available measurements
        if (measurements.chestWidth) relevant.chestWidth = measurements.chestWidth
        if (measurements.waist) relevant.waist = measurements.waist
        if (measurements.hip) relevant.hip = measurements.hip
    }

    return relevant
  }

  /**
   * Calculate how well a set of measurements matches a specific size
   */
  private calculateSizeMatch(
    userMeasurements: Record<string, number>,
    sizeRanges: Record<string, [number, number]>,
    sizeName: string
  ): SizeMatch {
    const matchDetails: SizeMatch['matchDetails'] = {
      measurements: {},
      overallScore: 0,
    }

    let totalScore = 0
    let measurementCount = 0

    for (const [measurement, userValue] of Object.entries(userMeasurements)) {
      const sizeRange = sizeRanges[measurement]
      
      if (!sizeRange || !Array.isArray(sizeRange) || sizeRange.length !== 2) {
        continue
      }

      const [min, max] = sizeRange
      let score = 0

      if (userValue >= min && userValue <= max) {
        // Perfect fit
        score = 1.0
      } else if (userValue < min) {
        // Too small
        const diff = min - userValue
        score = Math.max(0, 1 - (diff / min) * 2)
      } else {
        // Too large
        const diff = userValue - max
        score = Math.max(0, 1 - (diff / max) * 2)
      }

      matchDetails.measurements[measurement] = {
        userValue,
        sizeRange: [min, max],
        score,
      }

      totalScore += score
      measurementCount++
    }

    matchDetails.overallScore = measurementCount > 0 ? totalScore / measurementCount : 0

    return {
      size: sizeName,
      confidence: matchDetails.overallScore,
      matchDetails,
    }
  }

  /**
   * Get alternative sizes based on the recommended size
   */
  private getAlternativeSizes(
    sizesData: any,
    recommendedSize: string,
    measurements: BodyMeasurementsData,
    productType: string
  ): string[] {
    const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    const currentIndex = sizeOrder.indexOf(recommendedSize.toUpperCase())
    
    const alternatives: string[] = []

    if (currentIndex > 0) {
      alternatives.push(sizeOrder[currentIndex - 1]) // Smaller size
    }
    
    if (currentIndex < sizeOrder.length - 1) {
      alternatives.push(sizeOrder[currentIndex + 1]) // Larger size
    }

    // Filter to only include sizes that exist in the chart
    const availableSizes = Object.keys(sizesData as object)
    return alternatives.filter(size => 
      availableSizes.some(available => 
        available.toLowerCase() === size.toLowerCase()
      )
    )
  }

  /**
   * Generate human-readable reasoning for the recommendation
   */
  private generateReasoning(match: SizeMatch): string {
    const confidence = Math.round(match.confidence * 100)
    
    if (confidence >= 90) {
      return `Excellent fit based on your measurements (${confidence}% confidence)`
    } else if (confidence >= 75) {
      return `Good fit for most of your measurements (${confidence}% confidence)`
    } else if (confidence >= 60) {
      return `Reasonable fit, but consider trying multiple sizes (${confidence}% confidence)`
    } else {
      return `Limited data available for accurate recommendation (${confidence}% confidence)`
    }
  }

  /**
   * Create or update a size chart
   */
  async createSizeChart(
    brand: string,
    collection: string | null,
    productType: string,
    sizes: Record<string, Record<string, [number, number]>>
  ): Promise<void> {
    try {
      await db.createSizeChart({
        brand,
        collection,
        productType,
        sizes,
      })
    } catch (error) {
      console.error('Error creating size chart:', error)
      throw error
    }
  }

  /**
   * Get size recommendations history for a customer
   */
  async getRecommendationHistory(
    customerEmail: string,
    productType?: string
  ): Promise<any[]> {
    try {
      return await db.getSizeRecommendations(customerEmail, productType)
    } catch (error) {
      console.error('Error getting recommendation history:', error)
      throw error
    }
  }
}

// Export singleton instance
export const sizeRecommendationService = new SizeRecommendationService()

// Helper function to initialize default size charts
export async function initializeDefaultSizeCharts(): Promise<void> {
  const defaultCharts = [
    {
      brand: 'Generic',
      collection: null,
      productType: 'top',
      sizes: {
        'XS': {
          chestWidth: [80, 85],
          overallWidth: [85, 90],
          sleeveWidth: [30, 32],
          topLength: [58, 62],
        },
        'S': {
          chestWidth: [85, 90],
          overallWidth: [90, 95],
          sleeveWidth: [32, 34],
          topLength: [60, 64],
        },
        'M': {
          chestWidth: [90, 95],
          overallWidth: [95, 100],
          sleeveWidth: [34, 36],
          topLength: [62, 66],
        },
        'L': {
          chestWidth: [95, 100],
          overallWidth: [100, 105],
          sleeveWidth: [36, 38],
          topLength: [64, 68],
        },
        'XL': {
          chestWidth: [100, 105],
          overallWidth: [105, 110],
          sleeveWidth: [38, 40],
          topLength: [66, 70],
        },
      },
    },
    {
      brand: 'Generic',
      collection: null,
      productType: 'bottom',
      sizes: {
        'XS': {
          waist: [60, 65],
          hip: [85, 90],
          rise: [20, 22],
          thighWidth: [50, 52],
          bottomLength: [100, 105],
        },
        'S': {
          waist: [65, 70],
          hip: [90, 95],
          rise: [22, 24],
          thighWidth: [52, 54],
          bottomLength: [102, 107],
        },
        'M': {
          waist: [70, 75],
          hip: [95, 100],
          rise: [24, 26],
          thighWidth: [54, 56],
          bottomLength: [104, 109],
        },
        'L': {
          waist: [75, 80],
          hip: [100, 105],
          rise: [26, 28],
          thighWidth: [56, 58],
          bottomLength: [106, 111],
        },
        'XL': {
          waist: [80, 85],
          hip: [105, 110],
          rise: [28, 30],
          thighWidth: [58, 60],
          bottomLength: [108, 113],
        },
      },
    },
  ]

  for (const chart of defaultCharts) {
    try {
      await sizeRecommendationService.createSizeChart(
        chart.brand,
        chart.collection,
        chart.productType,
        chart.sizes
      )
    } catch (error) {
      // Chart might already exist, continue
      console.log(`Size chart already exists: ${chart.brand} - ${chart.productType}`)
    }
  }
}