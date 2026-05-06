import { Router } from 'express'
import { PlanController } from './plan.controller'
import { validate } from '../../http/middleware/validate'
import { updateMealSchema } from './plan.schemas'

export function planRouter(controller: PlanController): Router {
  const router = Router()
  router.get('/current', controller.getCurrent)
  router.get('/:id', controller.getById)
  router.post('/generate', controller.generate)
  router.post('/refresh', controller.refresh)
  router.put('/meals/:mealId', validate(updateMealSchema), controller.updateMeal)
  router.post('/meals/:mealId/swap', controller.swapMeal)
  router.delete('/meals/:mealId', controller.deleteMeal)
  return router
}
