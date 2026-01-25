export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const userId = (session.user as any)?.id;

    const company = await prisma.company.create({
      data: {
        name: body?.name ?? '',
        legalForm: body?.legalForm ?? null,
        country: body?.country ?? null,
        city: body?.city ?? null,
        industry: body?.industry ?? null,
        salesModel: body?.salesModel ?? null,
        website: body?.website ?? null,
        email: body?.email ?? null,
        phone: body?.phone ?? null,
        completionPercent: body?.completionPercent ?? 0,
        userId,
      },
    });

    return NextResponse.json(
      {
        company_id: company.id,
        name: company.name,
        status: company.status,
        completion_percentage: company.completionPercent,
        created_at: company.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any)?.id;
    const companies = await prisma.company.findMany({
      where: { userId },
      include: {
        businessContext: true,
        integrations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}
