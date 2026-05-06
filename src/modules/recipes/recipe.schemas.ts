import { z } from 'zod'

const ingredientItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
})

export const createRecipeSchema = z.object({
  name: z.string().min(1),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  description: z.string().optional(),
  instructions: z.string().optional(),
  prepTime: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  ingredients: z.array(ingredientItemSchema).optional(),
})

export const updateRecipeSchema = createRecipeSchema.partial()

export const generateRecipeSchema = z.object({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  extraConstraints: z.string().optional(),
})
