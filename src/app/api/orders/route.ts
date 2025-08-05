import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { items, customerName } = await request.json();

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order with inventory deduction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order first
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          status: 'PENDING',
          customerName,
          items: {
            create: items.map((item: any) => ({
              productId: item.menuId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  recipe: {
                    include: {
                      ingredients: {
                        include: {
                          ingredient: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Deduct ingredients from inventory
      for (const orderItem of newOrder.items) {
        if (orderItem.product.recipe) {
          for (const recipeIngredient of orderItem.product.recipe.ingredients) {
            const totalNeeded = recipeIngredient.quantity * orderItem.quantity;
            
            // Check if enough stock
            if (recipeIngredient.ingredient.currentStock < totalNeeded) {
              throw new Error(
                `ไม่มี ${recipeIngredient.ingredient.name} เพียงพอ (ต้องการ ${totalNeeded} ${recipeIngredient.ingredient.unit}, มีเหลือ ${recipeIngredient.ingredient.currentStock} ${recipeIngredient.ingredient.unit})`
              );
            }

            // Deduct stock
            await tx.ingredient.update({
              where: { id: recipeIngredient.ingredientId },
              data: {
                currentStock: {
                  decrement: totalNeeded,
                },
              },
            });

            // Record stock movement
            await tx.stockMovement.create({
              data: {
                ingredientId: recipeIngredient.ingredientId,
                type: 'OUT',
                quantity: totalNeeded,
                reason: `ขาย - ${orderItem.product.name}`,
                reference: newOrder.id,
              },
            });
          }
        }
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Return specific error message if it's a stock issue
    if (error instanceof Error && error.message.includes('ไม่มี')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
