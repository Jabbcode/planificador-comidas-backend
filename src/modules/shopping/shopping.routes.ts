import { Router } from 'express'
import { ShoppingController } from './shopping.controller'

export function shoppingRouter(controller: ShoppingController): Router {
  const router = Router()
  router.get('/:weekPlanId/shopping-list', controller.getShoppingList)
  return router
}
