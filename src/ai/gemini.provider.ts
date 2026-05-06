import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { IAIProvider, RecipeDraft, RecipeGenInput } from './ai.types'
import { buildRecipePrompt } from './prompts'
import { env } from '../config/env'

const recipeDraftSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  prepTime: z.number(),
  calories: z.number(),
  servings: z.number(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().nullable(),
      unit: z.string().nullable(),
      category: z.string().nullable(),
    })
  ),
})

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI

  constructor() {
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY!)
  }

  async generateRecipe(input: RecipeGenInput): Promise<RecipeDraft> {
    const model = this.client.getGenerativeModel({ model: 'gemini-3-flash-preview' })
    const prompt = buildRecipePrompt(input)

    const result = await model.generateContent(prompt)
    const raw = result.response.text()

    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    const json = JSON.parse(cleaned)
    return recipeDraftSchema.parse(json)
  }
}
