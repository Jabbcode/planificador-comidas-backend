import { Router } from 'express'
import { RecipeController } from './recipe.controller'
import { validate } from '../../http/middleware/validate'
import { createRecipeSchema, generateRecipeSchema, updateRecipeSchema } from './recipe.schemas'

export function recipeRouter(controller: RecipeController): Router {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  router.post('/generate', validate(generateRecipeSchema), controller.generate)
  router.post('/', validate(createRecipeSchema), controller.create)
  router.put('/:id', validate(updateRecipeSchema), controller.update)
  router.delete('/:id', controller.remove)
  return router
}
