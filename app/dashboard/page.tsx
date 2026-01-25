import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardContent from '@/components/dashboard/dashboard-content';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userId = (session.user as any)?.id;

  // Get user's company with all related data
  const company = await prisma.company.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      businessContext: true,
      integrations: true,
      snapshots: {
        where: { isCurrent: true },
        take: 1,
      },
      dataGaps: {
        where: { isResolved: false },
        orderBy: { severity: 'asc' },
      },
      insights: {
        where: { isRead: false },
        orderBy: { priority: 'asc' },
        take: 5,
      },
    },
  });

  if (!company) {
    redirect('/onboarding');
  }

  // Get daily metrics for charts
  const dailyMetrics = await prisma.dailyMetrics.findMany({
    where: { companyId: company.id },
    orderBy: { date: 'asc' },
    take: 30,
  });

  // Get manual snapshot with channel data
  const manualSnapshot = await prisma.manualSnapshot.findFirst({
    where: { companyId: company.id },
    orderBy: { createdAt: 'desc' },
  });

  // Get channel snapshots
  const channelSnapshots = await prisma.manualChannelSnapshot.findMany({
    where: { companyId: company.id },
    orderBy: { shareOfTraffic: 'desc' },
  });

  return (
    <DashboardContent
      company={company}
      snapshot={company.snapshots?.[0] ?? null}
      manualSnapshot={manualSnapshot}
      channelSnapshots={channelSnapshots}
      dataGaps={company.dataGaps ?? []}
      insights={company.insights ?? []}
      dailyMetrics={dailyMetrics ?? []}
      user={session.user}
    />
  );
}
