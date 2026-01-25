import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user with hashed password
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  const testPassword = await bcrypt.hash('password123', 10);

  // Create additional test user for automated tests
  await prisma.user.upsert({
    where: { email: 'test@gravora.ai' },
    update: {},
    create: {
      email: 'test@gravora.ai',
      password: testPassword,
      name: 'Test User',
      role: 'OWNER',
      workspace: {
        create: {
          name: "Test User's Workspace",
        },
      },
    },
  });

  console.log('Test user created: test@gravora.ai');

  // Create custom test user
  const customPassword = await bcrypt.hash('12345678Q!', 10);
  await prisma.user.upsert({
    where: { email: 'e.gr@gmail.com' },
    update: {},
    create: {
      email: 'e.gr@gmail.com',
      password: customPassword,
      name: 'E. Gr',
      role: 'OWNER',
      workspace: {
        create: {
          name: "E. Gr's Workspace",
        },
      },
    },
  });

  console.log('Custom test user created: e.gr@gmail.com');

  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'OWNER',
      workspace: {
        create: {
          name: "John's Workspace",
        },
      },
    },
    include: {
      workspace: true,
    },
  });

  console.log('✅ Test user created:', user.email);

  // Create a demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-001' },
    update: {},
    create: {
      id: 'demo-company-001',
      name: 'Tech Solutions LLC',
      legalForm: 'OOO',
      country: 'Казахстан',
      city: 'Алматы',
      industry: 'SaaS',
      salesModel: 'SUBSCRIPTION',
      website: 'https://techsolutions.kz',
      email: 'info@techsolutions.kz',
      completionPercent: 80,
      status: 'ACTIVE',
      userId: user.id,
    },
  });

  console.log('✅ Demo company created:', company.name);

  // Create business context
  await prisma.businessContext.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      goals: ['REVENUE_GROWTH', 'MARKET_SHARE'],
      budgetMin: 5000,
      budgetMax: 20000,
      teamSize: 15,
      geography: ['Казахстан', 'Россия'],
      saleEventType: 'deal_won',
    },
  });

  console.log('✅ Business context created');

  // Create integrations
  await prisma.integration.createMany({
    data: [
      {
        companyId: company.id,
        type: 'GRAVORA_TAG',
        name: 'Gravora Tag',
        status: 'CONNECTED',
      },
      {
        companyId: company.id,
        type: 'BITRIX24',
        name: 'Bitrix24',
        status: 'CONNECTED',
      },
      {
        companyId: company.id,
        type: 'GOOGLE_ADS',
        name: 'Google Ads',
        status: 'PENDING',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Integrations created');

  // Create snapshot
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.snapshot.upsert({
    where: { id: 'demo-snapshot-001' },
    update: {},
    create: {
      id: 'demo-snapshot-001',
      companyId: company.id,
      periodStart: startOfMonth,
      periodEnd: now,
      granularity: 'day',
      sessions: 12500,
      users: 9800,
      leads: 625,
      deals: 125,
      sales: 62,
      repeatSales: 15,
      revenue: 62000,
      currency: 'USD',
      orders: 62,
      aov: 1000,
      adSpend: 12000,
      clicks: 6200,
      impressions: 125000,
      revenueFromAds: 45000,
      crVisitLead: 5.0,
      crLeadDeal: 20.0,
      crDealSale: 49.6,
      roas: 3.75,
      cpa: 193.5,
      cpl: 19.2,
      sources: ['gravora_tag', 'crm_bitrix'],
      dataQualityScore: 78,
      gateStatus: 'B',
      isCurrent: true,
    },
  });

  console.log('✅ Snapshot created');

  // Create data gaps
  await prisma.dataGap.createMany({
    data: [
      {
        companyId: company.id,
        severity: 'IMPORTANT',
        area: 'SPEND',
        status: 'MISSING_SOURCE',
        whatIsMissing: 'Не подключены рекламные кабинеты',
        impact: 'ROAS, CPA, CPL могут быть неточными',
        fixSteps: ['Подключите Google Ads', 'Подключите Meta Ads'],
        ctaAction: 'CONNECT_ADS',
      },
      {
        companyId: company.id,
        severity: 'OPTIONAL',
        area: 'COGS',
        status: 'MISSING_SOURCE',
        whatIsMissing: 'Нет данных по себестоимости',
        impact: 'Gross Profit и маржинальность будут N/A',
        fixSteps: ['Подключите BI или загрузите Google Sheet'],
        ctaAction: 'CONNECT_BI',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Data gaps created');

  // Create AI insights
  await prisma.aIInsight.createMany({
    data: [
      {
        companyId: company.id,
        agentType: 'ANALYST',
        title: 'Узкое место: Конверсия лид-сделка',
        description:
          'Ваш CR (20%) ниже среднего по отрасли (35%). Рекомендация: настройте автоответ на заявки и улучшите скорость обработки.',
        category: 'bottleneck',
        priority: 1,
      },
      {
        companyId: company.id,
        agentType: 'DATA_AUDITOR',
        title: 'Качество данных: 78%',
        description:
          'Для повышения точности стратегии рекомендуем подключить рекламные кабинеты для расчёта реального ROAS.',
        category: 'recommendation',
        priority: 2,
      },
      {
        companyId: company.id,
        agentType: 'ANALYST',
        title: 'Quick Win: Средний чек',
        description:
          'AOV $1,000 — выше среднего по нише. Рассмотрите upsell-стратегию для увеличения до $1,200.',
        category: 'quick_win',
        priority: 3,
      },
      {
        companyId: company.id,
        agentType: 'ANALYST',
        title: 'Повторные покупки: 24%',
        description:
          'Хороший показатель для SaaS. Рекомендуем запустить программу лояльности.',
        category: 'recommendation',
        priority: 4,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ AI insights created');

  // Create daily metrics for charts
  const dailyMetricsData = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    dailyMetricsData.push({
      companyId: company.id,
      date,
      sessions: Math.floor(350 + Math.random() * 150),
      leads: Math.floor(18 + Math.random() * 8),
      sales: Math.floor(1 + Math.random() * 4),
      revenue: Math.floor(1500 + Math.random() * 1500),
      adSpend: Math.floor(300 + Math.random() * 200),
    });
  }

  // Delete existing daily metrics for this company to avoid duplicates
  await prisma.dailyMetrics.deleteMany({
    where: { companyId: company.id },
  });

  await prisma.dailyMetrics.createMany({
    data: dailyMetricsData,
  });

  console.log('✅ Daily metrics created');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
