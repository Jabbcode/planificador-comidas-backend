import { MealType, PlanMeal, WeekPlan } from '@prisma/client'
import { prisma } from '../../lib/prisma'

const mealWithRecipe = {
  recipe: {
    include: { ingredients: { include: { ingredient: true } } },
  },
} as const

export type WeekPlanFull = WeekPlan & { meals: MealFull[] }
export type MealFull = PlanMeal & { recipe: { id: string; name: string; description: string | null; prepTime: number | null; calories: number | null; mealType: MealType; aiGenerated: boolean; ingredients: unknown[] } }

export class PlanRepository {
  findByWeekStart(weekStart: Date): Promise<WeekPlanFull | null> {
    return prisma.weekPlan.findUnique({
      where: { weekStart },
      include: { meals: { include: mealWithRecipe } },
    }) as Promise<WeekPlanFull | null>
  }

  findById(id: string): Promise<WeekPlanFull | null> {
    return prisma.weekPlan.findUnique({
      where: { id },
      include: { meals: { include: mealWithRecipe } },
    }) as Promise<WeekPlanFull | null>
  }

  createWeekPlan(weekStart: Date): Promise<WeekPlan> {
    return prisma.weekPlan.create({ data: { weekStart } })
  }

  upsertMeal(data: {
    weekPlanId: string
    dayOfWeek: number
    mealType: MealType
    recipeId: string
    locked?: boolean
  }): Promise<PlanMeal> {
    return prisma.planMeal.upsert({
      where: { weekPlanId_dayOfWeek_mealType: { weekPlanId: data.weekPlanId, dayOfWeek: data.dayOfWeek, mealType: data.mealType } },
      update: { recipeId: data.recipeId, locked: data.locked ?? false },
      create: data,
    })
  }

  updateMeal(id: string, data: { locked?: boolean; recipeId?: string; notes?: string | null }): Promise<PlanMeal> {
    return prisma.planMeal.update({ where: { id }, data })
  }

  getMealById(id: string): Promise<MealFull | null> {
    return prisma.planMeal.findUnique({ where: { id }, include: mealWithRecipe }) as Promise<MealFull | null>
  }

  getUnlockedMeals(weekPlanId: string): Promise<PlanMeal[]> {
    return prisma.planMeal.findMany({ where: { weekPlanId, locked: false } })
  }

  deleteMeal(id: string): Promise<PlanMeal> {
    return prisma.planMeal.delete({ where: { id } })
  }

  getAllMealNames(weekPlanId: string): Promise<string[]> {
    return prisma.planMeal
      .findMany({ where: { weekPlanId }, include: { recipe: { select: { name: true } } } })
      .then((meals) => meals.map((m) => (m as unknown as { recipe: { name: string } }).recipe.name))
  }
}
