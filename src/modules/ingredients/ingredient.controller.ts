import { Request, Response, NextFunction } from 'express'
import { IIngredientService } from './ingredient.service'
import { Preference } from '@prisma/client'

export class IngredientController {
  constructor(private service: IIngredientService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const preference = req.query['preference'] as Preference | undefined
      const items = await this.service.getAll(preference)
      res.json(items)
    } catch (err) { next(err) }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.getById(req.params['id'] as string)
      res.json(item)
    } catch (err) { next(err) }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.create(req.body)
      res.status(201).json(item)
    } catch (err) { next(err) }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.update(req.params['id'] as string, req.body)
      res.json(item)
    } catch (err) { next(err) }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(req.params['id'] as string)
      res.status(204).send()
    } catch (err) { next(err) }
  }
}
