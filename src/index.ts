import './config/env'
import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { errorHandler } from './http/middleware/error'
import { buildContainer } from './container'
import { ingredientRouter } from './modules/ingredients/ingredient.routes'
import { recipeRouter } from './modules/recipes/recipe.routes'
import { planRouter } from './modules/plans/plan.routes'
import { shoppingRouter } from './modules/shopping/shopping.routes'

const app = express()

app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())

const { ingredientController, recipeController, planController, shoppingController } = buildContainer()

app.use('/api/ingredients', ingredientRouter(ingredientController))
app.use('/api/recipes', recipeRouter(recipeController))
app.use('/api/plans', planRouter(planController))
app.use('/api/plans', shoppingRouter(shoppingController))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`🚀 NutriPlan API running on http://localhost:${env.PORT}`)
})
