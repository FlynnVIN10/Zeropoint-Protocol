import { NextRequest } from 'next/server'

export class ValidationUtils {
  static validateRequired(data: any, fields: string[]): string[] {
    const errors: string[] = []
    
    fields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} is required`)
      }
    })
    
    return errors
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  static validateJSON(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      if (typeof data === 'string') {
        JSON.parse(data)
      }
    } catch (error) {
      errors.push('Invalid JSON format')
    }
    
    return { valid: errors.length === 0, errors }
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim()
  }

  static validateJobData(data: any): string[] {
    const errors: string[] = []
    
    // Validate required fields
    errors.push(...this.validateRequired(data, ['modelName', 'datasetPath']))
    
    // Validate model name format
    if (data.modelName && typeof data.modelName === 'string') {
      if (data.modelName.length < 3 || data.modelName.length > 100) {
        errors.push('Model name must be between 3 and 100 characters')
      }
    }
    
    // Validate dataset path
    if (data.datasetPath && typeof data.datasetPath === 'string') {
      if (!data.datasetPath.startsWith('/') && !data.datasetPath.startsWith('http')) {
        errors.push('Dataset path must be absolute or URL')
      }
    }
    
    return errors
  }

  static validateProposalData(data: any): string[] {
    const errors: string[] = []
    
    // Validate required fields
    errors.push(...this.validateRequired(data, ['title', 'description', 'type']))
    
    // Validate title length
    if (data.title && data.title.length > 500) {
      errors.push('Title must be 500 characters or less')
    }
    
    // Validate description length
    if (data.description && data.description.length > 5000) {
      errors.push('Description must be 5000 characters or less')
    }
    
    // Validate type
    const validTypes = ['governance', 'technical', 'economic', 'social']
    if (data.type && !validTypes.includes(data.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`)
    }
    
    return errors
  }

  static validateContributionData(data: any): string[] {
    const errors: string[] = []
    
    // Validate required fields
    errors.push(...this.validateRequired(data, ['title', 'description', 'assetType', 'content']))
    
    // Validate asset type
    const validAssetTypes = ['code', 'documentation', 'model', 'dataset', 'configuration']
    if (data.assetType && !validAssetTypes.includes(data.assetType)) {
      errors.push(`Asset type must be one of: ${validAssetTypes.join(', ')}`)
    }
    
    // Validate content length
    if (data.content && data.content.length > 100000) {
      errors.push('Content must be 100,000 characters or less')
    }
    
    return errors
  }
}