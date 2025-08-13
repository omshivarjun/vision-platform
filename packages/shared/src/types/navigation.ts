import { z } from 'zod';

// Location types
export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(), // in meters
  altitude: z.number().optional(), // in meters
  heading: z.number().min(0).max(360).optional(), // in degrees
  speed: z.number().min(0).optional(), // in m/s
  timestamp: z.string(),
});

export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  formatted: z.string(),
});

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['restaurant', 'hospital', 'bank', 'store', 'park', 'other']),
  location: LocationSchema,
  address: AddressSchema.optional(),
  rating: z.number().min(0).max(5).optional(),
  accessibility: z.object({
    wheelchairAccessible: z.boolean().default(false),
    hasElevators: z.boolean().default(false),
    hasRamps: z.boolean().default(false),
    hasAudioSignals: z.boolean().default(false),
    hasBrailleSigns: z.boolean().default(false),
  }).optional(),
  hours: z.record(z.string(), z.string()).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
});

// Route types
export const RouteStepSchema = z.object({
  id: z.string(),
  instruction: z.string(),
  distance: z.number(), // in meters
  duration: z.number(), // in seconds
  maneuver: z.enum([
    'turn-left',
    'turn-right',
    'straight',
    'u-turn',
    'arrive',
    'depart',
    'roundabout',
    'merge',
    'exit',
  ]),
  location: LocationSchema,
  warnings: z.array(z.string()).default([]),
  accessibility: z.object({
    hasElevator: z.boolean().default(false),
    hasRamp: z.boolean().default(false),
    hasStairs: z.boolean().default(false),
    hasCrossing: z.boolean().default(false),
    hasAudioSignal: z.boolean().default(false),
  }).optional(),
});

export const RouteSchema = z.object({
  id: z.string(),
  origin: LocationSchema,
  destination: LocationSchema,
  mode: z.enum(['walking', 'transit', 'driving', 'cycling']),
  distance: z.number(), // in meters
  duration: z.number(), // in seconds
  steps: z.array(RouteStepSchema),
  accessibility: z.object({
    wheelchairAccessible: z.boolean(),
    avoidStairs: z.boolean(),
    avoidCrossings: z.boolean(),
    hasElevators: z.boolean(),
    hasRamps: z.boolean(),
  }),
  alternatives: z.array(z.object({
    id: z.string(),
    distance: z.number(),
    duration: z.number(),
    accessibility: z.object({
      wheelchairAccessible: z.boolean(),
      avoidStairs: z.boolean(),
      avoidCrossings: z.boolean(),
    }),
  })).optional(),
  createdAt: z.string(),
});

// Navigation session types
export const NavigationSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  route: RouteSchema,
  status: z.enum(['active', 'paused', 'completed', 'cancelled']),
  currentStep: z.number().default(0),
  startTime: z.string(),
  endTime: z.string().optional(),
  currentLocation: LocationSchema.optional(),
  progress: z.number().min(0).max(100).default(0),
  alerts: z.array(z.object({
    type: z.enum(['obstacle', 'crossing', 'stairs', 'elevator', 'ramp']),
    message: z.string(),
    location: LocationSchema,
    severity: z.enum(['low', 'medium', 'high']),
    timestamp: z.string(),
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Navigation preferences types
export const NavigationPreferencesSchema = z.object({
  userId: z.string(),
  accessibility: z.object({
    wheelchairAccessible: z.boolean().default(false),
    avoidStairs: z.boolean().default(false),
    avoidCrossings: z.boolean().default(false),
    preferElevators: z.boolean().default(true),
    preferRamps: z.boolean().default(true),
  }),
  routing: z.object({
    preferQuietRoutes: z.boolean().default(false),
    preferScenicRoutes: z.boolean().default(false),
    avoidHighways: z.boolean().default(false),
    maxWalkingDistance: z.number().min(100).max(10000).default(2000), // in meters
    maxTransitTime: z.number().min(5).max(120).default(30), // in minutes
  }),
  notifications: z.object({
    turnByTurn: z.boolean().default(true),
    obstacleWarnings: z.boolean().default(true),
    arrivalAlerts: z.boolean().default(true),
    rerouteAlerts: z.boolean().default(true),
  }),
  voice: z.object({
    enabled: z.boolean().default(true),
    language: z.string().min(2).max(5).default('en'),
    speed: z.number().min(0.5).max(2.0).default(1.0),
    volume: z.number().min(0.0).max(1.0).default(1.0),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type Location = z.infer<typeof LocationSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type RouteStep = z.infer<typeof RouteStepSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type NavigationSession = z.infer<typeof NavigationSessionSchema>;
export type NavigationPreferences = z.infer<typeof NavigationPreferencesSchema>;

// Export schemas
export const NavigationSchemas = {
  Location: LocationSchema,
  Address: AddressSchema,
  Place: PlaceSchema,
  RouteStep: RouteStepSchema,
  Route: RouteSchema,
  NavigationSession: NavigationSessionSchema,
  NavigationPreferences: NavigationPreferencesSchema,
};
