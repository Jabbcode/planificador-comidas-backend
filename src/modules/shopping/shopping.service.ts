import { prisma } from '../../lib/prisma'

export interface ShoppingItem {
  ingredientId: string
  name: string
  totalQuantity: number | null
  unit: string | null
  category: string
}

export interface ShoppingCategory {
  category: string
  items: ShoppingItem[]
}

export class ShoppingService {
  async getShoppingList(weekPlanId: string): Promise<ShoppingCategory[]> {
    const meals = await prisma.planMeal.findMany({
      where: { weekPlanId },
      include: {
        recipe: {
          include: {
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    })

    const aggregated = new Map<string, ShoppingItem>()

    for (const meal of meals) {
      for (const ri of meal.recipe.ingredients) {
        const key = ri.ingredientId
        const existing = aggregated.get(key)

        if (existing) {
          if (existing.unit === ri.unit && ri.quantity !== null) {
            existing.totalQuantity = (existing.totalQuantity ?? 0) + ri.quantity
          }
        } else {
          aggregated.set(key, {
            ingredientId: ri.ingredientId,
            name: ri.ingredient.name,
            totalQuantity: ri.quantity,
            unit: ri.unit,
            category: ri.ingredient.category ?? 'otro',
          })
        }
      }
    }

    const grouped = new Map<string, ShoppingItem[]>()
    for (const item of aggregated.values()) {
      const cat = item.category
      if (!grouped.has(cat)) grouped.set(cat, [])
      grouped.get(cat)!.push(item)
    }

    return Array.from(grouped.entries())
      .map(([category, items]) => ({ category, items: items.sort((a, b) => a.name.localeCompare(b.name)) }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }
}
