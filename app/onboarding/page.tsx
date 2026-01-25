import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import OnboardingFlow from '@/components/screens/onboarding-flow';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Check if user already has a company
  const userId = (session.user as any)?.id;
  const existingCompany = await prisma.company.findFirst({
    where: { userId },
    include: { businessContext: true },
  });

  if (existingCompany?.status === 'ACTIVE') {
    redirect('/dashboard');
  }

  return <OnboardingFlow userId={userId} existingCompany={existingCompany} />;
}
