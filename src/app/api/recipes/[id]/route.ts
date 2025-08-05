import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { instructions, prepTime, ingredients } = body;
    const recipeId = params.id;

    const updatedRecipe = await prisma.$transaction(async (tx) => {
      // Update recipe basic info
      const recipe = await tx.recipe.update({
        where: { id: recipeId },
        data: {
          instructions,
          prepTime,
        },
      });

      // Delete existing recipe ingredients
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      // Add new ingredients
      if (ingredients && ingredients.length > 0) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((ing: any) => ({
            recipeId,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        });
      }

      // Return updated recipe with full data
      return await tx.recipe.findUnique({
        where: { id: recipeId },
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

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = params.id;

    await prisma.$transaction(async (tx) => {
      // Delete recipe ingredients first
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      // Delete recipe
      await tx.recipe.delete({
        where: { id: recipeId },
      });
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
