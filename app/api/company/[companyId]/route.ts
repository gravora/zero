export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(
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

    const company = await prisma.company.findUnique({
      where: { id: params?.companyId },
      include: {
        businessContext: true,
        integrations: true,
        snapshots: {
          where: { isCurrent: true },
          take: 1,
        },
        dataGaps: {
          where: { isResolved: false },
        },
        insights: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Компания не найдена' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}

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

    const company = await prisma.company.update({
      where: { id: params?.companyId },
      data: {
        name: body?.name,
        legalForm: body?.legalForm,
        country: body?.country,
        city: body?.city,
        industry: body?.industry,
        salesModel: body?.salesModel,
        website: body?.website,
        email: body?.email,
        phone: body?.phone,
        completionPercent: body?.completionPercent,
      },
    });

    return NextResponse.json(
      {
        company_id: company.id,
        name: company.name,
        status: company.status,
        completion_percentage: company.completionPercent,
        updated_at: company.updatedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.company.delete({
      where: { id: params?.companyId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}
