import { MealType } from '@prisma/client'
import { RecipeDraft } from '../../ai/ai.types'
import { RecipeRepository, RecipeWithIngredients } from './recipe.repository'

export interface IRecipeService {
  getAll(mealType?: MealType): Promise<RecipeWithIngredients[]>
  getById(id: string): Promise<RecipeWithIngredients>
  create(data: CreateRecipeInput): Promise<RecipeWithIngredients>
  createFromDraft(draft: RecipeDraft): Promise<RecipeWithIngredients>
  update(id: string, data: Partial<CreateRecipeInput>): Promise<RecipeWithIngredients>
  remove(id: string): Promise<void>
}

export interface CreateRecipeInput {
  name: string
  mealType: MealType
  description?: string
  instructions?: string
  prepTime?: number
  calories?: number
  servings?: number
  imageUrl?: string
  ingredients?: Array<{ name: string; quantity?: number | null; unit?: string | null; category?: string | null }>
}

export class RecipeService implements IRecipeService {
  constructor(private repo: RecipeRepository) {}

  getAll(mealType?: MealType): Promise<RecipeWithIngredients[]> {
    return this.repo.findAll(mealType)
  }

  async getById(id: string): Promise<RecipeWithIngredients> {
    const recipe = await this.repo.findById(id)
    if (!recipe) throw new Error(`Recipe ${id} not found`)
    return recipe
  }

  create(data: CreateRecipeInput): Promise<RecipeWithIngredients> {
    return this.repo.create(data)
  }

  createFromDraft(draft: RecipeDraft): Promise<RecipeWithIngredients> {
    return this.repo.create({ ...draft, aiGenerated: true })
  }

  async update(id: string, data: Partial<CreateRecipeInput>): Promise<RecipeWithIngredients> {
    await this.getById(id)
    return this.repo.update(id, data)
  }

  async remove(id: string): Promise<void> {
    await this.getById(id)
    await this.repo.delete(id)
  }
}
