import { MealType } from '@prisma/client'
import { RecipeGenInput } from './ai.types'

const MEAL_TYPE_ES: Record<MealType, string> = {
  BREAKFAST: 'desayuno',
  LUNCH: 'almuerzo',
  DINNER: 'cena',
}

export function buildRecipePrompt(input: RecipeGenInput): string {
  const mealTypeEs = MEAL_TYPE_ES[input.mealType]

  const catalogSection = input.existingIngredients.length > 0
    ? `CATÁLOGO DE INGREDIENTES DISPONIBLES (usa EXACTAMENTE estos nombres, respetando mayúsculas y tildes):
${input.existingIngredients.map((n) => `- ${n}`).join('\n')}

REGLA CRÍTICA: Para cada ingrediente de la receta, PRIMERO busca si existe en el catálogo anterior y usa ese nombre exacto. Solo inventa un nombre nuevo si el ingrediente no tiene ningún equivalente en el catálogo.`
    : ''

  const liked = input.likedIngredients.length > 0
    ? `Ingredientes preferidos del usuario (prioriza incluirlos si encajan en la receta): ${input.likedIngredients.join(', ')}.`
    : ''

  const disliked = input.dislikedIngredients.length > 0
    ? `Ingredientes que el usuario NO quiere (NO los incluyas bajo ningún concepto): ${input.dislikedIngredients.join(', ')}.`
    : ''

  const avoid = input.avoidRecipeNames && input.avoidRecipeNames.length > 0
    ? `Recetas ya planificadas esta semana (NO repitas ninguna): ${input.avoidRecipeNames.join(', ')}.`
    : ''

  const extra = input.extraConstraints
    ? `Restricciones adicionales: ${input.extraConstraints}.`
    : ''

  return `Eres un chef experto. Genera UNA receta de ${mealTypeEs} saludable y deliciosa.

${catalogSection}

${liked}
${disliked}
${avoid}
${extra}

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional, con esta estructura exacta:
{
  "name": "Nombre de la receta",
  "description": "Descripción breve apetitosa (1-2 frases)",
  "instructions": "Pasos numerados separados por salto de línea",
  "prepTime": 20,
  "calories": 350,
  "servings": 2,
  "mealType": "${input.mealType}",
  "ingredients": [
    { "name": "Nombre exacto del ingrediente", "quantity": 200, "unit": "g", "category": "proteína" }
  ]
}

Reglas del JSON:
- "calories" es por porción individual.
- "prepTime" en minutos (número entero).
- "quantity" puede ser null si no aplica (p.ej. sal al gusto).
- "category" debe ser uno de: proteína, verdura, carbohidrato, lácteo, fruta, grasa, condimento, salsa, otro.
- Incluye entre 4 y 10 ingredientes.`
}
