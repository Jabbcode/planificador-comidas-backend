import { Request, Response, NextFunction } from 'express'
import { IPlanService } from './plan.service'

export class PlanController {
  constructor(private service: IPlanService) {}

  getCurrent = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getCurrentPlan())
    } catch (err) { next(err) }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getPlanById(req.params['id'] as string))
    } catch (err) { next(err) }
  }

  generate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { weekPlanId } = req.body as { weekPlanId?: string }
      let id = weekPlanId
      if (!id) {
        const plan = await this.service.getCurrentPlan()
        id = plan.id
      }
      res.json(await this.service.generateFull(id))
    } catch (err) { next(err) }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { weekPlanId } = req.body as { weekPlanId?: string }
      let id = weekPlanId
      if (!id) {
        const plan = await this.service.getCurrentPlan()
        id = plan.id
      }
      res.json(await this.service.refreshUnlocked(id))
    } catch (err) { next(err) }
  }

  updateMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.updateMeal(req.params['mealId'] as string, req.body))
    } catch (err) { next(err) }
  }

  swapMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.swapMeal(req.params['mealId'] as string))
    } catch (err) { next(err) }
  }
}
