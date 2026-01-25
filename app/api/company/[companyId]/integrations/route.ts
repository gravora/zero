export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

const INTEGRATION_NAMES: Record<string, string> = {
  GRAVORA_TAG: 'Gravora Tag',
  GA4: 'Google Analytics 4',
  BITRIX24: 'Bitrix24',
  AMOCRM: 'AmoCRM',
  HUBSPOT: 'HubSpot',
  GOOGLE_ADS: 'Google Ads',
  META_ADS: 'Meta Ads',
  ROISTAT: 'Roistat',
  CALLTOUCH: 'Calltouch',
  GOOGLE_SHEETS: 'Google Sheets',
  EXCEL_IMPORT: 'Excel Import',
};

export async function POST(
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
    const integrations = body?.integrations ?? [];

    // Delete existing integrations
    await prisma.integration.deleteMany({
      where: { companyId },
    });

    // Create new integrations
    const created = await Promise.all(
      integrations.map((type: string) =>
        prisma.integration.create({
          data: {
            companyId,
            type: type as any,
            name: INTEGRATION_NAMES[type] ?? type,
            status: 'PENDING',
          },
        })
      )
    );

    return NextResponse.json({ integrations: created }, { status: 200 });
  } catch (error) {
    console.error('Save integrations error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}

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

    const integrations = await prisma.integration.findMany({
      where: { companyId: params?.companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ integrations }, { status: 200 });
  } catch (error) {
    console.error('Get integrations error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}
