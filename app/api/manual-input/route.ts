import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, periodType, granularity, currency, timezone, metrics, channelData, mapping } = body;

    // Verify company ownership
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        user: { email: session.user.email },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Validate metrics
    const validationErrors = validateMetrics(metrics);
    if (validationErrors.filter((e) => e.severity === 'error').length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors: validationErrors }, { status: 400 });
    }

    // Delete existing manual inputs for this company
    await prisma.manualInput.deleteMany({
      where: { companyId },
    });

    // Delete existing channel inputs
    await prisma.manualChannelInput.deleteMany({
      where: { companyId },
    });

    // Save manual inputs
    for (const metric of metrics) {
      await prisma.manualInput.create({
        data: {
          companyId,
          periodType,
          granularity,
          periodIndex: metric.periodIndex,
          periodDate: new Date(metric.periodDate),
          periodLabel: metric.periodLabel,
          sessions: metric.sessions,
          users: metric.users,
          clicks: metric.clicks,
          impressions: metric.impressions,
          organicSessions: metric.organicSessions,
          paidSessions: metric.paidSessions,
          leads: metric.leads,
          deals: metric.deals,
          sales: metric.sales,
          revenue: metric.revenue,
          adSpend: metric.adSpend,
          totalBudget: metric.totalBudget,
          repeatSales: metric.repeatSales,
          cogs: metric.cogs,
        },
      });
    }

    // Save channel inputs and calculate channel snapshots
    if (channelData && channelData.length > 0) {
      // Delete existing channel snapshots
      await prisma.manualChannelSnapshot.deleteMany({
        where: { companyId },
      });

      // Save individual channel inputs
      for (const channel of channelData) {
        await prisma.manualChannelInput.create({
          data: {
            companyId,
            periodType,
            periodIndex: channel.periodIndex,
            periodLabel: channel.periodLabel,
            channelName: channel.channelName,
            channelType: channel.channelType,
            sessions: channel.sessions,
            clicks: channel.clicks,
            impressions: channel.impressions,
            leads: channel.leads,
            adSpend: channel.adSpend,
          },
        });
      }

      // Aggregate channel data by channel name
      const channelTotals: Record<string, any> = {};
      for (const ch of channelData) {
        if (!channelTotals[ch.channelName]) {
          channelTotals[ch.channelName] = {
            channelName: ch.channelName,
            channelType: ch.channelType,
            sessions: 0,
            clicks: 0,
            impressions: 0,
            leads: 0,
            sales: 0,
            revenue: 0,
            adSpend: 0,
          };
        }
        channelTotals[ch.channelName].sessions += ch.sessions || 0;
        channelTotals[ch.channelName].clicks += ch.clicks || 0;
        channelTotals[ch.channelName].impressions += ch.impressions || 0;
        channelTotals[ch.channelName].leads += ch.leads || 0;
        channelTotals[ch.channelName].adSpend += ch.adSpend || 0;
      }

      // Calculate total sessions for share calculation
      const totalChannelSessions = Object.values(channelTotals).reduce((sum: number, ch: any) => sum + ch.sessions, 0);

      // Create channel snapshots
      for (const chName of Object.keys(channelTotals)) {
        const ch = channelTotals[chName];
        const cpc = ch.clicks > 0 ? ch.adSpend / ch.clicks : null;
        const cpl = ch.leads > 0 ? ch.adSpend / ch.leads : null;
        const cpm = ch.impressions > 0 ? (ch.adSpend / ch.impressions) * 1000 : null;
        const cr = ch.sessions > 0 ? (ch.leads / ch.sessions) * 100 : null;
        const shareOfTraffic = totalChannelSessions > 0 ? (ch.sessions / totalChannelSessions) * 100 : 0;

        await prisma.manualChannelSnapshot.create({
          data: {
            companyId,
            channelName: ch.channelName,
            channelType: ch.channelType,
            sessions: ch.sessions,
            clicks: ch.clicks,
            impressions: ch.impressions,
            leads: ch.leads,
            sales: ch.sales,
            revenue: ch.revenue,
            adSpend: ch.adSpend,
            cpc,
            cpl,
            cpm,
            cr,
            shareOfTraffic,
          },
        });
      }
    }

    // Calculate aggregated snapshot
    const snapshot = calculateManualSnapshot(metrics, periodType, granularity, currency, timezone, mapping);

    // Upsert manual snapshot
    await prisma.manualSnapshot.upsert({
      where: { companyId },
      create: {
        companyId,
        ...snapshot,
      },
      update: snapshot,
    });

    // Update daily metrics for charts
    await prisma.dailyMetrics.deleteMany({
      where: { companyId },
    });

    for (const metric of metrics) {
      await prisma.dailyMetrics.create({
        data: {
          companyId,
          date: new Date(metric.periodDate),
          sessions: metric.sessions || 0,
          leads: metric.leads || 0,
          sales: metric.sales || 0,
          revenue: metric.revenue || 0,
          adSpend: metric.adSpend || 0,
        },
      });
    }

    // Update regular snapshot for dashboard compatibility
    const now = new Date();
    const periodDays = periodType === '7days' ? 7 : periodType === '30days' ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - periodDays);

    await prisma.snapshot.deleteMany({
      where: { companyId },
    });

    await prisma.snapshot.create({
      data: {
        companyId,
        periodStart: startDate,
        periodEnd: now,
        granularity,
        sessions: snapshot.totalSessions,
        users: snapshot.totalUsers,
        leads: snapshot.totalLeads,
        deals: snapshot.totalDeals,
        sales: snapshot.totalSales,
        repeatSales: snapshot.totalRepeatSales,
        revenue: snapshot.totalRevenue,
        currency,
        orders: snapshot.totalSales,
        aov: snapshot.atp || 0,
        adSpend: snapshot.totalAdSpend,
        clicks: snapshot.totalClicks,
        impressions: snapshot.totalImpressions,
        crVisitLead: snapshot.crSessionLead,
        crLeadDeal: snapshot.crLeadDeal,
        crDealSale: snapshot.crDealSale,
        roas: snapshot.roas,
        cpa: snapshot.cac,
        cpl: snapshot.cpl,
        sources: ['manual_input'],
        dataQualityScore: snapshot.dataQualityScore,
        gateStatus: snapshot.gateStatus,
        isCurrent: true,
      },
    });

    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    console.error('Manual input error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const manualInputs = await prisma.manualInput.findMany({
      where: { companyId },
      orderBy: { periodIndex: 'asc' },
    });

    const manualSnapshot = await prisma.manualSnapshot.findUnique({
      where: { companyId },
    });

    const channelInputs = await prisma.manualChannelInput.findMany({
      where: { companyId },
      orderBy: [{ channelName: 'asc' }, { periodIndex: 'asc' }],
    });

    return NextResponse.json({ manualInputs, manualSnapshot, channelInputs });
  } catch (error) {
    console.error('Get manual input error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

function validateMetrics(metrics: any[]): ValidationError[] {
  const errors: ValidationError[] = [];

  metrics.forEach((row, index) => {
    const label = row.periodLabel || `Period ${index + 1}`;

    if (row.sessions !== null && row.leads !== null && row.leads > row.sessions) {
      errors.push({
        field: `row-${index}-leads`,
        message: `${label}: Leads cannot exceed sessions`,
        severity: 'error',
      });
    }

    if (row.leads !== null && row.deals !== null && row.deals > row.leads) {
      errors.push({
        field: `row-${index}-deals`,
        message: `${label}: Deals cannot exceed leads`,
        severity: 'error',
      });
    }

    if (row.deals !== null && row.sales !== null && row.sales > row.deals) {
      errors.push({
        field: `row-${index}-sales`,
        message: `${label}: Sales cannot exceed deals`,
        severity: 'error',
      });
    }

    if (row.sales !== null && row.repeatSales !== null && row.repeatSales > row.sales) {
      errors.push({
        field: `row-${index}-repeatSales`,
        message: `${label}: Repeat sales cannot exceed total sales`,
        severity: 'error',
      });
    }

    if (row.sales !== null && row.sales > 0 && (row.revenue === null || row.revenue === 0)) {
      errors.push({
        field: `row-${index}-revenue`,
        message: `${label}: Revenue is 0 but sales > 0`,
        severity: 'error',
      });
    }
  });

  return errors;
}

function calculateManualSnapshot(
  metrics: any[],
  periodType: string,
  granularity: string,
  currency: string,
  timezone: string,
  mapping: any
) {
  // Aggregate totals
  const totals = metrics.reduce(
    (acc, m) => {
      acc.sessions += m.sessions || 0;
      acc.users += m.users || 0;
      acc.clicks += m.clicks || 0;
      acc.impressions += m.impressions || 0;
      acc.organicSessions += m.organicSessions || 0;
      acc.paidSessions += m.paidSessions || 0;
      acc.leads += m.leads || 0;
      acc.deals += m.deals || 0;
      acc.sales += m.sales || 0;
      acc.repeatSales += m.repeatSales || 0;
      acc.revenue += m.revenue || 0;
      acc.adSpend += m.adSpend || 0;
      acc.totalBudget += m.totalBudget || 0;
      acc.cogs += m.cogs || 0;
      return acc;
    },
    {
      sessions: 0,
      users: 0,
      clicks: 0,
      impressions: 0,
      organicSessions: 0,
      paidSessions: 0,
      leads: 0,
      deals: 0,
      sales: 0,
      repeatSales: 0,
      revenue: 0,
      adSpend: 0,
      totalBudget: 0,
      cogs: 0,
    }
  );

  // Количество дней в периоде
  const periodDays = periodType === '7days' ? 7 : periodType === '30days' ? 30 : 90;

  // ========== КОНВЕРСИИ ВОРОНКИ ПРОДАЖ ==========
  // CR: Sessions → Leads (Посетители → Лиды)
  const crSessionLead = totals.sessions > 0 ? (totals.leads / totals.sessions) * 100 : null;
  // CR: Leads → Deals (Лиды → Сделки)
  const crLeadDeal = totals.leads > 0 ? (totals.deals / totals.leads) * 100 : null;
  // CR: Deals → Sales (Сделки → Продажи)
  const crDealSale = totals.deals > 0 ? (totals.sales / totals.deals) * 100 : null;
  // CR: Sessions → Sales (Сквозная конверсия)
  const crSessionSale = totals.sessions > 0 ? (totals.sales / totals.sessions) * 100 : null;
  // CR: Clicks → Leads
  const crClickLead = totals.clicks > 0 ? (totals.leads / totals.clicks) * 100 : null;

  // ========== СТОИМОСТЬ ЗА ДЕЙСТВИЕ (КАНАЛЫ) ==========
  // CPC (Cost Per Click) = Расход / Клики
  const cpc = totals.clicks > 0 ? totals.adSpend / totals.clicks : null;
  // CPU (Cost Per User) = Расход / Пользователи
  const cpu = totals.users > 0 ? totals.adSpend / totals.users : null;
  // CPL (Cost Per Lead) = Расход / Лиды
  const cpl = totals.leads > 0 ? totals.adSpend / totals.leads : null;
  // CPD (Cost Per Deal) = Расход / Сделки
  const cpd = totals.deals > 0 ? totals.adSpend / totals.deals : null;
  // CPS (Cost Per Sale) = Расход / Продажи (= CAC)
  const cps = totals.sales > 0 ? totals.adSpend / totals.sales : null;
  // CPM (Cost Per Mille) = (Расход / Показы) * 1000
  const cpm = totals.impressions > 0 ? (totals.adSpend / totals.impressions) * 1000 : null;

  // ========== ФИНАНСОВЫЕ МЕТРИКИ ==========
  // ROI = (Доход - Расход) / Расход * 100%
  const roi = totals.adSpend > 0 ? ((totals.revenue - totals.adSpend) / totals.adSpend) * 100 : null;
  // ROMI = (Дополнительный доход - маркетинговые затраты) / маркетинговые затраты * 100%
  // Для упрощения считаем ROMI как ROI для маркетинга
  const romi = totals.adSpend > 0 ? ((totals.revenue - totals.adSpend) / totals.adSpend) * 100 : null;
  // ROAS = Доход / Расходы (Revenue / Ad Spend)
  const roas = totals.adSpend > 0 ? totals.revenue / totals.adSpend : null;
  // Валовая прибыль = Revenue - COGS
  const grossProfit = totals.revenue - totals.cogs;
  // Чистая прибыль = Revenue - COGS - AdSpend
  const netProfit = totals.revenue - totals.cogs - totals.adSpend;
  // Repeat Rate = RepeatSales / Sales * 100
  const repeatRate = totals.sales > 0 ? (totals.repeatSales / totals.sales) * 100 : null;

  // ========== КЛИЕНТСКАЯ АНАЛИТИКА ==========
  // ATP (Average Transaction Price / Средний чек) = Revenue / Sales
  const atp = totals.sales > 0 ? totals.revenue / totals.sales : null;
  // SPH (Sales Per Head / Доход на клиента) = Revenue / Users
  const sph = totals.users > 0 ? totals.revenue / totals.users : null;
  // CAC (Customer Acquisition Cost) = AdSpend / Sales
  const cac = totals.sales > 0 ? totals.adSpend / totals.sales : null;
  // LTV (Lifetime Value) = ATP * Среднее кол-во покупок
  // Для упрощения: LTV = ATP * (1 + repeatRate/100)
  const avgPurchases = repeatRate !== null ? 1 + repeatRate / 100 : 1;
  const ltv = atp !== null ? atp * avgPurchases : null;
  // EBITDA = Revenue - COGS - AdSpend
  const ebitda = netProfit;
  // EBITDA Margin = EBITDA / Revenue * 100
  const ebitdaMargin = totals.revenue > 0 ? (ebitda / totals.revenue) * 100 : null;
  // Gross Margin = (Revenue - COGS) / Revenue * 100
  const grossMargin = totals.revenue > 0 ? (grossProfit / totals.revenue) * 100 : null;

  // ========== CTR ==========
  // CTR (Click-Through Rate) = Clicks / Impressions * 100
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : null;

  // ========== ИСТОЧНИКИ ТРАФИКА ==========
  const totalTraffic = totals.organicSessions + totals.paidSessions;
  const organicTrafficShare = totalTraffic > 0 ? (totals.organicSessions / totalTraffic) * 100 : null;
  const paidTrafficShare = totalTraffic > 0 ? (totals.paidSessions / totalTraffic) * 100 : null;

  // ========== ДНЕВНЫЕ ПОКАЗАТЕЛИ ==========
  const dailySales = periodDays > 0 ? totals.sales / periodDays : null;
  const dailyRevenue = periodDays > 0 ? totals.revenue / periodDays : null;

  // ========== DATA QUALITY SCORE ==========
  let qualityScore = 0;
  const filledMetrics = metrics.filter(
    (m) => m.sessions !== null || m.leads !== null || m.sales !== null || m.revenue !== null
  );
  qualityScore += filledMetrics.length > 0 ? 30 : 0;
  qualityScore += totals.sessions > 0 ? 15 : 0;
  qualityScore += totals.leads > 0 ? 15 : 0;
  qualityScore += totals.sales > 0 ? 15 : 0;
  qualityScore += totals.revenue > 0 ? 15 : 0;
  qualityScore += totals.adSpend > 0 ? 10 : 0;

  return {
    dataMode: 'MANUAL_SANDBOX' as const,
    periodType,
    granularity,
    currency,
    timezone,
    periodDays,
    // Трафик
    totalSessions: totals.sessions,
    totalUsers: totals.users,
    totalPageviews: 0,
    totalClicks: totals.clicks,
    totalImpressions: totals.impressions,
    // Источники трафика
    totalOrganicSessions: totals.organicSessions,
    totalPaidSessions: totals.paidSessions,
    organicTrafficShare,
    paidTrafficShare,
    // Воронка
    totalLeads: totals.leads,
    totalDeals: totals.deals,
    totalSales: totals.sales,
    totalOrders: totals.sales,
    totalRepeatSales: totals.repeatSales,
    // Финансы
    totalRevenue: totals.revenue,
    totalRefunds: 0,
    totalAdSpend: totals.adSpend,
    totalBudget: totals.totalBudget || totals.adSpend,
    totalCogs: totals.cogs,
    avgAov: atp,
    dailySales,
    dailyRevenue,
    // Конверсии
    crSessionLead,
    crLeadDeal,
    crDealSale,
    crSessionSale,
    crClickLead,
    // Стоимость за действие
    cpc,
    cpu,
    cpl,
    cpd,
    cps,
    cpm,
    // Финансовые метрики
    roi,
    romi,
    roas,
    grossProfit,
    netProfit,
    repeatRate,
    // Клиентская аналитика
    atp,
    sph,
    ltv,
    cac,
    ebitda,
    ebitdaMargin,
    avgGrossMargin: grossMargin,
    grossMargin,
    // CTR
    ctr,
    // Data Quality
    dataQualityScore: qualityScore,
    gateStatus: 'SANDBOX',
    // Mapping
    saleEventType: mapping.saleEventType,
    leadEventType: mapping.leadEventType,
    dealEventType: mapping.dealEventType,
    repeatWindow: mapping.repeatWindow,
  };
}
