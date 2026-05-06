import { z } from 'zod'

export const createIngredientSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  preference: z.enum(['LIKED', 'DISLIKED', 'NEUTRAL']).optional(),
})

export const updateIngredientSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  preference: z.enum(['LIKED', 'DISLIKED', 'NEUTRAL']).optional(),
})
