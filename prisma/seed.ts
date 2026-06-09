import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const isReset = process.argv.includes('--reset')

const ingredients = [
  // Proteínas
  { name: 'Pollo', category: 'proteína' },
  { name: 'Carne de res', category: 'proteína' },
  { name: 'Cerdo', category: 'proteína' },
  { name: 'Pernil de cerdo', category: 'proteína' },
  { name: 'Atún en lata', category: 'proteína' },
  { name: 'Sardinas', category: 'proteína' },
  { name: 'Camarones', category: 'proteína' },
  { name: 'Huevos', category: 'proteína' },
  { name: 'Caraotas negras', category: 'proteína' },
  { name: 'Caraotas rojas', category: 'proteína' },
  { name: 'Lentejas', category: 'proteína' },
  { name: 'Chicharrón', category: 'proteína' },

  // Carbohidratos
  { name: 'Harina de maíz PAN', category: 'carbohidrato' },
  { name: 'Arroz blanco', category: 'carbohidrato' },
  { name: 'Plátano', category: 'carbohidrato' },
  { name: 'Yuca', category: 'carbohidrato' },
  { name: 'Papa', category: 'carbohidrato' },
  { name: 'Pasta', category: 'carbohidrato' },
  { name: 'Pan de sándwich', category: 'carbohidrato' },
  { name: 'Ocumo', category: 'carbohidrato' },
  { name: 'Ñame', category: 'carbohidrato' },

  // Verduras
  { name: 'Tomate', category: 'verdura' },
  { name: 'Cebolla', category: 'verdura' },
  { name: 'Ají dulce', category: 'verdura' },
  { name: 'Pimentón rojo', category: 'verdura' },
  { name: 'Pimentón verde', category: 'verdura' },
  { name: 'Ajo', category: 'verdura' },
  { name: 'Cilantro', category: 'verdura' },
  { name: 'Aguacate', category: 'verdura' },
  { name: 'Auyama', category: 'verdura' },
  { name: 'Repollo', category: 'verdura' },
  { name: 'Zanahoria', category: 'verdura' },
  { name: 'Apio España', category: 'verdura' },
  { name: 'Calabacín', category: 'verdura' },
  { name: 'Berenjena', category: 'verdura' },
  { name: 'Espinaca', category: 'verdura' },

  // Lácteos
  { name: 'Queso blanco', category: 'lácteo' },
  { name: 'Queso llanero', category: 'lácteo' },
  { name: 'Queso amarillo', category: 'lácteo' },
  { name: 'Mantequilla', category: 'lácteo' },
  { name: 'Leche', category: 'lácteo' },
  { name: 'Margarina', category: 'lácteo' },

  // Frutas
  { name: 'Cambur', category: 'fruta' },
  { name: 'Mango', category: 'fruta' },
  { name: 'Parchita', category: 'fruta' },
  { name: 'Naranja', category: 'fruta' },
  { name: 'Mandarina', category: 'fruta' },
  { name: 'Limón', category: 'fruta' },
  { name: 'Lechosa', category: 'fruta' },
  { name: 'Piña', category: 'fruta' },

  // Grasas
  { name: 'Aceite de maíz', category: 'grasa' },
  { name: 'Aceite de oliva', category: 'grasa' },
  { name: 'Manteca vegetal', category: 'grasa' },

  // Condimentos
  { name: 'Sal', category: 'condimento' },
  { name: 'Pimienta negra', category: 'condimento' },
  { name: 'Comino', category: 'condimento' },
  { name: 'Orégano', category: 'condimento' },
  { name: 'Onoto', category: 'condimento' },
  { name: 'Papelón', category: 'condimento' },
  { name: 'Vinagre', category: 'condimento' },
  { name: 'Azúcar', category: 'condimento' },
  { name: 'Ajo en polvo', category: 'condimento' },
  { name: 'Salsa inglesa', category: 'condimento' },

  // Salsas
  { name: 'Salsa de tomate', category: 'salsa' },
  { name: 'Mostaza', category: 'salsa' },
  { name: 'Mayonesa', category: 'salsa' },
  { name: 'Miel', category: 'salsa' },
  { name: 'Mermelada', category: 'salsa' },

  // Embutidos
  { name: 'Jamón', category: 'proteína' },
]

async function main() {
  if (isReset) {
    console.log('Modo reset: limpiando datos existentes...')
    await prisma.planMeal.deleteMany({})
    await prisma.recipeIngredient.deleteMany({})
    await prisma.recipe.deleteMany({})
    await prisma.ingredient.deleteMany({})
    console.log('Datos eliminados.')
  }

  const result = await prisma.ingredient.createMany({
    data: ingredients,
    skipDuplicates: true,
  })
  console.log(`Ingredientes insertados: ${result.count}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
