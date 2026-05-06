import { MealType } from '@prisma/client'
import { IAIProvider } from '../../ai/ai.types'
import { IngredientRepository } from '../ingredients/ingredient.repository'
import { IRecipeService } from '../recipes/recipe.service'
import { getMondayOfCurrentWeek } from '../../utils/week'
import { PlanRepository, WeekPlanFull, MealFull } from './plan.repository'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const ALL_MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER']

export interface IPlanService {
  getCurrentPlan(): Promise<WeekPlanFull>
  getPlanById(id: string): Promise<WeekPlanFull>
  generateFull(weekPlanId: string): Promise<WeekPlanFull>
  refreshUnlocked(weekPlanId: string): Promise<WeekPlanFull>
  updateMeal(mealId: string, data: { locked?: boolean; recipeId?: string; notes?: string | null }): Promise<MealFull>
  swapMeal(mealId: string): Promise<MealFull>
}

export class PlanService implements IPlanService {
  constructor(
    private planRepo: PlanRepository,
    private recipeService: IRecipeService,
    private ingredientRepo: IngredientRepository,
    private aiProvider: IAIProvider
  ) {}

  async getCurrentPlan(): Promise<WeekPlanFull> {
    const weekStart = getMondayOfCurrentWeek()
    const existing = await this.planRepo.findByWeekStart(weekStart)
    if (existing) return existing
    const created = await this.planRepo.createWeekPlan(weekStart)
    return (await this.planRepo.findById(created.id))!
  }

  async getPlanById(id: string): Promise<WeekPlanFull> {
    const plan = await this.planRepo.findById(id)
    if (!plan) throw new Error(`WeekPlan ${id} not found`)
    return plan
  }

  private async fetchIngredientContext() {
    const [liked, disliked, all] = await Promise.all([
      this.ingredientRepo.findByPreference('LIKED'),
      this.ingredientRepo.findByPreference('DISLIKED'),
      this.ingredientRepo.findAll(),
    ])
    return {
      likedIngredients: liked.map((i) => i.name),
      dislikedIngredients: disliked.map((i) => i.name),
      existingIngredients: all.map((i) => i.name),
    }
  }

  async generateFull(weekPlanId: string): Promise<WeekPlanFull> {
    const plan = await this.getPlanById(weekPlanId)
    const lockedSet = new Set(plan.meals.filter((m) => m.locked).map((m) => `${m.dayOfWeek}-${m.mealType}`))

    const ingredientCtx = await this.fetchIngredientContext()
    const weekRecipeNames = await this.planRepo.getAllMealNames(weekPlanId)

    for (const day of ALL_DAYS) {
      for (const mealType of ALL_MEAL_TYPES) {
        if (lockedSet.has(`${day}-${mealType}`)) continue

        const draft = await this.aiProvider.generateRecipe({
          mealType,
          ...ingredientCtx,
          avoidRecipeNames: weekRecipeNames,
        })

        const recipe = await this.recipeService.createFromDraft(draft)
        weekRecipeNames.push(recipe.name)

        await this.planRepo.upsertMeal({ weekPlanId, dayOfWeek: day, mealType, recipeId: recipe.id })
      }
    }

    return this.getPlanById(weekPlanId)
  }

  async refreshUnlocked(weekPlanId: string): Promise<WeekPlanFull> {
    const plan = await this.getPlanById(weekPlanId)
    const unlocked = plan.meals.filter((m) => !m.locked)

    const ingredientCtx = await this.fetchIngredientContext()
    const weekRecipeNames = plan.meals.filter((m) => m.locked).map((m) => m.recipe.name)

    for (const meal of unlocked) {
      const draft = await this.aiProvider.generateRecipe({
        mealType: meal.mealType,
        ...ingredientCtx,
        avoidRecipeNames: weekRecipeNames,
      })

      const recipe = await this.recipeService.createFromDraft(draft)
      weekRecipeNames.push(recipe.name)

      await this.planRepo.upsertMeal({
        weekPlanId,
        dayOfWeek: meal.dayOfWeek,
        mealType: meal.mealType,
        recipeId: recipe.id,
      })
    }

    return this.getPlanById(weekPlanId)
  }

  updateMeal(mealId: string, data: { locked?: boolean; recipeId?: string; notes?: string | null }): Promise<MealFull> {
    return this.planRepo.updateMeal(mealId, data) as Promise<MealFull>
  }

  async swapMeal(mealId: string): Promise<MealFull> {
    const meal = await this.planRepo.getMealById(mealId)
    if (!meal) throw new Error(`Meal ${mealId} not found`)

    const [ingredientCtx, weekNames] = await Promise.all([
      this.fetchIngredientContext(),
      this.planRepo.getAllMealNames(meal.weekPlanId),
    ])

    const draft = await this.aiProvider.generateRecipe({
      mealType: meal.mealType,
      ...ingredientCtx,
      avoidRecipeNames: weekNames,
    })

    const recipe = await this.recipeService.createFromDraft(draft)
    return this.planRepo.updateMeal(mealId, { recipeId: recipe.id }) as Promise<MealFull>
  }
}
