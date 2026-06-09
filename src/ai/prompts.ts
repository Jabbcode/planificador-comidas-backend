import { MealType } from '@prisma/client'
import { RecipeGenInput } from './ai.types'

const MEAL_RULES: Record<MealType, string> = {
  BREAKFAST: `TIPO DE COMIDA: DESAYUNO
- Recetas rápidas y sencillas. Tiempo máximo de preparación: 15 minutos.
- Las recetas simples de 1 a 3 ingredientes son completamente válidas y deseables (ej: "Cereal con leche", "Avena con cambur", "Pan con mantequilla y queso").
- Cuando haya harina de maíz PAN disponible, prioriza arepas con distintos rellenos (queso, huevo, carne mechada, caraotas) para dar variedad.
- Apropiado: arepas rellenas, perico, cachapas con queso, panquecas con miel o mermelada, mandocas, pastelitos de queso, empanadas de desayuno, tostadas francesas, revoltillo de atún con huevo, caraotas con huevo frito, huevos benedictinos, avena con frutas, cereal con leche, yogur con frutas, batidos, pan con queso, tostadas con aguacate.
- NO apropiado: carnes rojas, guisos, arroces como plato principal, legumbres como plato principal, frituras pesadas.`,
  LUNCH: `TIPO DE COMIDA: ALMUERZO
- Comida principal del día: completa, nutritiva y saciante. Tiempo de preparación: 20-45 minutos.
- Estructura: proteína principal + acompañamiento. El acompañamiento puede ser arroz, pasta, yuca, plátano (tajadas o tostones), ensalada o caraotas — varía, no uses arroz todos los días.
- Porciones generosas. Platos reconocibles de cocina casera venezolana o latina.
- Apropiado: pollo guisado, carne mechada, asado negro, pescado, pabellón criollo, bistec, cerdo, legumbres con acompañamiento.`,
  DINNER: `TIPO DE COMIDA: CENA
- Comida ligera y de fácil digestión. Tiempo máximo de preparación: 25 minutos.
- Apropiado: ensaladas completas, verduras a la plancha o al horno, huevos revueltos con vegetales, tortillas, pescados ligeros, caraotas con plátano, arepas con rellenos ligeros, panquecas con queso o miel, tostadas con aguacate.
- Evitar: sopas, cremas, hervidos, sancochos, carnes rojas muy grasas, frituras abundantes, platos muy calóricos o pesados.`,
}

export function buildSystemPrompt(): string {
  return `Eres un chef experto en gastronomía venezolana y cocina criolla latinoamericana. Generas recetas reales, coherentes y deliciosas con identidad cultural venezolana.

ESTILO CULINARIO:
- Prioriza platillos venezolanos y criollos reconocibles cuando los ingredientes lo permitan.
- Referencias por tipo de comida:
  - Desayuno: arepas rellenas, perico, cachapas con queso, panquecas con miel o mermelada, mandocas, pastelitos de queso, empanadas de desayuno, tostadas francesas, caraotas con huevo frito, avena con frutas, cereal con leche, yogur con frutas, pan con queso.
  - Almuerzo: pabellón criollo, carne mechada, asado negro, pollo guisado, bistec a caballo, pescado frito con yuca, cerdo con caraotas y tajadas.
  - Cena: ensalada de aguacate, caraotas con plátano, arepas con relleno ligero, pescado a la plancha con ensalada, huevos revueltos con vegetales, panquecas con queso o miel, tostadas con aguacate.
- Si los ingredientes disponibles no permiten un platillo venezolano, genera cocina latina o casera coherente.

REGLAS DE COHERENCIA DE INGREDIENTES:
- Cada receta debe tener una estructura clara: proteína principal (si aplica) + acompañamiento coherente + condimentos que complementen.
- Combina solo ingredientes que se usen juntos en la cocina real. No mezcles tradiciones culinarias muy distintas sin un concepto claro.
- Los nombres de recetas deben ser reconocibles y apetitosos.

REGLAS DE HORARIO:
- Respeta estrictamente qué tipo de alimentos encajan en cada momento del día.
- Un plato típico de desayuno nunca debe aparecer como almuerzo o cena, y viceversa.`
}

export function buildRecipePrompt(input: RecipeGenInput): string {
  const mealRules = MEAL_RULES[input.mealType]

  const catalogSection = input.existingIngredients.length > 0
    ? `CATÁLOGO DE INGREDIENTES DISPONIBLES (usa EXACTAMENTE estos nombres, respetando mayúsculas y tildes):
${input.existingIngredients.map((n) => `- ${n}`).join('\n')}

Para cada ingrediente de la receta, busca primero en este catálogo y usa el nombre exacto. Solo inventa un nombre nuevo si no existe ningún equivalente.`
    : ''

  const liked = input.likedIngredients.length > 0
    ? `Ingredientes preferidos (prioriza incluirlos si encajan en la receta): ${input.likedIngredients.join(', ')}.`
    : ''

  const disliked = input.dislikedIngredients.length > 0
    ? `Ingredientes que NO debe incluir bajo ningún concepto: ${input.dislikedIngredients.join(', ')}.`
    : ''

  const avoid = input.avoidRecipeNames?.length
    ? `Recetas ya planificadas esta semana (NO repetir ninguna): ${input.avoidRecipeNames.join(', ')}.`
    : ''

  const extra = input.extraConstraints
    ? `Restricciones adicionales: ${input.extraConstraints}.`
    : ''

  const sections = [mealRules, catalogSection, liked, disliked, avoid, extra]
    .filter(Boolean)
    .join('\n\n')

  return `${sections}

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional:
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
- "mealType" debe ser EXACTAMENTE "${input.mealType}" — no traducir, no cambiar por ningún motivo.
- "calories" es por porción individual.
- "prepTime" en minutos (número entero).
- "quantity" puede ser null si no aplica (p.ej. sal al gusto).
- "category" debe ser uno de: proteína, verdura, carbohidrato, lácteo, fruta, grasa, condimento, salsa, otro.
- Incluye entre 4 y 10 ingredientes.`
}
