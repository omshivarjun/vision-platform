// Export all types
export * from './types'

// Export utility functions
export const validateRequest = <T>(schema: any, data: unknown): T => {
  return schema.parse(data)
}

export const safeParse = <T>(schema: any, data: unknown) => {
  return schema.safeParse(data)
}

