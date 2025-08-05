import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredientId, type, quantity, reason } = body;

    // Start a transaction to update stock and record movement
    const result = await prisma.$transaction(async (tx) => {
      // Get current ingredient
      const ingredient = await tx.ingredient.findUnique({
        where: { id: ingredientId },
      });

      if (!ingredient) {
        throw new Error('Ingredient not found');
      }

      // Calculate new stock
      let newStock = ingredient.currentStock;
      if (type === 'IN') {
        newStock += quantity;
      } else if (type === 'OUT') {
        newStock -= quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock');
        }
      } else if (type === 'ADJUST') {
        newStock = quantity;
      }

      // Update ingredient stock
      const updatedIngredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: newStock },
      });

      // Record stock movement
      const movement = await tx.stockMovement.create({
        data: {
          ingredientId,
          type,
          quantity,
          reason,
        },
      });

      return { ingredient: updatedIngredient, movement };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
