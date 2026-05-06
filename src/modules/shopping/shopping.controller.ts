import { Request, Response, NextFunction } from 'express'
import { ShoppingService } from './shopping.service'

export class ShoppingController {
  constructor(private service: ShoppingService) {}

  getShoppingList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.getShoppingList(req.params['weekPlanId'] as string))
    } catch (err) { next(err) }
  }
}
