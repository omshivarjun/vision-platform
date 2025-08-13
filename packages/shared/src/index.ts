// Export all types
export * from './types'

// Export utility functions
export const validateRequest = <T>(schema: { parse: (data: unknown) => T }, data: unknown): T => {
  return schema.parse(data)
}

export const safeParse = <T>(schema: { safeParse: (data: unknown) => { success: boolean; data?: T } }, data: unknown) => {
  return schema.safeParse(data)
}

