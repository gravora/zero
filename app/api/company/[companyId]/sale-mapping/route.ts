export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const companyId = params?.companyId;

    const existing = await prisma.businessContext.findUnique({
      where: { companyId },
    });

    let context;
    if (existing) {
      context = await prisma.businessContext.update({
        where: { companyId },
        data: {
          saleEventType: body?.saleEventType ?? null,
        },
      });
    } else {
      context = await prisma.businessContext.create({
        data: {
          companyId,
          saleEventType: body?.saleEventType ?? null,
          goals: [],
        },
      });
    }

    return NextResponse.json({ context }, { status: 200 });
  } catch (error) {
    console.error('Save sale mapping error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}
