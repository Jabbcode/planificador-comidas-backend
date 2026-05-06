import { Ingredient, Preference } from '@prisma/client'
import { IngredientRepository } from './ingredient.repository'

export interface IIngredientService {
  getAll(preference?: Preference): Promise<Ingredient[]>
  getById(id: string): Promise<Ingredient>
  create(data: { name: string; category?: string; preference?: Preference }): Promise<Ingredient>
  update(id: string, data: { name?: string; category?: string; preference?: Preference }): Promise<Ingredient>
  remove(id: string): Promise<void>
}

export class IngredientService implements IIngredientService {
  constructor(private repo: IngredientRepository) {}

  getAll(preference?: Preference): Promise<Ingredient[]> {
    return this.repo.findAll(preference)
  }

  async getById(id: string): Promise<Ingredient> {
    const ingredient = await this.repo.findById(id)
    if (!ingredient) throw new Error(`Ingredient ${id} not found`)
    return ingredient
  }

  create(data: { name: string; category?: string; preference?: Preference }): Promise<Ingredient> {
    return this.repo.create(data)
  }

  async update(id: string, data: { name?: string; category?: string; preference?: Preference }): Promise<Ingredient> {
    await this.getById(id)
    return this.repo.update(id, data)
  }

  async remove(id: string): Promise<void> {
    await this.getById(id)
    await this.repo.delete(id)
  }
}
