'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ManualInputFlow from '@/components/screens/manual-input-flow';

export default function ManualInputPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/company')
        .then((res) => res.json())
        .then((data) => {
          if (data.companies && data.companies.length > 0) {
            setCompany(data.companies[0]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0D1321] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4FF]"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0D1321] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Сначала создайте компанию</h2>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-[#0D1321] font-semibold rounded-lg"
          >
            Создать компанию
          </button>
        </div>
      </div>
    );
  }

  return <ManualInputFlow company={company} />;
}
