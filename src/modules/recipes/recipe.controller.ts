import { Request, Response, NextFunction } from 'express'
import { MealType } from '@prisma/client'
import { IRecipeService } from './recipe.service'
import { IAIProvider } from '../../ai/ai.types'
import { IngredientRepository } from '../ingredients/ingredient.repository'

export class RecipeController {
  constructor(
    private service: IRecipeService,
    private aiProvider: IAIProvider,
    private ingredientRepo: IngredientRepository
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mealType = req.query['mealType'] as MealType | undefined
      res.json(await this.service.getAll(mealType))
    } catch (err) { next(err) }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getById(req.params['id'] as string))
    } catch (err) { next(err) }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(await this.service.create(req.body))
    } catch (err) { next(err) }
  }

  generate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mealType, extraConstraints } = req.body as { mealType: MealType; extraConstraints?: string }

      const [liked, disliked, all, existingRecipes] = await Promise.all([
        this.ingredientRepo.findByPreference('LIKED'),
        this.ingredientRepo.findByPreference('DISLIKED'),
        this.ingredientRepo.findAll(),
        this.service.getAll(mealType),
      ])

      const draft = await this.aiProvider.generateRecipe({
        mealType,
        likedIngredients: liked.map((i) => i.name),
        dislikedIngredients: disliked.map((i) => i.name),
        existingIngredients: all.map((i) => i.name),
        avoidRecipeNames: existingRecipes.map((r) => r.name),
        extraConstraints,
      })

      const recipe = await this.service.createFromDraft(draft)
      res.status(201).json(recipe)
    } catch (err) { next(err) }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.update(req.params['id'] as string, req.body))
    } catch (err) { next(err) }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params['id'] as string)
      res.status(204).send()
    } catch (err) { next(err) }
  }
}
