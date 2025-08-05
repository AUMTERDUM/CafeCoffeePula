import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        ingredient: {
          select: {
            name: true,
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // ล่าสุด 50 รายการ
    });
    
    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    );
  }
}
