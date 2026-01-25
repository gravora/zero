export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

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

    const companyId = params?.companyId;

    // Activate company
    await prisma.company.update({
      where: { id: companyId },
      data: { status: 'ACTIVE' },
    });

    // Create initial snapshot with demo data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    await prisma.snapshot.create({
      data: {
        companyId,
        periodStart: startOfMonth,
        periodEnd: now,
        granularity: 'day',
        sessions: 10000,
        users: 8500,
        leads: 500,
        deals: 100,
        sales: 50,
        repeatSales: 10,
        revenue: 50000,
        currency: 'USD',
        orders: 50,
        aov: 1000,
        adSpend: 10000,
        clicks: 5000,
        impressions: 100000,
        revenueFromAds: 30000,
        crVisitLead: 5.0,
        crLeadDeal: 20.0,
        crDealSale: 50.0,
        roas: 3.0,
        cpa: 200,
        cpl: 20,
        sources: ['gravora_tag', 'crm_bitrix'],
        dataQualityScore: 75,
        gateStatus: 'B',
        isCurrent: true,
      },
    });

    // Create initial data gaps
    await prisma.dataGap.createMany({
      data: [
        {
          companyId,
          severity: 'IMPORTANT',
          area: 'SPEND',
          status: 'MISSING_SOURCE',
          whatIsMissing: 'Не подключены рекламные кабинеты',
          impact: 'ROAS, CPA, CPL будут недоступны',
          fixSteps: ['Подключите Google Ads или Meta Ads'],
          ctaAction: 'CONNECT_ADS',
        },
        {
          companyId,
          severity: 'OPTIONAL',
          area: 'COGS',
          status: 'MISSING_SOURCE',
          whatIsMissing: 'Нет данных по себестоимости',
          impact: 'Gross Profit и маржинальность будут N/A',
          fixSteps: ['Подключите BI или загрузите Google Sheet'],
          ctaAction: 'CONNECT_BI',
        },
      ],
    });

    // Create initial AI insights
    await prisma.aIInsight.createMany({
      data: [
        {
          companyId,
          agentType: 'ANALYST',
          title: 'Узкое место: Конверсия лид-сделка',
          description:
            'Ваш CR (20%) в 1.75 раз ниже среднего по отрасли (35%). Рекомендация: настройте автоответ на заявки.',
          category: 'bottleneck',
          priority: 1,
        },
        {
          companyId,
          agentType: 'DATA_AUDITOR',
          title: 'Качество данных: 75%',
          description:
            'Для повышения точности стратегии рекомендуем подключить рекламные кабинеты.',
          category: 'recommendation',
          priority: 2,
        },
        {
          companyId,
          agentType: 'ANALYST',
          title: 'Quick Win: AOV',
          description:
            'Средний чек $1,000 — выше среднего. Рассмотрите upsell-стратегию.',
          category: 'quick_win',
          priority: 3,
        },
      ],
    });

    // Create daily metrics for chart
    const dailyMetrics = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      dailyMetrics.push({
        companyId,
        date,
        sessions: Math.floor(300 + Math.random() * 200),
        leads: Math.floor(15 + Math.random() * 10),
        sales: Math.floor(1 + Math.random() * 3),
        revenue: Math.floor(1000 + Math.random() * 2000),
        adSpend: Math.floor(200 + Math.random() * 200),
      });
    }

    await prisma.dailyMetrics.createMany({
      data: dailyMetrics,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Activate company error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Ошибка сервера' } },
      { status: 500 }
    );
  }
}
