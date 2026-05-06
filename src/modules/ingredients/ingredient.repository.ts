import { Preference, Ingredient } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export class IngredientRepository {
  findAll(preference?: Preference): Promise<Ingredient[]> {
    return prisma.ingredient.findMany({
      where: preference ? { preference } : undefined,
      orderBy: { name: 'asc' },
    })
  }

  findById(id: string): Promise<Ingredient | null> {
    return prisma.ingredient.findUnique({ where: { id } })
  }

  findByPreference(preference: Preference): Promise<Ingredient[]> {
    return prisma.ingredient.findMany({ where: { preference }, select: { name: true, id: true, category: true, preference: true, createdAt: true } })
  }

  create(data: { name: string; category?: string; preference?: Preference }): Promise<Ingredient> {
    return prisma.ingredient.create({ data })
  }

  upsertByName(data: { name: string; category?: string | null }): Promise<Ingredient> {
    return prisma.ingredient.upsert({
      where: { name: data.name },
      update: { category: data.category ?? undefined },
      create: { name: data.name, category: data.category ?? undefined },
    })
  }

  update(id: string, data: { name?: string; category?: string; preference?: Preference }): Promise<Ingredient> {
    return prisma.ingredient.update({ where: { id }, data })
  }

  delete(id: string): Promise<Ingredient> {
    return prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { ingredientId: id } })
      return tx.ingredient.delete({ where: { id } })
    })
  }
}
