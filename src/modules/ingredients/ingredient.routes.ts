import { Router } from 'express'
import { IngredientController } from './ingredient.controller'
import { validate } from '../../http/middleware/validate'
import { createIngredientSchema, updateIngredientSchema } from './ingredient.schemas'

export function ingredientRouter(controller: IngredientController): Router {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.post('/', validate(createIngredientSchema), controller.create)
  router.put('/:id', validate(updateIngredientSchema), controller.update)
  router.delete('/:id', controller.remove)
  return router
}
