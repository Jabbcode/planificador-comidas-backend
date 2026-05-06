import { MealType, Recipe } from '@prisma/client'
import { prisma } from '../../lib/prisma'

const recipeWithIngredients = {
  ingredients: { include: { ingredient: true } },
} as const

export type RecipeWithIngredients = Recipe & {
  ingredients: Array<{
    id: string
    quantity: number | null
    unit: string | null
    ingredient: { id: string; name: string; category: string | null; preference: string }
  }>
}

export class RecipeRepository {
  findAll(mealType?: MealType): Promise<RecipeWithIngredients[]> {
    return prisma.recipe.findMany({
      where: mealType ? { mealType } : undefined,
      include: recipeWithIngredients,
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string): Promise<RecipeWithIngredients | null> {
    return prisma.recipe.findUnique({ where: { id }, include: recipeWithIngredients })
  }

  findByMealType(mealType: MealType): Promise<Recipe[]> {
    return prisma.recipe.findMany({ where: { mealType } })
  }

  // Busca primero por nombre exacto, luego insensible a mayúsculas, y solo crea si no existe ninguno.
  private async resolveIngredient(ing: {
    name: string
    quantity?: number | null
    unit?: string | null
    category?: string | null
  }) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: { equals: ing.name, mode: 'insensitive' } },
    })
    const ingredient = existing ?? await prisma.ingredient.create({
      data: { name: ing.name, category: ing.category ?? undefined },
    })
    return { ingredientId: ingredient.id, quantity: ing.quantity ?? null, unit: ing.unit ?? null }
  }

  async create(data: {
    name: string
    mealType: MealType
    description?: string
    instructions?: string
    prepTime?: number
    calories?: number
    servings?: number
    imageUrl?: string
    aiGenerated?: boolean
    ingredients?: Array<{ name: string; quantity?: number | null; unit?: string | null; category?: string | null }>
  }): Promise<RecipeWithIngredients> {
    const { ingredients, ...recipeData } = data

    return prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: ingredients
          ? { create: await Promise.all(ingredients.map((ing) => this.resolveIngredient(ing))) }
          : undefined,
      },
      include: recipeWithIngredients,
    })
  }

  async update(id: string, data: Partial<{
    name: string
    mealType: MealType
    description: string
    instructions: string
    prepTime: number
    calories: number
    servings: number
    imageUrl: string
    ingredients: Array<{ name: string; quantity?: number | null; unit?: string | null; category?: string | null }>
  }>): Promise<RecipeWithIngredients> {
    const { ingredients, ...recipeData } = data

    if (ingredients) {
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } })
    }

    return prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ingredients: ingredients
          ? { create: await Promise.all(ingredients.map((ing) => this.resolveIngredient(ing))) }
          : undefined,
      },
      include: recipeWithIngredients,
    })
  }

  delete(id: string): Promise<Recipe> {
    return prisma.recipe.delete({ where: { id } })
  }
}
