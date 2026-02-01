'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ManualInputFlow from '@/components/screens/manual-input-flow';
import { authAPI, tokenStorage, companyAPI } from '@/lib/gravora-api';

export default function ManualInputPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Check auth
      if (!authAPI.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      // Get or create company
      let cid = tokenStorage.getCompanyId();
      if (!cid) {
        try {
          const result = await companyAPI.create();
          cid = result.company_id;
          tokenStorage.setCompanyId(cid);
        } catch (err) {
          console.error('Failed to create company:', err);
          router.push('/auth/login');
          return;
        }
      }

      setCompanyId(cid);
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1321] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4FF]"></div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen bg-[#0D1321] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ошибка загрузки</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-[#0D1321] font-semibold rounded-lg"
          >
            Вернуться на дашборд
          </button>
        </div>
      </div>
    );
  }

  return <ManualInputFlow companyId={companyId} />;
}
