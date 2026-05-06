import { MealType } from '@prisma/client'

export interface RecipeGenInput {
  mealType: MealType
  likedIngredients: string[]
  dislikedIngredients: string[]
  existingIngredients: string[]   // catálogo completo — Claude debe usar estos nombres exactos
  avoidRecipeNames?: string[]
  extraConstraints?: string
}

export interface RecipeIngredientDraft {
  name: string
  quantity: number | null
  unit: string | null
  category: string | null
}

export interface RecipeDraft {
  name: string
  description: string
  instructions: string
  prepTime: number
  calories: number
  servings: number
  mealType: MealType
  ingredients: RecipeIngredientDraft[]
}

export interface IAIProvider {
  generateRecipe(input: RecipeGenInput): Promise<RecipeDraft>
}
