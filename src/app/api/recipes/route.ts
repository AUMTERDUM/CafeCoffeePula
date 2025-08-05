import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                unit: true,
                costPerUnit: true,
                currentStock: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, instructions, prepTime, ingredients } = body;

    const recipe = await prisma.$transaction(async (tx) => {
      // Create recipe
      const newRecipe = await tx.recipe.create({
        data: {
          productId,
          instructions,
          prepTime,
        },
      });

      // Add ingredients to recipe
      if (ingredients && ingredients.length > 0) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((ing: any) => ({
            recipeId: newRecipe.id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        });
      }

      // Return recipe with full data
      return await tx.recipe.findUnique({
        where: { id: newRecipe.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
            },
          },
          ingredients: {
            include: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  costPerUnit: true,
                  currentStock: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
