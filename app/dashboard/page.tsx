'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardContent from '@/components/dashboard/dashboard-content';
import { authAPI, tokenStorage, aiAPI, snapshotAPI, companyAPI, GravoraAPIError } from '@/lib/gravora-api';
import type { UserOut, AIInsightsResponse, AIOrchestrateResponse, SnapshotBuildResponse } from '@/lib/gravora-api';

interface DashboardState {
  loading: boolean;
  error: string | null;
  user: UserOut | null;
  companyId: string | null;
  insights: AIInsightsResponse | null;
  snapshotId: string | null;
  orchestrateStatus: 'idle' | 'running' | 'completed' | 'error';
  orchestrateResult: AIOrchestrateResponse | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    user: null,
    companyId: null,
    insights: null,
    snapshotId: null,
    orchestrateStatus: 'idle',
    orchestrateResult: null,
  });

  // Check auth and load initial data
  useEffect(() => {
    const initDashboard = async () => {
      // Check if authenticated
      if (!authAPI.isAuthenticated()) {
        router.replace('/auth/login');
        return;
      }

      try {
        // Get user info
        let user = tokenStorage.getUser();
        if (!user) {
          user = await authAPI.me();
          tokenStorage.setUser(user);
        }

        // Get or create company
        let companyId = tokenStorage.getCompanyId();
        if (!companyId) {
          // Create company for new user
          const companyResult = await companyAPI.create();
          companyId = companyResult.company_id;
          tokenStorage.setCompanyId(companyId);
        }

        // Load insights
        let insights: AIInsightsResponse | null = null;
        try {
          insights = await aiAPI.getInsights(companyId);
        } catch (err) {
          // Insights may not exist yet - that's okay
          console.log('No insights yet');
        }

        setState(prev => ({
          ...prev,
          loading: false,
          user,
          companyId,
          insights,
        }));
      } catch (err) {
        if (err instanceof GravoraAPIError && err.status === 401) {
          tokenStorage.clear();
          router.replace('/auth/login');
          return;
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Ошибка загрузки данных',
        }));
      }
    };

    initDashboard();
  }, [router]);

  // Build snapshot
  const handleBuildSnapshot = async () => {
    if (!state.companyId) return;

    setState(prev => ({ ...prev, orchestrateStatus: 'running' }));

    try {
      const result = await snapshotAPI.build(state.companyId);
      setState(prev => ({
        ...prev,
        snapshotId: result.snapshot_id,
      }));
      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        orchestrateStatus: 'error',
        error: err instanceof Error ? err.message : 'Ошибка создания снапшота',
      }));
      throw err;
    }
  };

  // Run AI Orchestrator
  const handleRunOrchestrate = async (message?: string) => {
    if (!state.companyId) return;

    setState(prev => ({ ...prev, orchestrateStatus: 'running', error: null }));

    try {
      // First build snapshot if not exists
      let snapshotId = state.snapshotId;
      if (!snapshotId) {
        const snapshotResult = await handleBuildSnapshot();
        snapshotId = snapshotResult?.snapshot_id ?? null;
      }

      // Run orchestrate
      const result = await aiAPI.orchestrate(state.companyId, snapshotId ?? undefined, message);
      
      // Reload insights after orchestrate
      const insights = await aiAPI.getInsights(state.companyId);

      setState(prev => ({
        ...prev,
        orchestrateStatus: 'completed',
        orchestrateResult: result,
        snapshotId: result.snapshot_id,
        insights,
      }));

      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        orchestrateStatus: 'error',
        error: err instanceof Error ? err.message : 'Ошибка AI анализа',
      }));
    }
  };

  // Handle logout
  const handleLogout = () => {
    authAPI.logout();
    router.replace('/auth/login');
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1225]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400">Загрузка платформы...</div>
        </div>
      </div>
    );
  }

  if (state.error && !state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1225]">
        <div className="text-center glass-effect p-8 rounded-xl max-w-md">
          <div className="text-red-400 mb-4">{state.error}</div>
          <button
            onClick={() => router.replace('/auth/login')}
            className="btn-primary"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContent
      user={state.user}
      companyId={state.companyId}
      insights={state.insights}
      orchestrateStatus={state.orchestrateStatus}
      orchestrateResult={state.orchestrateResult}
      error={state.error}
      onRunOrchestrate={handleRunOrchestrate}
      onBuildSnapshot={handleBuildSnapshot}
      onLogout={handleLogout}
    />
  );
}
