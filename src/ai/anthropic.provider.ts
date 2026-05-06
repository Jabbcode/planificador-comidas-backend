import Anthropic from '@anthropic-ai/sdk'
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

export class AnthropicProvider implements IAIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  }

  async generateRecipe(input: RecipeGenInput): Promise<RecipeDraft> {
    const prompt = buildRecipePrompt(input)

    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    // Haiku suele envolver la respuesta en ```json ... ``` aunque se le pida que no
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    const json = JSON.parse(cleaned)
    return recipeDraftSchema.parse(json)
  }
}
