import { z } from 'zod'

export const updateMealSchema = z.object({
  locked: z.boolean().optional(),
  recipeId: z.string().optional(),
  notes: z.string().nullable().optional(),
})
