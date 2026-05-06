import { AnthropicProvider } from './ai/anthropic.provider'
import { IngredientRepository } from './modules/ingredients/ingredient.repository'
import { IngredientService } from './modules/ingredients/ingredient.service'
import { IngredientController } from './modules/ingredients/ingredient.controller'
import { RecipeRepository } from './modules/recipes/recipe.repository'
import { RecipeService } from './modules/recipes/recipe.service'
import { RecipeController } from './modules/recipes/recipe.controller'
import { PlanRepository } from './modules/plans/plan.repository'
import { PlanService } from './modules/plans/plan.service'
import { PlanController } from './modules/plans/plan.controller'
import { ShoppingService } from './modules/shopping/shopping.service'
import { ShoppingController } from './modules/shopping/shopping.controller'

export function buildContainer() {
  const aiProvider = new AnthropicProvider()

  const ingredientRepo = new IngredientRepository()
  const ingredientService = new IngredientService(ingredientRepo)
  const ingredientController = new IngredientController(ingredientService)

  const recipeRepo = new RecipeRepository()
  const recipeService = new RecipeService(recipeRepo)
  const recipeController = new RecipeController(recipeService, aiProvider, ingredientRepo)

  const planRepo = new PlanRepository()
  const planService = new PlanService(planRepo, recipeService, ingredientRepo, aiProvider)
  const planController = new PlanController(planService)

  const shoppingService = new ShoppingService()
  const shoppingController = new ShoppingController(shoppingService)

  return { ingredientController, recipeController, planController, shoppingController }
}
